const express = require('express');
const {
  query,
  insertRecord,
  tableExists,
  getTableColumns,
} = require('../database');
const { requireAuth } = require('../middleware/auth');
const { normalizeDate, parseTags, stringifyTags } = require('../utils/formatters');

const router = express.Router();

const ensurePracticeTables = async (res, { requireQuestions = false } = {}) => {
  if (!(await tableExists('practice_sets'))) {
    res.status(500).json({ message: 'practice_sets 表不存在，请按照 README 说明手动创建后再试。' });
    return false;
  }

  if (requireQuestions && !(await tableExists('practice_questions'))) {
    res.status(500).json({ message: 'practice_questions 表不存在，请按照 README 说明手动创建后再试。' });
    return false;
  }

  return true;
};

const seedPracticeContent = async () => {
  try {
    if (!(await tableExists('practice_sets'))) {
      return;
    }

    const existing = await query('SELECT COUNT(*) AS total FROM practice_sets');
    if (Number(existing[0]?.total) > 0) {
      return;
    }

    const setResult = await insertRecord('practice_sets', {
      title: '数学强化题单',
      description: '基础高等数学训练题集，覆盖极限、线性代数与概率论核心考点。',
      difficulty: 'hard',
      tags: stringifyTags(['数学', '强化训练']),
    });

    if (!(await tableExists('practice_questions'))) {
      return;
    }

    const setId = setResult.insertId;

    const sampleQuestions = [
      {
        practice_set_id: setId,
        question_text: '已知数列 a_n 满足 a_1 = 1, a_{n+1} = 2a_n + 1，求通项公式。',
        answer_text: 'a_n = 2^n - 1',
        explanation: '通过递推计算或设 b_n = a_n + 1 可化为等比数列求解。',
        tags: stringifyTags(['数学一', '数列']),
        difficulty: 'medium',
      },
      {
        practice_set_id: setId,
        question_text: '设随机变量 X ~ N(0,1)，求 P(|X| \\le 1.96)。',
        answer_text: '约为 0.95',
        explanation: '标准正态分布在区间 [-1.96, 1.96] 内的概率约为 95%。',
        tags: stringifyTags(['概率论', '统计']),
        difficulty: 'easy',
      },
      {
        practice_set_id: setId,
        question_text: '判断矩阵 A = [[1,2],[3,4]] 是否可逆，并求其逆矩阵。',
        answer_text: '可逆，A^{-1} = [[-2,1],[1.5,-0.5]]',
        explanation: '行列式 det(A) = -2 ≠ 0，可逆；利用伴随矩阵或初等变换计算逆矩阵。',
        tags: stringifyTags(['线性代数']),
        difficulty: 'medium',
      },
    ];

    await Promise.all(sampleQuestions.map((item) => insertRecord('practice_questions', item)));
  } catch (error) {
    console.warn('初始化题库示例数据失败', error.message);
  }
};

router.get('/sets', requireAuth, async (req, res) => {
  try {
    const tableReady = await ensurePracticeTables(res);
    if (!tableReady) {
      return;
    }

    const setColumns = await getTableColumns('practice_sets');
    const hasQuestionsTable = await tableExists('practice_questions');

    const selectFragments = [
      'ps.id',
      'ps.title',
      setColumns.has('description') ? 'ps.description' : 'NULL AS description',
      setColumns.has('difficulty') ? 'ps.difficulty' : "NULL AS difficulty",
      setColumns.has('tags') ? 'ps.tags' : "NULL AS tags",
      setColumns.has('created_at') ? 'ps.created_at' : 'NULL AS created_at',
      setColumns.has('updated_at') ? 'ps.updated_at' : 'NULL AS updated_at',
      hasQuestionsTable ? 'COUNT(pq.id) AS questionCount' : '0 AS questionCount',
    ];

    const joinClause = hasQuestionsTable ? 'LEFT JOIN practice_questions pq ON pq.practice_set_id = ps.id' : '';
    const orderColumn = setColumns.has('updated_at')
      ? 'ps.updated_at'
      : setColumns.has('created_at')
      ? 'ps.created_at'
      : 'ps.id';

    let rows = await query(
      `SELECT ${selectFragments.join(', ')}
         FROM practice_sets ps
         ${joinClause}
        GROUP BY ps.id
        ORDER BY ${orderColumn} DESC`,
    );

    if (rows.length === 0) {
      await seedPracticeContent();
      rows = await query(
        `SELECT ${selectFragments.join(', ')}
           FROM practice_sets ps
           ${joinClause}
          GROUP BY ps.id
          ORDER BY ${orderColumn} DESC`,
      );
    }

    const sets = rows.map((row) => ({
      id: Number(row.id),
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
    const tableReady = await ensurePracticeTables(res);
    if (!tableReady) {
      return;
    }

    const result = await insertRecord('practice_sets', {
      title,
      description: description || null,
      difficulty,
      tags: stringifyTags(tags),
      created_by: req.session.user ? Number(req.session.user.id) : null,
    });

    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error('创建题单失败', error);
    res.status(500).json({ message: '创建题单失败，请稍后重试' });
  }
});

router.get('/sets/:setId/questions', requireAuth, async (req, res) => {
  const { setId } = req.params;

  try {
    const tableReady = await ensurePracticeTables(res, { requireQuestions: true });
    if (!tableReady) {
      return;
    }

    const questionColumns = await getTableColumns('practice_questions');
    const orderColumn = questionColumns.has('updated_at')
      ? 'updated_at'
      : questionColumns.has('created_at')
      ? 'created_at'
      : 'id';

    const selectFragments = [
      'id',
      'question_text',
      questionColumns.has('answer_text') ? 'answer_text' : "NULL AS answer_text",
      questionColumns.has('explanation') ? 'explanation' : "NULL AS explanation",
      questionColumns.has('tags') ? 'tags' : "NULL AS tags",
      questionColumns.has('difficulty') ? 'difficulty' : "NULL AS difficulty",
      questionColumns.has('created_at') ? 'created_at' : 'NULL AS created_at',
      questionColumns.has('updated_at') ? 'updated_at' : 'NULL AS updated_at',
    ];

    const rows = await query(
      `SELECT ${selectFragments.join(', ')}
         FROM practice_questions
        WHERE practice_set_id = :setId
        ORDER BY ${orderColumn} DESC`,
      { setId },
    );

    const questions = rows.map((row) => ({
      id: Number(row.id),
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
  const {
    questionText,
    answerText = '',
    explanation = '',
    tags = [],
    difficulty = 'medium',
  } = req.body || {};

  if (!questionText) {
    return res.status(400).json({ message: '题目内容不能为空' });
  }

  try {
    const tableReady = await ensurePracticeTables(res, { requireQuestions: true });
    if (!tableReady) {
      return;
    }

    const result = await insertRecord('practice_questions', {
      practice_set_id: setId,
      question_text: questionText,
      answer_text: answerText || null,
      explanation: explanation || null,
      tags: stringifyTags(tags),
      difficulty,
      created_by: req.session.user ? Number(req.session.user.id) : null,
    });

    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error('创建题目失败', error);
    res.status(500).json({ message: '录入题目失败，请稍后重试' });
  }
});

module.exports = router;
