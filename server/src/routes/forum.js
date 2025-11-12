const express = require('express');
const {
  query,
  insertRecord,
  tableExists,
  getTableColumns,
  getTableColumnDetails,
  deleteRecord,
} = require('../database');
const { requireAuth } = require('../middleware/auth');
const { normalizeDate, parseTags, stringifyTags } = require('../utils/formatters');
const { isAdminRole } = require('../utils/auth');
const { normalizeIdentifier, normalizeValueForColumn } = require('../utils/db');
const {
  listTopics: listFallbackTopics,
  getTopicSummary: getFallbackTopicSummary,
  listPosts: listFallbackPosts,
  createTopic: createFallbackTopic,
  createPost: createFallbackPost,
  deletePost: deleteFallbackPost,
  toggleLike: toggleFallbackLike,
  resolveAuthorName: resolveFallbackAuthorName,
} = require('../data/forumFallback');

const router = express.Router();

const BACKTICK = '`';
const quoteIdentifier = (value) => BACKTICK + value + BACKTICK;
const qualifyColumn = (alias, column) => alias + '.' + quoteIdentifier(column);
const buildSelectFragment = (alias, column, asAlias, fallback) => {
  if (column === null || column === undefined) {
    return fallback || 'NULL AS ' + asAlias;
  }
  return qualifyColumn(alias, column) + ' AS ' + asAlias;
};

const TOPIC_TABLE = 'forum_topics';
const POST_TABLE_CANDIDATES = ['forum_posts', 'forum_comments'];
const LIKE_TABLE_CANDIDATES = ['forum_topic_likes', 'forum_likes'];

const resolveColumn = (columns, candidates) => candidates.find((column) => columns.has(column)) || null;

const getDefaultUserId = async () => {
  if (!(await tableExists('users'))) {
    return null;
  }

  const userColumns = await getTableColumns('users');
  if (userColumns.size === 0) {
    return null;
  }

  const idColumn = resolveColumn(userColumns, ['id', 'user_id']);
  if (!idColumn) {
    return null;
  }

  const orderColumn =
    resolveColumn(userColumns, ['updated_at', 'update_time']) ||
    resolveColumn(userColumns, ['created_at', 'create_time']) ||
    idColumn;

  const rows = await query(
    'SELECT ' + qualifyColumn('u', idColumn) + ' AS id FROM users u ORDER BY ' + qualifyColumn('u', orderColumn) + ' ASC LIMIT 1',
  );

  const identifier = rows[0]?.id;
  return identifier != null ? normalizeIdentifier(identifier) : null;
};

const buildInClause = (values = [], prefix = 'p') => {
  if (!Array.isArray(values) || values.length === 0) {
    return { clause: '', params: {} };
  }

  const params = {};
  const placeholders = values.map((value, index) => {
    const key = `${prefix}_${index}`;
    params[key] = value;
    return `:${key}`;
  });

  return { clause: placeholders.join(', '), params };
};

const getForumTopicConfig = async () => {
  const tableName = TOPIC_TABLE;
  const columns = await getTableColumns(tableName);

  if (columns.size === 0) {
    return null;
  }

  const columnDetails = await getTableColumnDetails(tableName);

  return {
    tableName,
    columns,
    columnDetails,
    id: resolveColumn(columns, ['id', 'topic_id']),
    title: resolveColumn(columns, ['title', 'name', 'subject']),
    description: resolveColumn(columns, ['description', 'summary', 'content']),
    authorId: resolveColumn(columns, ['author_id', 'user_id', 'creator_id']),
    tags: resolveColumn(columns, ['tags', 'tags_json', 'tag_list']),
    createdAt: resolveColumn(columns, ['created_at', 'create_time']),
    updatedAt: resolveColumn(columns, ['updated_at', 'update_time']),
  };
};

