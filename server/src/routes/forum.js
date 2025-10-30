const express = require('express');
const { query } = require('../database');
const { requireAuth } = require('../middleware/auth');
const { normalizeDate } = require('../utils/formatters');

const router = express.Router();

router.get('/topics', requireAuth, async (req, res) => {
  try {
    const rows = await query(
      `SELECT ft.id, ft.title, ft.description, ft.created_at, ft.updated_at,
              COALESCE(u.display_name, u.username, '匿名用户') AS author
         FROM forum_topics ft
    LEFT JOIN users u ON u.id = ft.author_id
        ORDER BY ft.updated_at DESC, ft.created_at DESC`,
    );

    const topics = rows.map((row) => ({
      id: row.id,
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
    const result = await query(
      `INSERT INTO forum_topics (title, description, author_id, created_at, updated_at)
       VALUES (:title, :description, :authorId, NOW(), NOW())`,
      {
        title,
        description: description || null,
        authorId: req.session.user ? req.session.user.id : null,
      },
    );

    res.status(201).json({ id: result.insertId, title });
  } catch (error) {
    console.error('创建话题失败', error);
    res.status(500).json({ message: '创建话题失败，请稍后重试' });
  }
});

router.get('/topics/:topicId/posts', requireAuth, async (req, res) => {
  const { topicId } = req.params;

  try {
    const rows = await query(
      `SELECT fp.id, fp.content, fp.created_at, fp.updated_at,
              COALESCE(u.display_name, u.username, '匿名用户') AS author
         FROM forum_posts fp
    LEFT JOIN users u ON u.id = fp.author_id
        WHERE fp.topic_id = :topicId
        ORDER BY fp.created_at ASC`,
      { topicId },
    );

    const posts = rows.map((row) => ({
      id: row.id,
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
    const result = await query(
      `INSERT INTO forum_posts (topic_id, author_id, content, created_at, updated_at)
       VALUES (:topicId, :authorId, :content, NOW(), NOW())`,
      {
        topicId,
        authorId: req.session.user ? req.session.user.id : null,
        content,
      },
    );

    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error('创建帖子失败', error);
    res.status(500).json({ message: '发布帖子失败，请稍后重试' });
  }
});

module.exports = router;
