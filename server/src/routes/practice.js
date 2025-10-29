import { Router } from 'express';
import { ensureAuthenticated } from '../middleware/auth.js';
import { query } from '../config/database.js';
import { toMySQLDateTime } from '../utils/datetime.js';

const router = Router();

router.use(ensureAuthenticated);

router.get('/sets', async (req, res, next) => {
  try {
    const sets = await query(
      'SELECT ps.id, ps.title, ps.description, ps.difficulty, ps.tags, ps.created_by AS createdBy, ps.created_at, ps.updated_at, COUNT(pq.id) AS questionCount\n       FROM practice_sets ps\n       LEFT JOIN practice_questions pq ON pq.practice_set_id = ps.id\n       GROUP BY ps.id\n       ORDER BY ps.updated_at DESC\n       LIMIT 100',
    );

    const mapped = sets.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description ?? '',
      difficulty: row.difficulty ?? 'medium',
      tags: row.tags ? row.tags.split(',').map((tag) => tag.trim()).filter(Boolean) : [],
      questionCount: Number(row.questionCount ?? 0),
      createdBy: row.createdBy ? String(row.createdBy) : null,
      createdAt: row.created_at ? toMySQLDateTime(row.created_at) : null,
      updatedAt: row.updated_at ? toMySQLDateTime(row.updated_at) : null,
    }));

    res.json({ sets: mapped });
  } catch (error) {
    next(error);
  }
});

router.post('/sets', async (req, res, next) => {
  try {
    const { title, description, difficulty = 'medium', tags = [] } = req.body ?? {};

    if (!title) {
      return res.status(400).json({ message: '题单标题不能为空' });
    }

    const normalizedTags = Array.isArray(tags) ? tags.join(',') : String(tags ?? '');

    const result = await query(
      'INSERT INTO practice_sets (title, description, difficulty, tags, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      [title, description ?? null, difficulty, normalizedTags, req.session.user.id],
    );

    res.status(201).json({ id: result.insertId, title });
  } catch (error) {
    next(error);
  }
});

router.get('/sets/:setId', async (req, res, next) => {
  try {
    const { setId } = req.params;
    const rows = await query('SELECT id, title, description, difficulty, tags, created_by AS createdBy, created_at, updated_at FROM practice_sets WHERE id = ?', [setId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: '未找到对应的题单' });
    }

    const row = rows[0];

    res.json({
      id: row.id,
      title: row.title,
      description: row.description ?? '',
      difficulty: row.difficulty ?? 'medium',
      tags: row.tags ? row.tags.split(',').map((tag) => tag.trim()).filter(Boolean) : [],
      createdBy: row.createdBy ? String(row.createdBy) : null,
      createdAt: row.created_at ? toMySQLDateTime(row.created_at) : null,
      updatedAt: row.updated_at ? toMySQLDateTime(row.updated_at) : null,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/sets/:setId/questions', async (req, res, next) => {
  try {
    const { setId } = req.params;
    const questions = await query(
      'SELECT id, question_text AS questionText, answer_text AS answerText, explanation, tags, difficulty, created_by AS createdBy, created_at, updated_at\n       FROM practice_questions\n       WHERE practice_set_id = ?\n       ORDER BY created_at ASC',
      [setId],
    );

    const mapped = questions.map((row) => ({
      id: row.id,
      questionText: row.questionText,
      answerText: row.answerText ?? '',
      explanation: row.explanation ?? '',
      tags: row.tags ? row.tags.split(',').map((tag) => tag.trim()).filter(Boolean) : [],
      difficulty: row.difficulty ?? 'medium',
      createdBy: row.createdBy ? String(row.createdBy) : null,
      createdAt: row.created_at ? toMySQLDateTime(row.created_at) : null,
      updatedAt: row.updated_at ? toMySQLDateTime(row.updated_at) : null,
    }));

    res.json({ questions: mapped });
  } catch (error) {
    next(error);
  }
});

router.post('/sets/:setId/questions', async (req, res, next) => {
  try {
    const { setId } = req.params;
    const { questionText, answerText, explanation, tags = [], difficulty = 'medium' } = req.body ?? {};

    if (!questionText) {
      return res.status(400).json({ message: '题干不能为空' });
    }

    const normalizedTags = Array.isArray(tags) ? tags.join(',') : String(tags ?? '');

    const result = await query(
      'INSERT INTO practice_questions (practice_set_id, question_text, answer_text, explanation, tags, difficulty, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [setId, questionText, answerText ?? null, explanation ?? null, normalizedTags, difficulty, req.session.user.id],
    );

    res.status(201).json({ id: result.insertId });
  } catch (error) {
    next(error);
  }
});

export default router;