const getForumPostConfig = async () => {
  for (const tableName of POST_TABLE_CANDIDATES) {
    const columns = await getTableColumns(tableName);

    if (columns.size === 0) {
      continue;
    }

    const columnDetails = await getTableColumnDetails(tableName);

    return {
      tableName,
      columns,
      columnDetails,
      id: resolveColumn(columns, ['id', 'post_id', 'comment_id']),
      topicId: resolveColumn(columns, ['topic_id', 'forum_topic_id', 'topicId']),
      content: resolveColumn(columns, ['content', 'body', 'description']),
      authorId: resolveColumn(columns, ['author_id', 'user_id', 'creator_id']),
      createdAt: resolveColumn(columns, ['created_at', 'create_time']),
      updatedAt: resolveColumn(columns, ['updated_at', 'update_time']),
    };
  }

  return null;
};

const getForumLikeConfig = async () => {
  for (const tableName of LIKE_TABLE_CANDIDATES) {
    const columns = await getTableColumns(tableName);

    if (columns.size === 0) {
      continue;
    }

    const columnDetails = await getTableColumnDetails(tableName);

    return {
      tableName,
      columns,
      columnDetails,
      id: resolveColumn(columns, ['id', 'like_id']),
      topicId: resolveColumn(columns, ['topic_id', 'forum_topic_id', 'topicId']),
      userId: resolveColumn(columns, ['user_id', 'member_id', 'author_id']),
      createdAt: resolveColumn(columns, ['created_at', 'create_time']),
      updatedAt: resolveColumn(columns, ['updated_at', 'update_time']),
    };
  }

  return null;
};

const getUserJoinConfig = async (alias = 'u') => {
  if (!(await tableExists('users'))) {
    return null;
  }

  const columns = await getTableColumns('users');
  if (columns.size === 0) {
    return null;
  }

  const userIdColumn = resolveColumn(columns, ['id', 'user_id']);
  const displayColumn = resolveColumn(columns, ['display_name', 'name', 'full_name']);
  const usernameColumn = resolveColumn(columns, ['username', 'user_name', 'account']);

  if (!displayColumn && !usernameColumn) {
    return null;
  }

  const pieces = [];
  if (displayColumn) {
    pieces.push(qualifyColumn(alias, displayColumn));
  }
  if (usernameColumn) {
    pieces.push(qualifyColumn(alias, usernameColumn));
  }

  const select = `COALESCE(${pieces.join(', ')}, '匿名用户') AS author`;

  return {
    select,
    userIdColumn,
    alias,
  };
};

const createTopicPayload = (config, { title, description, authorId, tags }) => {
  const payload = {};

  if (config.title) {
    payload[config.title] = normalizeValueForColumn(config.columnDetails, config.title, title);
  }

  if (config.description) {
    payload[config.description] = normalizeValueForColumn(
      config.columnDetails,
      config.description,
      description ?? null,
    );
  }

  if (config.tags) {
    payload[config.tags] = normalizeValueForColumn(
      config.columnDetails,
      config.tags,
      stringifyTags(tags),
    );
  }

  if (config.authorId) {
    const normalized = normalizeIdentifier(authorId);
    payload[config.authorId] = normalizeValueForColumn(
      config.columnDetails,
      config.authorId,
      normalized,
    );
  }

  return payload;
};

const createPostPayload = (config, { topicId, content, authorId }) => {
  const payload = {};

  if (config.topicId) {
    payload[config.topicId] = normalizeValueForColumn(
      config.columnDetails,
      config.topicId,
      topicId,
    );
  }

  if (config.content) {
    payload[config.content] = normalizeValueForColumn(
      config.columnDetails,
      config.content,
      content,
    );
  }

  if (config.authorId) {
    const normalized = normalizeIdentifier(authorId);
    payload[config.authorId] = normalizeValueForColumn(
      config.columnDetails,
      config.authorId,
      normalized,
    );
  }

  return payload;
};

const createLikePayload = (config, { topicId, userId }) => {
  const payload = {};

  if (config.topicId) {
    payload[config.topicId] = normalizeValueForColumn(
      config.columnDetails,
      config.topicId,
      topicId,
    );
  }

  if (config.userId) {
    const normalized = normalizeIdentifier(userId);
    payload[config.userId] = normalizeValueForColumn(
      config.columnDetails,
      config.userId,
      normalized,
    );
  }

  return payload;
};

