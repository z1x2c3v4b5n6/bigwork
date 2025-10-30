import { Router } from 'express';
import { ensureAuthenticated, ensureAdmin } from '../middleware/auth.js';
import { query } from '../config/database.js';
import { toMySQLDateTime } from '../utils/datetime.js';

const router = Router();

router.get('/topics', ensureAuthenticated, async (req, res, next) => {
  try {
    const topics = await query(
      'SELECT ft.id, ft.title, ft.description, ft.created_at, ft.updated_at, u.display_name AS author\n       FROM forum_topics ft\n       LEFT JOIN users u ON u.id = ft.created_by\n       ORDER BY ft.updated_at DESC\n       LIMIT 100',
    );

    const mapped = topics.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description ?? '',
      author: row.author ?? '匿名用户',
      createdAt: row.created_at ? toMySQLDateTime(row.created_at) : null,
      updatedAt: row.updated_at ? toMySQLDateTime(row.updated_at) : null,
    }));

    res.json({ topics: mapped });
  } catch (error) {
    next(error);
  }
});

router.post('/topics', ensureAuthenticated, async (req, res, next) => {
  try {
    const { title, description } = req.body ?? {};

    if (!title) {
      return res.status(400).json({ message: '话题标题不能为空' });
    }

    const result = await query(
      'INSERT INTO forum_topics (title, description, created_at, updated_at, created_by) VALUES (?, ?, NOW(), NOW(), ?)',
      [title, description ?? null, req.session.user.id],
    );

    res.status(201).json({ id: result.insertId, title });
  } catch (error) {
    next(error);
  }
});

router.get('/topics/:topicId/posts', ensureAuthenticated, async (req, res, next) => {
  try {
    const { topicId } = req.params;
    const posts = await query(
      'SELECT fp.id, fp.content, fp.created_at, fp.updated_at, u.display_name AS author\n       FROM forum_posts fp\n       LEFT JOIN users u ON u.id = fp.user_id\n       WHERE fp.topic_id = ?\n       ORDER BY fp.created_at ASC',
      [topicId],
    );

    const mapped = posts.map((row) => ({
      id: row.id,
      content: row.content,
      author: row.author ?? '匿名用户',
      createdAt: row.created_at ? toMySQLDateTime(row.created_at) : null,
      updatedAt: row.updated_at ? toMySQLDateTime(row.updated_at) : null,
    }));

    res.json({ posts: mapped });
  } catch (error) {
    next(error);
  }
});

router.post('/topics/:topicId/posts', ensureAuthenticated, async (req, res, next) => {
  try {
    const { topicId } = req.params;
    const { content } = req.body ?? {};

    if (!content) {
      return res.status(400).json({ message: '帖子内容不能为空' });
    }

    const result = await query(
      'INSERT INTO forum_posts (topic_id, user_id, content, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
      [topicId, req.session.user.id, content],
    );

    res.status(201).json({ id: result.insertId });
  } catch (error) {
    next(error);
  }
});

router.delete('/topics/:topicId/posts/:postId', ensureAdmin, async (req, res, next) => {
  try {
    const { postId } = req.params;
    await query('DELETE FROM forum_posts WHERE id = ?', [postId]);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
