const express = require('express');
const {
  query,
  insertRecord,
  tableExists,
  getTableColumns,
} = require('../database');
const { requireAuth } = require('../middleware/auth');
const { normalizeDate } = require('../utils/formatters');

const router = express.Router();

const resolveColumn = (columns, candidates) => candidates.find((column) => columns.has(column)) || null;

const getForumTopicConfig = async () => {
  const columns = await getTableColumns('forum_topics');

  if (columns.size === 0) {
    return null;
  }

  return {
    columns,
    id: resolveColumn(columns, ['id', 'topic_id']),
    title: resolveColumn(columns, ['title', 'name', 'subject']),
    description: resolveColumn(columns, ['description', 'summary', 'content']),
    authorId: resolveColumn(columns, ['author_id', 'user_id', 'creator_id']),
    createdAt: resolveColumn(columns, ['created_at', 'create_time']),
    updatedAt: resolveColumn(columns, ['updated_at', 'update_time']),
  };
};

const getForumPostConfig = async () => {
  const columns = await getTableColumns('forum_posts');

  if (columns.size === 0) {
    return null;
  }

  return {
    columns,
    id: resolveColumn(columns, ['id', 'post_id']),
    topicId: resolveColumn(columns, ['topic_id', 'forum_topic_id']),
    content: resolveColumn(columns, ['content', 'body', 'description']),
    authorId: resolveColumn(columns, ['author_id', 'user_id', 'creator_id']),
    createdAt: resolveColumn(columns, ['created_at', 'create_time']),
    updatedAt: resolveColumn(columns, ['updated_at', 'update_time']),
  };
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
    pieces.push(`${alias}.\`${displayColumn}\``);
  }
  if (usernameColumn) {
    pieces.push(`${alias}.\`${usernameColumn}\``);
  }

  const select = `COALESCE(${pieces.join(', ')}, '匿名用户') AS author`;

  return {
    select,
    userIdColumn,
    alias,
  };
};

const createTopicPayload = (config, { title, description, authorId }) => {
  const payload = {};

  if (config.title) {
    payload[config.title] = title;
  }

  if (config.description) {
    payload[config.description] = description ?? null;
  }

  if (config.authorId) {
    payload[config.authorId] = authorId ?? null;
  }

  return payload;
};

const createPostPayload = (config, { topicId, content, authorId }) => {
  const payload = {};

  if (config.topicId) {
    payload[config.topicId] = topicId;
  }

  if (config.content) {
    payload[config.content] = content;
  }

  if (config.authorId) {
    payload[config.authorId] = authorId ?? null;
  }

  return payload;
};

const formatTopicRow = (row, index = 0) => ({
  id: row.id != null ? Number(row.id) : index + 1,
  title: row.title || '未命名话题',
  description: row.description || '',
  author: row.author || '匿名用户',
  createdAt: normalizeDate(row.created_at),
  updatedAt: normalizeDate(row.updated_at),
});

const formatPostRow = (row, index = 0) => ({
  id: row.id != null ? Number(row.id) : index + 1,
  content: row.content || '',
  author: row.author || '匿名用户',
  createdAt: normalizeDate(row.created_at),
  updatedAt: normalizeDate(row.updated_at),
});

const seedForumTopics = async (topicConfig) => {
  try {
    if (!topicConfig?.id || !topicConfig?.title) {
      return;
    }

    const existing = await query('SELECT COUNT(*) AS total FROM forum_topics');
    if (Number(existing[0]?.total) > 0) {
      return;
    }

    const topics = [
      {
        title: '初试经验交流',
        description: '分享全年复习规划、时间管理和自我调节心得。',
      },
      {
        title: '院校信息互助',
        description: '讨论目标院校专业课复习资料、复试要求与往年录取情况。',
      },
    ];

    for (const topic of topics) {
      const payload = createTopicPayload(topicConfig, topic);
      await insertRecord('forum_topics', payload);
    }
  } catch (error) {
    console.warn('初始化考研圈子示例数据失败', error.message);
  }
};

router.get('/topics', requireAuth, async (req, res) => {
  try {
    const topicConfig = await getForumTopicConfig();

    if (!topicConfig) {
      return res
        .status(500)
        .json({ message: 'forum_topics 表不存在，请按照 README 说明手动创建后再试。' });
    }

    if (!topicConfig.id || !topicConfig.title) {
      return res
        .status(500)
        .json({ message: 'forum_topics 表缺少主键或标题字段，请补齐 id/title 列后再试。' });
    }

    const userJoin = await getUserJoinConfig('u');
    const joinClause =
      userJoin && userJoin.userIdColumn && topicConfig.authorId
        ? `LEFT JOIN users ${userJoin.alias} ON ${userJoin.alias}.\`${userJoin.userIdColumn}\` = ft.\`${topicConfig.authorId}\``
        : '';
    const authorSelect = joinClause ? userJoin.select : "'匿名用户' AS author";

    const selectFragments = [
      `ft.\`${topicConfig.id}\` AS id`,
      `ft.\`${topicConfig.title}\` AS title`,
      topicConfig.description ? `ft.\`${topicConfig.description}\` AS description` : 'NULL AS description',
      topicConfig.createdAt ? `ft.\`${topicConfig.createdAt}\` AS created_at` : 'NULL AS created_at',
      topicConfig.updatedAt ? `ft.\`${topicConfig.updatedAt}\` AS updated_at` : 'NULL AS updated_at',
      authorSelect,
    ];

    const orderColumn = topicConfig.updatedAt
      ? `ft.\`${topicConfig.updatedAt}\``
      : topicConfig.createdAt
      ? `ft.\`${topicConfig.createdAt}\``
      : `ft.\`${topicConfig.id}\``;

    let rows = await query(
      `SELECT ${selectFragments.join(', ')}
         FROM forum_topics ft
         ${joinClause}
        ORDER BY ${orderColumn} DESC, ft.\`${topicConfig.id}\` DESC`,
    );

    if (rows.length === 0) {
      await seedForumTopics(topicConfig);
      rows = await query(
        `SELECT ${selectFragments.join(', ')}
           FROM forum_topics ft
           ${joinClause}
          ORDER BY ${orderColumn} DESC, ft.\`${topicConfig.id}\` DESC`,
      );
    }

    const topics = rows.map((row, index) => formatTopicRow(row, index));

    res.json({ topics });
  } catch (error) {
    console.error('获取话题失败', error);
    res.status(500).json({ message: '加载考研圈子失败，请稍后重试' });
  }
});

