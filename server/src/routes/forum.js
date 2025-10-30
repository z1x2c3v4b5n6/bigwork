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

const ensureForumTables = async (res, { requirePosts = false } = {}) => {
  if (!(await tableExists('forum_topics'))) {
    res.status(500).json({ message: 'forum_topics 表不存在，请按照 README 说明手动创建后再试。' });
    return false;
  }

  if (requirePosts && !(await tableExists('forum_posts'))) {
    res.status(500).json({ message: 'forum_posts 表不存在，请按照 README 说明手动创建后再试。' });
    return false;
  }

  return true;
};

router.get('/topics', requireAuth, async (req, res) => {
  try {
    const ready = await ensureForumTables(res);
    if (!ready) {
      return;
    }

    const topicColumns = await getTableColumns('forum_topics');
    const hasUsersTable = await tableExists('users');
    const canJoinUsers = hasUsersTable && topicColumns.has('author_id');

    const selectFragments = [
      'ft.id',
      'ft.title',
      topicColumns.has('description') ? 'ft.description' : 'NULL AS description',
      topicColumns.has('created_at') ? 'ft.created_at' : 'NULL AS created_at',
      topicColumns.has('updated_at') ? 'ft.updated_at' : 'NULL AS updated_at',
      canJoinUsers
        ? "COALESCE(u.display_name, u.username, '匿名用户') AS author"
        : "'匿名用户' AS author",
    ];

    const joinClause = canJoinUsers ? 'LEFT JOIN users u ON u.id = ft.author_id' : '';
    const orderColumn = topicColumns.has('updated_at')
      ? 'ft.updated_at'
      : topicColumns.has('created_at')
      ? 'ft.created_at'
      : 'ft.id';

    const rows = await query(
      `SELECT ${selectFragments.join(', ')}
         FROM forum_topics ft
         ${joinClause}
        ORDER BY ${orderColumn} DESC, ft.id DESC`,
    );

    const topics = rows.map((row) => ({
      id: Number(row.id),
      title: row.title,
      description: row.description || '',
      author: row.author || '匿名用户',
      createdAt: normalizeDate(row.created_at),
      updatedAt: normalizeDate(row.updated_at),
    }));

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
    const ready = await ensureForumTables(res);
    if (!ready) {
      return;
    }

    const result = await insertRecord('forum_topics', {
      title,
      description: description || null,
      author_id: req.session.user ? Number(req.session.user.id) : null,
    });

    res.status(201).json({ id: result.insertId, title });
  } catch (error) {
    console.error('创建话题失败', error);
    res.status(500).json({ message: '创建话题失败，请稍后重试' });
  }
});

router.get('/topics/:topicId/posts', requireAuth, async (req, res) => {
  const { topicId } = req.params;

  try {
    const ready = await ensureForumTables(res, { requirePosts: true });
    if (!ready) {
      return;
    }

    const postColumns = await getTableColumns('forum_posts');
    const hasUsersTable = await tableExists('users');
    const canJoinUsers = hasUsersTable && postColumns.has('author_id');

    const selectFragments = [
      'fp.id',
      'fp.content',
      postColumns.has('created_at') ? 'fp.created_at' : 'NULL AS created_at',
      postColumns.has('updated_at') ? 'fp.updated_at' : 'NULL AS updated_at',
      canJoinUsers
        ? "COALESCE(u.display_name, u.username, '匿名用户') AS author"
        : "'匿名用户' AS author",
    ];

    const joinClause = canJoinUsers ? 'LEFT JOIN users u ON u.id = fp.author_id' : '';
    const orderColumn = postColumns.has('created_at') ? 'fp.created_at' : 'fp.id';

    const rows = await query(
      `SELECT ${selectFragments.join(', ')}
         FROM forum_posts fp
         ${joinClause}
        WHERE fp.topic_id = :topicId
        ORDER BY ${orderColumn} ASC, fp.id ASC`,
      { topicId },
    );

    const posts = rows.map((row) => ({
      id: Number(row.id),
      content: row.content,
      author: row.author || '匿名用户',
      createdAt: normalizeDate(row.created_at),
      updatedAt: normalizeDate(row.updated_at),
    }));

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
    const ready = await ensureForumTables(res, { requirePosts: true });
    if (!ready) {
      return;
    }

    const result = await insertRecord('forum_posts', {
      topic_id: topicId,
      author_id: req.session.user ? Number(req.session.user.id) : null,
      content,
    });

    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error('创建帖子失败', error);
    res.status(500).json({ message: '发布帖子失败，请稍后重试' });
  }
});

module.exports = router;