const formatTopicRow = (row, index = 0, extras = {}) => {
  const liked = Boolean(extras.likedByMe ?? extras.likedByUser ?? row.liked_by_me ?? false);

  return {
    id: row.id != null ? String(row.id) : String(index + 1),
    title: row.title || '未命名话题',
    description: row.description || '',
    author: row.author || '匿名用户',
    tags: parseTags(row.tags),
    createdAt: normalizeDate(row.created_at),
    updatedAt: normalizeDate(row.updated_at),
    replies: Number(extras.replies ?? row.replies ?? row.reply_count ?? 0),
    likes: Number(extras.likes ?? row.likes ?? row.like_count ?? 0),
    likedByMe: liked,
    likedByUser: liked,
  };
};

const formatPostRow = (row, index = 0, extras = {}) => ({
  id: row.id != null ? String(row.id) : String(index + 1),
  content: row.content || '',
  author: row.author || '匿名用户',
  createdAt: normalizeDate(row.created_at),
  updatedAt: normalizeDate(row.updated_at),
  ...extras,
});

const seedForumTopics = async (topicConfig) => {
  try {
    if (!topicConfig?.id || !topicConfig?.title) {
      return;
    }

    const existing = await query('SELECT COUNT(*) AS total FROM ' + quoteIdentifier(topicConfig.tableName));
    if (Number(existing[0]?.total) > 0) {
      return;
    }

    const topics = [
      {
        title: '初试经验交流',
        description: '分享全年复习规划、时间管理和自我调节心得，欢迎晒出你的复习进度表。',
        tags: ['规划', '经验'],
      },
      {
        title: '院校信息互助',
        description: '讨论目标院校专业课复习资料、复试要求与往年录取情况，共建情报库。',
        tags: ['院校', '信息'],
      },
      {
        title: '每日打卡与互励',
        description: '记录当天完成的任务、复盘心得或遇到的困难，互相监督保持节奏。',
        tags: ['打卡', '互励'],
      },
      {
        title: '复试准备与面试攻略',
        description: '整理复试题库、材料准备清单以及常见问答经验，提前做好规划。',
        tags: ['复试', '面试'],
      },
    ];

    let defaultAuthorId = null;
    if (topicConfig.authorId) {
      defaultAuthorId = await getDefaultUserId();
      const authorDetails = topicConfig.columnDetails?.get?.(topicConfig.authorId);
      if (!defaultAuthorId && authorDetails && authorDetails.isNullable === false) {
        console.warn('跳过论坛示例数据初始化：缺少可用的用户编号以填充作者字段');
        return;
      }
    }

    for (const topic of topics) {
      const payload = createTopicPayload(topicConfig, {
        ...topic,
        authorId: defaultAuthorId ?? topic.authorId ?? null,
      });

      if (topicConfig.authorId && (payload[topicConfig.authorId] === undefined || payload[topicConfig.authorId] === null)) {
        continue;
      }

      await insertRecord(topicConfig.tableName, payload);
    }
  } catch (error) {
    console.warn('初始化考研论坛示例数据失败', error.message);
  }
};

const countLikesForTopic = async (likeConfig, topicId) => {
  if (!likeConfig?.topicId) {
    return 0;
  }

  const normalizedTopicId = normalizeValueForColumn(
    likeConfig.columnDetails,
    likeConfig.topicId,
    normalizeIdentifier(topicId),
  );

  if (normalizedTopicId === null || normalizedTopicId === undefined) {
    return 0;
  }

  const likeTable = quoteIdentifier(likeConfig.tableName);
  const likeTopicColumn = quoteIdentifier(likeConfig.topicId);
  const rows = await query(
    'SELECT COUNT(*) AS total FROM ' + likeTable + ' WHERE ' + likeTopicColumn + ' = :topicId',
    { topicId: normalizedTopicId },
  );

  return Number(rows[0]?.total ?? 0);
};