router.post('/topics', requireAuth, async (req, res) => {
  const { title, description = '' } = req.body || {};

  if (!title) {
    return res.status(400).json({ message: '话题标题不能为空' });
  }

  try {
    const topicConfig = await getForumTopicConfig();

    if (!topicConfig) {
      return res
        .status(500)
        .json({ message: 'forum_topics 表不存在，请按照 README 说明手动创建后再试。' });
    }

    if (!topicConfig.title) {
      return res
        .status(500)
        .json({ message: 'forum_topics 表缺少标题字段（title/name），请补充数据表结构。' });
    }

    const payload = createTopicPayload(topicConfig, {
      title,
      description,
      authorId: req.session.user ? Number(req.session.user.id) : null,
    });

    const result = await insertRecord('forum_topics', payload);

    res.status(201).json({ id: result.insertId, title });
  } catch (error) {
    console.error('创建话题失败', error);
    res.status(500).json({ message: '创建话题失败，请稍后重试' });
  }
});

router.get('/topics/:topicId/posts', requireAuth, async (req, res) => {
  const { topicId } = req.params;

  try {
    const topicConfig = await getForumTopicConfig();
    const postConfig = await getForumPostConfig();

    if (!topicConfig?.id) {
      return res
        .status(500)
        .json({ message: 'forum_topics 表缺少主键 id，请补齐后再试。' });
    }

    if (!postConfig) {
      return res
        .status(500)
        .json({ message: 'forum_posts 表不存在，请先创建帖子表后再查询。' });
    }

    if (!postConfig.topicId || !postConfig.id) {
      return res
        .status(500)
        .json({ message: 'forum_posts 表缺少 topic_id 字段，请补充数据表结构。' });
    }

    const userJoin = await getUserJoinConfig('u');
    const joinClause =
      userJoin && userJoin.userIdColumn && postConfig.authorId
        ? `LEFT JOIN users ${userJoin.alias} ON ${userJoin.alias}.\`${userJoin.userIdColumn}\` = fp.\`${postConfig.authorId}\``
        : '';
    const authorSelect = joinClause ? userJoin.select : "'匿名用户' AS author";

    const selectFragments = [
      `fp.\`${postConfig.id}\` AS id`,
      postConfig.content ? `fp.\`${postConfig.content}\` AS content` : "'' AS content",
      postConfig.createdAt ? `fp.\`${postConfig.createdAt}\` AS created_at` : 'NULL AS created_at',
      postConfig.updatedAt ? `fp.\`${postConfig.updatedAt}\` AS updated_at` : 'NULL AS updated_at',
      authorSelect,
    ];

    const orderColumn = postConfig.createdAt
      ? `fp.\`${postConfig.createdAt}\``
      : `fp.\`${postConfig.id}\``;

    const rows = await query(
      `SELECT ${selectFragments.join(', ')}
         FROM forum_posts fp
         ${joinClause}
        WHERE fp.\`${postConfig.topicId}\` = :topicId
        ORDER BY ${orderColumn} ASC, fp.\`${postConfig.id}\` ASC`,
      { topicId },
    );

    const posts = rows.map((row, index) => formatPostRow(row, index));

    res.json({ posts });
  } catch (error) {
    console.error('获取帖子失败', error);
    res.status(500).json({ message: '加载帖子失败，请稍后重试' });
  }
});

router.post('/topics/:topicId/posts', requireAuth, async (req, res) => {
  const { topicId } = req.params;
  const { content } = req.body || {};

  if (!content) {
    return res.status(400).json({ message: '帖子内容不能为空' });
  }

  try {
    const postConfig = await getForumPostConfig();

    if (!postConfig) {
      return res
        .status(500)
        .json({ message: 'forum_posts 表不存在，请先创建帖子表后再试。' });
    }

    if (!postConfig.topicId) {
      return res
        .status(500)
        .json({ message: 'forum_posts 表缺少 topic_id 字段，请补充数据表结构。' });
    }

    const payload = createPostPayload(postConfig, {
      topicId,
      content,
      authorId: req.session.user ? Number(req.session.user.id) : null,
    });

    const result = await insertRecord('forum_posts', payload);

    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error('创建帖子失败', error);
    res.status(500).json({ message: '发布帖子失败，请稍后重试' });
  }
});

module.exports = router;
