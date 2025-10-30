const express = require('express');
const { query } = require('../database');
const { requireAuth } = require('../middleware/auth');
const { normalizeDate, parseTags, stringifyTags } = require('../utils/formatters');

const router = express.Router();

const seedPracticeContent = async () => {
  const sampleSetResult = await query(
    `INSERT INTO practice_sets (title, description, difficulty, tags, created_by, created_at, updated_at)
     VALUES ('数学强化题单', '基础高等数学训练题集，覆盖极限、线性代数与概率论核心考点。', 'hard', :tags, NULL, NOW(), NOW())`,
    { tags: stringifyTags(['数学', '强化训练']) },
  );

  const setId = sampleSetResult.insertId;

  const sampleQuestions = [
    {
      questionText: '已知数列 a_n 满足 a_1 = 1, a_{n+1} = 2a_n + 1，求通项公式。',
      answerText: 'a_n = 2^n - 1',
      explanation: '通过递推计算或设 b_n = a_n + 1 可化为等比数列求解。',
      tags: stringifyTags(['数学一', '数列']),
      difficulty: 'medium',
    },
    {
      questionText: '设随机变量 X ~ N(0,1)，求 P(|X| \le 1.96)。',
      answerText: '约为 0.95',
      explanation: '标准正态分布在区间 [-1.96, 1.96] 内的概率约为 95%。',
      tags: stringifyTags(['概率论', '统计']),
      difficulty: 'easy',
    },
    {
      questionText: '判断矩阵 A = [[1,2],[3,4]] 是否可逆，并求其逆矩阵。',
      answerText: '可逆，A^{-1} = [[-2,1],[1.5,-0.5]]',
      explanation: '行列式 det(A) = -2 ≠ 0，可逆；利用伴随矩阵或初等变换计算逆矩阵。',
      tags: stringifyTags(['线性代数']),
      difficulty: 'medium',
    },
  ];

  await Promise.all(
    sampleQuestions.map((item) =>
      query(
        `INSERT INTO practice_questions
           (practice_set_id, question_text, answer_text, explanation, tags, difficulty, created_by, created_at, updated_at)
         VALUES (:setId, :questionText, :answerText, :explanation, :tags, :difficulty, NULL, NOW(), NOW())`,
        { setId, ...item },
      ),
    ),
  );
};

router.get('/sets', requireAuth, async (req, res) => {
  try {
    let rows = await query(
      `SELECT ps.id, ps.title, ps.description, ps.difficulty, ps.tags, ps.created_at, ps.updated_at,
              COUNT(pq.id) AS questionCount
         FROM practice_sets ps
    LEFT JOIN practice_questions pq ON pq.practice_set_id = ps.id
        GROUP BY ps.id
        ORDER BY ps.updated_at DESC, ps.created_at DESC`,
    );

    if (rows.length === 0) {
      try {
        await seedPracticeContent();
      } catch (seedError) {
        console.warn('初始化题库示例数据失败', seedError);
      }

      rows = await query(
        `SELECT ps.id, ps.title, ps.description, ps.difficulty, ps.tags, ps.created_at, ps.updated_at,
                COUNT(pq.id) AS questionCount
           FROM practice_sets ps
      LEFT JOIN practice_questions pq ON pq.practice_set_id = ps.id
          GROUP BY ps.id
          ORDER BY ps.updated_at DESC, ps.created_at DESC`,
      );
    }

    const sets = rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description || '',
      difficulty: row.difficulty || 'medium',
      tags: parseTags(row.tags),
      questionCount: Number(row.questionCount) || 0,
      createdAt: normalizeDate(row.created_at),
      updatedAt: normalizeDate(row.updated_at),
    }));

    res.json({ sets });
  } catch (error) {
    console.error('获取题单失败', error);
    res.status(500).json({ message: '无法加载题单列表，请稍后重试' });
  }
});

router.post('/sets', requireAuth, async (req, res) => {
  const { title, description, difficulty = 'medium', tags = [] } = req.body || {};

  if (!title) {
    return res.status(400).json({ message: '题单标题不能为空' });
  }

  try {
    const result = await query(
      `INSERT INTO practice_sets (title, description, difficulty, tags, created_by, created_at, updated_at)
       VALUES (:title, :description, :difficulty, :tags, :createdBy, NOW(), NOW())`,
      {
        title,
        description: description || null,
        difficulty,
        tags: stringifyTags(tags),
        createdBy: req.session.user ? req.session.user.id : null,
      },
    );

    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error('创建题单失败', error);
    res.status(500).json({ message: '创建题单失败，请稍后重试' });
  }
});

router.get('/sets/:setId/questions', requireAuth, async (req, res) => {
  const { setId } = req.params;

  try {
    const rows = await query(
      `SELECT id, question_text, answer_text, explanation, tags, difficulty, created_at, updated_at
         FROM practice_questions
        WHERE practice_set_id = :setId
        ORDER BY updated_at DESC, created_at DESC`,
      { setId },
    );

    const questions = rows.map((row) => ({
      id: row.id,
      questionText: row.question_text,
      answerText: row.answer_text || '',
      explanation: row.explanation || '',
      tags: parseTags(row.tags),
      difficulty: row.difficulty || 'medium',
      createdAt: normalizeDate(row.created_at),
      updatedAt: normalizeDate(row.updated_at),
    }));

    res.json({ questions });
  } catch (error) {
    console.error('获取题目失败', error);
    res.status(500).json({ message: '无法加载题目列表，请稍后重试' });
  }
});

router.post('/sets/:setId/questions', requireAuth, async (req, res) => {
  const { setId } = req.params;
  const { questionText, answerText = '', explanation = '', tags = [], difficulty = 'medium' } = req.body || {};

  if (!questionText) {
    return res.status(400).json({ message: '题目内容不能为空' });
  }

  try {
    const result = await query(
      `INSERT INTO practice_questions
         (practice_set_id, question_text, answer_text, explanation, tags, difficulty, created_by, created_at, updated_at)
       VALUES (:setId, :questionText, :answerText, :explanation, :tags, :difficulty, :createdBy, NOW(), NOW())`,
      {
        setId,
        questionText,
        answerText: answerText || null,
        explanation: explanation || null,
        tags: stringifyTags(tags),
        difficulty,
        createdBy: req.session.user ? req.session.user.id : null,
      },
    );

    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error('创建题目失败', error);
    res.status(500).json({ message: '录入题目失败，请稍后重试' });
  }
});

module.exports = router;