router.get('/topics', async (req, res) => {
  try {
    const topicConfig = await getForumTopicConfig();
    const postConfig = await getForumPostConfig();
    const likeConfig = await getForumLikeConfig();
    const currentUserId = req.session?.user?.id != null ? String(req.session.user.id) : null;

    if (!topicConfig || !topicConfig.id || !topicConfig.title) {
      const fallback = listFallbackTopics().map((topic, index) => {
        const summary = getFallbackTopicSummary(topic.id, currentUserId) || { likes: 0, replies: 0, liked: false };
        return formatTopicRow(
          {
            id: topic.id,
            title: topic.title,
            description: topic.description,
            tags: topic.tags,
            created_at: topic.createdAt,
            updated_at: topic.updatedAt,
            author: topic.author,
          },
          index,
          { likes: summary.likes, replies: summary.replies, likedByMe: summary.liked },
        );
      });
      return res.json({ topics: fallback });
    }

    const userJoin = await getUserJoinConfig('u');
    const joinClause =
      userJoin && userJoin.userIdColumn && topicConfig.authorId
        ? 'LEFT JOIN users ' +
          userJoin.alias +
          ' ON ' +
          qualifyColumn(userJoin.alias, userJoin.userIdColumn) +
          ' = ' +
          qualifyColumn('ft', topicConfig.authorId)
        : '';
    const authorSelect = joinClause ? userJoin.select : "'匿名用户' AS author";

    const selectFragments = [
      buildSelectFragment('ft', topicConfig.id, 'id'),
      buildSelectFragment('ft', topicConfig.title, 'title'),
      buildSelectFragment('ft', topicConfig.description, 'description'),
      buildSelectFragment('ft', topicConfig.tags, 'tags'),
      buildSelectFragment('ft', topicConfig.createdAt, 'created_at'),
      buildSelectFragment('ft', topicConfig.updatedAt, 'updated_at'),
      authorSelect,
    ];

    const orderColumn = topicConfig.updatedAt
      ? qualifyColumn('ft', topicConfig.updatedAt)
      : topicConfig.createdAt
      ? qualifyColumn('ft', topicConfig.createdAt)
      : qualifyColumn('ft', topicConfig.id);
    const topicTable = quoteIdentifier(topicConfig.tableName);

    let rows = await query(
      `
        SELECT ${selectFragments.join(', ')}
        FROM ${topicTable} ft
        ${joinClause}
        ORDER BY ${orderColumn} DESC, ${qualifyColumn('ft', topicConfig.id)} DESC
      `,
    );

    if (!rows.length) {
      const fallback = listFallbackTopics().map((topic, index) => {
        const summary = getFallbackTopicSummary(topic.id, currentUserId) || { likes: 0, replies: 0, liked: false };
        return formatTopicRow(
          {
            id: topic.id,
            title: topic.title,
            description: topic.description,
            tags: topic.tags,
            created_at: topic.createdAt,
            updated_at: topic.updatedAt,
            author: topic.author,
          },
          index,
          { likes: summary.likes, replies: summary.replies, likedByMe: summary.liked },
        );
      });
      return res.json({ topics: fallback });
    }

    const topicIds = rows
      .map((row) => row.id)
      .filter((value) => value !== null && value !== undefined)
      .map((value) => String(value));

    let replyCountMap = new Map();
    if (postConfig?.topicId && topicIds.length > 0) {
      const { clause, params } = buildInClause(topicIds, 'topic');
      if (clause) {
        const postTopicColumn = qualifyColumn('fp', postConfig.topicId);
        const postTableName = quoteIdentifier(postConfig.tableName);
        const replyRows = await query(
          `SELECT ${postTopicColumn} AS topic_id, COUNT(*) AS total`
             FROM ${postTableName} fp
            WHERE ${postTopicColumn} IN (${clause})
            GROUP BY ${postTopicColumn}`,
          params,
        );
        replyCountMap = new Map(
          replyRows
            .map((row) => [row.topic_id ?? row.topicId, Number(row.total ?? 0)])
            .filter(([key]) => key !== null && key !== undefined)
            .map(([key, total]) => [String(key), total]),
        );
      }
    }

    let likeCountMap = new Map();
    if (likeConfig?.topicId && topicIds.length > 0) {
      const { clause, params } = buildInClause(topicIds, 'likeTopic');
      if (clause) {
        const likeTopicColumn = qualifyColumn('fl', likeConfig.topicId);
        const likeTableName = quoteIdentifier(likeConfig.tableName);
        const likeRows = await query(
          `SELECT ${likeTopicColumn} AS topic_id, COUNT(*) AS total`
             FROM ${likeTableName} fl
            WHERE ${likeTopicColumn} IN (${clause})
            GROUP BY ${likeTopicColumn}`,
          params,
        );
        likeCountMap = new Map(
          likeRows
            .map((row) => [row.topic_id ?? row.topicId, Number(row.total ?? 0)])
            .filter(([key]) => key !== null && key !== undefined)
            .map(([key, total]) => [String(key), total]),
        );
      }
    }

    let likedSet = new Set();
    if (likeConfig?.topicId && likeConfig?.userId && currentUserId && topicIds.length > 0) {
      const { clause, params } = buildInClause(topicIds, 'likedTopic');
      if (clause) {
        const likedTopicColumn = qualifyColumn('fl', likeConfig.topicId);
        const likedTableName = quoteIdentifier(likeConfig.tableName);
        const userIdColumn = qualifyColumn('fl', likeConfig.userId);
        const likedRows = await query(
          `SELECT ${likedTopicColumn} AS topic_id`
             FROM ${likedTableName} fl
            WHERE ${userIdColumn} = :userId
              AND ${likedTopicColumn} IN (${clause})`,
          { ...params, userId: currentUserId },
        );
        likedSet = new Set(
          likedRows
            .map((row) => row.topic_id ?? row.topicId)
            .filter((value) => value !== null && value !== undefined)
            .map((value) => String(value)),
        );
      }
    }

    const topics = rows.map((row, index) => {
      const key = row.id != null ? String(row.id) : String(index);
      return formatTopicRow(row, index, {
        replies: replyCountMap.get(key) ?? 0,
        likes: likeCountMap.get(key) ?? 0,
        likedByMe: likedSet.has(key),
      });
    });

    return res.json({ topics });
  } catch (error) {
    console.error('获取话题失败', error);
    const currentUserId = req.session?.user?.id != null ? String(req.session.user.id) : null;
    const fallback = listFallbackTopics().map((topic, index) => {
      const summary = getFallbackTopicSummary(topic.id, currentUserId) || { likes: 0, replies: 0, liked: false };
      return formatTopicRow(
        {
          id: topic.id,
          title: topic.title,
          description: topic.description,
          tags: topic.tags,
          created_at: topic.createdAt,
          updated_at: topic.updatedAt,
          author: topic.author,
        },
        index,
        { likes: summary.likes, replies: summary.replies, likedByMe: summary.liked },
      );
    });
    return res.json({ topics: fallback, message: '加载考研论坛失败，已展示示例数据。' });
  }
});

router.post('/topics', requireAuth, async (req, res) => {
  const rawTitle = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
  const rawDescription = typeof req.body?.description === 'string' ? req.body.description.trim() : '';
  const rawTags = req.body?.tags;
  const tags = Array.isArray(rawTags)
    ? rawTags.map((tag) => String(tag).trim()).filter(Boolean)
    : typeof rawTags === 'string'
    ? rawTags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];

  if (!rawTitle) {
    return res.status(400).json({ message: '话题标题不能为空' });
  }

  try {
    const topicConfig = await getForumTopicConfig();

    if (!topicConfig || !topicConfig.title) {
      const fallbackTopic = createFallbackTopic({
        title: rawTitle,
        description: rawDescription,
        tags,
        author: resolveFallbackAuthorName(req.session?.user || null),
      });
      return res.status(201).json({ id: fallbackTopic.id, title: fallbackTopic.title, tags: fallbackTopic.tags });
    }

    const payload = createTopicPayload(topicConfig, {
      title: rawTitle,
      description: rawDescription,
      authorId: req.session.user ? req.session.user.id : null,
      tags,
    });

    const result = await insertRecord(topicConfig.tableName, payload);

    res.status(201).json({ id: result.insertId, title: rawTitle, tags });
  } catch (error) {
    console.error('创建话题失败', error);
    res.status(500).json({ message: '创建话题失败，请稍后重试' });
  }
});

router.get('/topics/:topicId/posts', async (req, res) => {
  const { topicId } = req.params;

  try {
    const topicConfig = await getForumTopicConfig();
    const postConfig = await getForumPostConfig();
    const currentUserId = req.session?.user?.id != null ? String(req.session.user.id) : null;
    const isAdmin = req.session?.user ? isAdminRole(req.session.user.role) : false;

    if (!topicConfig?.id || !postConfig || !postConfig.topicId || !postConfig.id) {
      const fallbackPosts = listFallbackPosts(topicId).map((post, index) => {
        const authorId = post.authorId != null ? String(post.authorId) : null;
        const isAuthor = Boolean(currentUserId && authorId && currentUserId === authorId);
        return formatPostRow(
          {
            id: post.id,
            content: post.content,
            author: post.author,
            created_at: post.createdAt,
            updated_at: post.createdAt,
          },
          index,
          { canDelete: Boolean(isAdmin || isAuthor), isAuthor },
        );
      });
      return res.json({ posts: fallbackPosts });
    }

    const userJoin = await getUserJoinConfig('u');
    const joinClause =
      userJoin && userJoin.userIdColumn && postConfig.authorId
        ? 'LEFT JOIN users ' +
          userJoin.alias +
          ' ON ' +
          qualifyColumn(userJoin.alias, userJoin.userIdColumn) +
          ' = ' +
          qualifyColumn('fp', postConfig.authorId)
        : '';
    const authorSelect = joinClause ? userJoin.select : "'匿名用户' AS author";

    const selectFragments = [
      buildSelectFragment('fp', postConfig.id, 'id'),
      buildSelectFragment('fp', postConfig.content, 'content', "'' AS content"),
      buildSelectFragment('fp', postConfig.createdAt, 'created_at'),
      buildSelectFragment('fp', postConfig.updatedAt, 'updated_at'),
      buildSelectFragment('fp', postConfig.topicId, 'topic_id'),
      buildSelectFragment('fp', postConfig.authorId, 'author_id'),
      authorSelect,
    ];

    const orderColumn = postConfig.createdAt
      ? qualifyColumn('fp', postConfig.createdAt)
      : qualifyColumn('fp', postConfig.id);

    const normalizedTopicId = normalizeValueForColumn(
      postConfig.columnDetails,
      postConfig.topicId,
      normalizeIdentifier(topicId),
    );

    if (normalizedTopicId === null || normalizedTopicId === undefined) {
      return res.json({ posts: [] });
    }

    const postTable = quoteIdentifier(postConfig.tableName);
    const rows = await query(
      `SELECT ${selectFragments.join(', ')}
         FROM ${postTable} fp
         ${joinClause}
        WHERE ${qualifyColumn('fp', postConfig.topicId)} = :topicId
        ORDER BY ${orderColumn} ASC, ${qualifyColumn('fp', postConfig.id)} ASC`,
      { topicId: normalizedTopicId },
    );

    const posts = rows.map((row, index) => {
      const base = formatPostRow(row, index);
      const authorId = row.author_id != null ? String(row.author_id) : null;
      const isAuthor = Boolean(currentUserId && authorId && currentUserId === authorId);
      return {
        ...base,
        canDelete: Boolean(isAdmin || isAuthor),
        isAuthor,
      };
    });

    res.json({ posts });
  } catch (error) {
    console.error('获取帖子失败', error);
    const fallbackPosts = listFallbackPosts(String(topicId)).map((post, index) => {
      const authorId = post.authorId != null ? String(post.authorId) : null;
      const currentUserId = req.session?.user?.id != null ? String(req.session.user.id) : null;
      const isAdmin = req.session?.user ? isAdminRole(req.session.user.role) : false;
      const isAuthor = Boolean(currentUserId && authorId && currentUserId === authorId);
      return formatPostRow(
        {
          id: post.id,
          content: post.content,
          author: post.author,
          created_at: post.createdAt,
          updated_at: post.createdAt,
        },
        index,
        { canDelete: Boolean(isAdmin || isAuthor), isAuthor },
      );
    });
    res.json({ posts: fallbackPosts, message: '加载帖子失败，已展示示例帖子。' });
  }
});

router.post('/topics/:topicId/posts', requireAuth, async (req, res) => {
  const { topicId } = req.params;
  const rawContent = typeof req.body?.content === 'string' ? req.body.content.trim() : '';

  if (!rawContent) {
    return res.status(400).json({ message: '帖子内容不能为空' });
  }

  try {
    const postConfig = await getForumPostConfig();

    if (!postConfig || !postConfig.topicId) {
      const created = createFallbackPost(String(topicId), {
        content: rawContent,
        sessionUser: req.session?.user || null,
      });

      if (!created) {
        return res.status(404).json({ message: '话题不存在或已被删除' });
      }

      return res.status(201).json({ id: created.id });
    }

    const payload = createPostPayload(postConfig, {
      topicId,
      content: rawContent,
      authorId: req.session?.user ? req.session.user.id : null,
    });

    const result = await insertRecord(postConfig.tableName, payload);

    const newId = result.insertId != null ? String(result.insertId) : null;
    res.status(201).json({ id: newId });
  } catch (error) {
    console.error('创建帖子失败', error);
    res.status(500).json({ message: '发布帖子失败，请稍后重试' });
  }
});

router.delete('/topics/:topicId/posts/:postId', requireAuth, async (req, res) => {
  const { topicId, postId } = req.params;

  try {
    const postConfig = await getForumPostConfig();

    if (!postConfig?.id) {
      const topicIdValue = String(topicId);
      const postIdValue = String(postId);
      const posts = listFallbackPosts(topicIdValue);
      const exists = posts.some((post) => post.id === postIdValue);
      const success = deleteFallbackPost(topicIdValue, postIdValue, req.session?.user || null);

      if (!exists) {
        return res.status(404).json({ message: '帖子不存在或已被删除' });
      }

      if (!success) {
        return res.status(403).json({ message: '没有权限删除该帖子' });
      }

      return res.json({ success: true });
    }

    const selectFragments = [
      buildSelectFragment('fp', postConfig.id, 'id'),
      buildSelectFragment('fp', postConfig.topicId, 'topic_id'),
      buildSelectFragment('fp', postConfig.authorId, 'author_id'),
    ];

    const normalizedPostId = normalizeValueForColumn(
      postConfig.columnDetails,
      postConfig.id,
      normalizeIdentifier(postId),
    );

    if (normalizedPostId === null || normalizedPostId === undefined) {
      return res.status(400).json({ message: '帖子编号无效' });
    }

    const postTable = quoteIdentifier(postConfig.tableName);
    const rows = await query(
      `SELECT ${selectFragments.join(', ')}
         FROM ${postTable} fp
        WHERE ${qualifyColumn('fp', postConfig.id)} = :postId
        LIMIT 1`,
      { postId: normalizedPostId },
    );

    const record = rows[0];

    if (!record) {
      return res.status(404).json({ message: '帖子不存在或已被删除' });
    }

    if (postConfig.topicId) {
      const recordTopicId = record.topic_id != null ? String(record.topic_id) : null;
      const normalizedTopicId = normalizeIdentifier(topicId);
      if (recordTopicId && normalizedTopicId && recordTopicId !== normalizedTopicId) {
        return res.status(400).json({ message: '帖子与话题不匹配' });
      }
    }

    const currentUserId = req.session?.user?.id != null ? String(req.session.user.id) : null;
    const isAdmin = req.session?.user ? isAdminRole(req.session.user.role) : false;
    const authorId = record.author_id != null ? String(record.author_id) : null;

    if (!isAdmin && (!authorId || !currentUserId || authorId !== currentUserId)) {
      return res.status(403).json({ message: '没有权限删除该帖子' });
    }

    await deleteRecord(postConfig.tableName, normalizedPostId, { idColumn: postConfig.id });

    return res.json({ success: true });
  } catch (error) {
    console.error('删除帖子失败', error);
    return res.status(500).json({ message: '删除帖子失败，请稍后重试' });
  }
});

router.post('/topics/:topicId/likes', requireAuth, async (req, res) => {
  const { topicId } = req.params;
  const currentUserId = req.session?.user?.id != null ? String(req.session.user.id) : null;

  if (!currentUserId) {
    return res.status(401).json({ message: '未登录或会话失效' });
  }

  try {
    const topicConfig = await getForumTopicConfig();
    const likeConfig = await getForumLikeConfig();

    if (!topicConfig?.id || !likeConfig || !likeConfig.topicId || !likeConfig.userId) {
      const summaryBefore = getFallbackTopicSummary(String(topicId), currentUserId);

      if (!summaryBefore) {
        return res.status(404).json({ message: '话题不存在或已被删除' });
      }

      const result = toggleFallbackLike(String(topicId), currentUserId);
      const summaryAfter = getFallbackTopicSummary(String(topicId), currentUserId) || {
        likes: result.likes,
        liked: result.liked,
        replies: summaryBefore.replies,
      };
      return res.json({ likes: summaryAfter.likes, liked: summaryAfter.liked });
    }

    const normalizedTopicId = normalizeValueForColumn(
      topicConfig.columnDetails,
      topicConfig.id,
      normalizeIdentifier(topicId),
    );

    if (normalizedTopicId === null || normalizedTopicId === undefined) {
      return res.status(400).json({ message: '话题编号无效' });
    }

    const likeTopicId = normalizeValueForColumn(
      likeConfig.columnDetails,
      likeConfig.topicId,
      normalizeIdentifier(topicId),
    );

    if (likeTopicId === null || likeTopicId === undefined) {
      return res.status(400).json({ message: '当前话题编号与点赞表不兼容' });
    }

    const normalizedUserId = normalizeValueForColumn(
      likeConfig.columnDetails,
      likeConfig.userId,
      normalizeIdentifier(currentUserId),
    );

    if (normalizedUserId === null || normalizedUserId === undefined) {
      return res.status(400).json({ message: '用户编号不符合点赞表要求' });
    }

    const topicTableName = quoteIdentifier(topicConfig.tableName);
    const topicIdColumn = quoteIdentifier(topicConfig.id);
    const topicRows = await query(
      `SELECT 1 FROM ${topicTableName} WHERE ${topicIdColumn} = :topicId LIMIT 1`,
      { topicId: normalizedTopicId },
    );

    if (topicRows.length === 0) {
      return res.status(404).json({ message: '话题不存在或已被删除' });
    }

    const likeTableName = quoteIdentifier(likeConfig.tableName);
    const likeTopicColumn = qualifyColumn('fl', likeConfig.topicId);
    const likeUserColumn = qualifyColumn('fl', likeConfig.userId);
    const likeIdSelect = likeConfig.id ? qualifyColumn('fl', likeConfig.id) : '1';
    const existing = await query(
      `SELECT ${likeIdSelect} AS id
         FROM ${likeTableName} fl
        WHERE ${likeTopicColumn} = :topicId
          AND ${likeUserColumn} = :userId
        LIMIT 1`,
      { topicId: likeTopicId, userId: normalizedUserId },
    );

    if (existing.length > 0) {
      const deleteTable = quoteIdentifier(likeConfig.tableName);
      const deleteTopicColumn = quoteIdentifier(likeConfig.topicId);
      const deleteUserColumn = quoteIdentifier(likeConfig.userId);
      await query(
        `DELETE FROM ${deleteTable}
          WHERE ${deleteTopicColumn} = :topicId AND ${deleteUserColumn} = :userId`,
        { topicId: likeTopicId, userId: normalizedUserId },
      );
      const likes = await countLikesForTopic(likeConfig, likeTopicId);
      return res.json({ likes, liked: false });
    }

    const payload = createLikePayload(likeConfig, {
      topicId: likeTopicId,
      userId: normalizedUserId,
    });
    await insertRecord(likeConfig.tableName, payload);
    const likes = await countLikesForTopic(likeConfig, likeTopicId);

    return res.json({ likes, liked: true });
  } catch (error) {
    console.error('切换点赞状态失败', error);
    const summaryBefore = getFallbackTopicSummary(String(topicId), currentUserId);

    if (!summaryBefore) {
      return res.status(500).json({ message: '点赞失败，请稍后重试' });
    }

    const result = toggleFallbackLike(String(topicId), currentUserId);
    const summaryAfter = getFallbackTopicSummary(String(topicId), currentUserId) || {
      likes: result.likes,
      liked: result.liked,
      replies: summaryBefore.replies,
    };
    return res.json({ likes: summaryAfter.likes, liked: summaryAfter.liked });
  }
});

module.exports = router;
