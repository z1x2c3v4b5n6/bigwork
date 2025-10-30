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

const resolveColumn = (columns, candidates) => candidates.find((column) => columns.has(column)) || null;

const getPracticeSetConfig = async () => {
  const columns = await getTableColumns('practice_sets');

  if (columns.size === 0) {
    return null;
  }

  return {
    columns,
    id: resolveColumn(columns, ['id', 'set_id', 'practice_set_id']),
    title: resolveColumn(columns, ['title', 'name', 'set_title']),
    description: resolveColumn(columns, ['description', 'summary', 'intro']),
    difficulty: resolveColumn(columns, ['difficulty', 'level']),
    tags: resolveColumn(columns, ['tags', 'tags_json', 'tag_list']),
    createdBy: resolveColumn(columns, ['created_by', 'creator_id', 'owner_id']),
    createdAt: resolveColumn(columns, ['created_at', 'create_time', 'created_on']),
    updatedAt: resolveColumn(columns, ['updated_at', 'update_time', 'modified_at']),
  };
};

const getPracticeQuestionConfig = async () => {
  const columns = await getTableColumns('practice_questions');

  if (columns.size === 0) {
    return null;
  }

  return {
    columns,
    id: resolveColumn(columns, ['id', 'question_id']),
    setId: resolveColumn(columns, ['practice_set_id', 'set_id', 'collection_id']),
    questionText: resolveColumn(columns, ['question_text', 'question', 'content']),
    answerText: resolveColumn(columns, ['answer_text', 'answer', 'solution']),
    explanation: resolveColumn(columns, ['explanation', 'analysis', 'commentary']),
    tags: resolveColumn(columns, ['tags', 'tags_json', 'tag_list']),
    difficulty: resolveColumn(columns, ['difficulty', 'level']),
    createdAt: resolveColumn(columns, ['created_at', 'create_time']),
    updatedAt: resolveColumn(columns, ['updated_at', 'update_time']),
  };
};

const createSetPayload = (config, { title, description, difficulty, tags, createdBy }) => {
  const payload = {};

  if (config.title && title !== undefined) {
    payload[config.title] = title;
  }

  if (config.description) {
    payload[config.description] = description ?? null;
  }

  if (config.difficulty && difficulty !== undefined) {
    payload[config.difficulty] = difficulty;
  }

  if (config.tags) {
    payload[config.tags] = stringifyTags(tags);
  }

  if (config.createdBy) {
    payload[config.createdBy] = createdBy ?? null;
  }

  return payload;
};

const createQuestionPayload = (
  config,
  setId,
  { questionText, answerText, explanation, tags, difficulty },
) => {
  const payload = {};

  if (config.setId) {
    payload[config.setId] = setId;
  }

  if (config.questionText) {
    payload[config.questionText] = questionText;
  }

  if (config.answerText) {
    payload[config.answerText] = answerText ?? null;
  }

  if (config.explanation) {
    payload[config.explanation] = explanation ?? null;
  }

  if (config.tags) {
    payload[config.tags] = stringifyTags(tags);
  }

  if (config.difficulty && difficulty !== undefined) {
    payload[config.difficulty] = difficulty;
  }

  return payload;
};

const formatSetRow = (row, index = 0) => ({
  id: row.id != null ? Number(row.id) : index + 1,
  title: row.title || '未命名题单',
  description: row.description || '',
  difficulty: row.difficulty || 'medium',
  tags: parseTags(row.tags),
  questionCount: Number(row.questionCount) || 0,
  createdAt: normalizeDate(row.created_at),
  updatedAt: normalizeDate(row.updated_at),
});

const formatQuestionRow = (row, index = 0) => ({
  id: row.id != null ? Number(row.id) : index + 1,
  questionText: row.question_text || '该题暂无题干',
  answerText: row.answer_text || '',
  explanation: row.explanation || '',
  tags: parseTags(row.tags),
  difficulty: row.difficulty || 'medium',
  createdAt: normalizeDate(row.created_at),
  updatedAt: normalizeDate(row.updated_at),
});

const seedPracticeContent = async (setConfig, questionConfig) => {
  try {
    if (!setConfig?.id || !setConfig?.title) {
      return;
    }

    const existing = await query('SELECT COUNT(*) AS total FROM practice_sets');
    if (Number(existing[0]?.total) > 0) {
      return;
    }

    const setPayload = createSetPayload(setConfig, {
      title: '数学强化题单',
      description: '基础高等数学训练题集，覆盖极限、线性代数与概率论核心考点。',
      difficulty: 'hard',
      tags: ['数学', '强化训练'],
      createdBy: null,
    });

    const setResult = await insertRecord('practice_sets', setPayload);

    if (!questionConfig?.id || !questionConfig?.setId || !questionConfig?.questionText) {
      return;
    }

    const setId = setResult.insertId;
    if (!setId) {
      return;
    }

    const sampleQuestions = [
      {
        questionText: '已知数列 a_n 满足 a_1 = 1, a_{n+1} = 2a_n + 1，求通项公式。',
        answerText: 'a_n = 2^n - 1',
        explanation: '通过递推计算或设 b_n = a_n + 1 可化为等比数列求解。',
        tags: ['数学一', '数列'],
        difficulty: 'medium',
      },
      {
        questionText: '设随机变量 X ~ N(0,1)，求 P(|X| ≤ 1.96)。',
        answerText: '约为 0.95',
        explanation: '标准正态分布在区间 [-1.96, 1.96] 内的概率约为 95%。',
        tags: ['概率论', '统计'],
        difficulty: 'easy',
      },
      {
        questionText: '判断矩阵 A = [[1,2],[3,4]] 是否可逆，并求其逆矩阵。',
        answerText: '可逆，A^{-1} = [[-2,1],[1.5,-0.5]]',
        explanation: '行列式 det(A) = -2 ≠ 0，可逆；利用伴随矩阵或初等变换计算逆矩阵。',
        tags: ['线性代数'],
        difficulty: 'medium',
      },
    ];

    for (const question of sampleQuestions) {
      const payload = createQuestionPayload(questionConfig, setId, question);
      await insertRecord('practice_questions', payload);
    }
  } catch (error) {
    console.warn('初始化题库示例数据失败', error.message);
  }
};

router.get('/sets', requireAuth, async (req, res) => {
  try {
    const setConfig = await getPracticeSetConfig();

    if (!setConfig) {
      return res
        .status(500)
        .json({ message: 'practice_sets 表不存在，请按照 README 说明手动创建后再试。' });
    }

    if (!setConfig.id) {
      return res
        .status(500)
        .json({ message: 'practice_sets 表缺少 id 字段，请为题单表添加自增主键（例如 id BIGINT UNSIGNED）。' });
    }

    const hasQuestionTable = await tableExists('practice_questions');
    const questionConfig = hasQuestionTable ? await getPracticeQuestionConfig() : null;

    const selectFragments = [
      `ps.\`${setConfig.id}\` AS id`,
      setConfig.title ? `ps.\`${setConfig.title}\` AS title` : "'未命名题单' AS title",
      setConfig.description ? `ps.\`${setConfig.description}\` AS description` : 'NULL AS description',
      setConfig.difficulty ? `ps.\`${setConfig.difficulty}\` AS difficulty` : "'medium' AS difficulty",
      setConfig.tags ? `ps.\`${setConfig.tags}\` AS tags` : 'NULL AS tags',
      setConfig.createdAt ? `ps.\`${setConfig.createdAt}\` AS created_at` : 'NULL AS created_at',
      setConfig.updatedAt ? `ps.\`${setConfig.updatedAt}\` AS updated_at` : 'NULL AS updated_at',
    ];

    let joinClause = '';
    if (questionConfig?.id && questionConfig?.setId) {
      selectFragments.push(`COUNT(pq.\`${questionConfig.id}\`) AS questionCount`);
      joinClause = `LEFT JOIN practice_questions pq ON pq.\`${questionConfig.setId}\` = ps.\`${setConfig.id}\``;
    } else {
      selectFragments.push('0 AS questionCount');
    }

    const orderColumn = setConfig.updatedAt
      ? `ps.\`${setConfig.updatedAt}\``
      : setConfig.createdAt
      ? `ps.\`${setConfig.createdAt}\``
      : `ps.\`${setConfig.id}\``;

    let rows = await query(
      `SELECT ${selectFragments.join(', ')}
         FROM practice_sets ps
         ${joinClause}
        GROUP BY ps.\`${setConfig.id}\`
        ORDER BY ${orderColumn} DESC`,
    );

    if (rows.length === 0) {
      await seedPracticeContent(setConfig, questionConfig);
      rows = await query(
        `SELECT ${selectFragments.join(', ')}
           FROM practice_sets ps
           ${joinClause}
          GROUP BY ps.\`${setConfig.id}\`
          ORDER BY ${orderColumn} DESC`,
      );
    }

    const sets = rows.map((row, index) => formatSetRow(row, index));

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
    const setConfig = await getPracticeSetConfig();

    if (!setConfig) {
      return res
        .status(500)
        .json({ message: 'practice_sets 表不存在，请按照 README 说明手动创建后再试。' });
    }

    if (!setConfig.title) {
      return res
        .status(500)
        .json({ message: 'practice_sets 表缺少标题字段（例如 title 或 name），请补充数据表结构。' });
    }

    const payload = createSetPayload(setConfig, {
      title,
      description,
      difficulty,
      tags,
      createdBy: req.session.user ? Number(req.session.user.id) : null,
    });

    const result = await insertRecord('practice_sets', payload);

    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error('创建题单失败', error);
    res.status(500).json({ message: '创建题单失败，请稍后重试' });
  }
});

router.get('/sets/:setId/questions', requireAuth, async (req, res) => {
  const { setId } = req.params;

  try {
    const setConfig = await getPracticeSetConfig();
    const questionConfig = await getPracticeQuestionConfig();

    if (!setConfig || !setConfig.id) {
      return res
        .status(500)
        .json({ message: 'practice_sets 表缺少主键 id，请调整结构后重试。' });
    }

    if (!questionConfig) {
      return res
        .status(500)
        .json({ message: 'practice_questions 表不存在，请先创建题目表后再查询。' });
    }

    if (!questionConfig.setId || !questionConfig.id) {
      return res
        .status(500)
        .json({ message: 'practice_questions 表缺少 practice_set_id 关联字段，请补充数据表结构。' });
    }

    const selectFragments = [
      `pq.\`${questionConfig.id}\` AS id`,
      questionConfig.questionText
        ? `pq.\`${questionConfig.questionText}\` AS question_text`
        : "'' AS question_text",
      questionConfig.answerText
        ? `pq.\`${questionConfig.answerText}\` AS answer_text`
        : 'NULL AS answer_text',
      questionConfig.explanation
        ? `pq.\`${questionConfig.explanation}\` AS explanation`
        : 'NULL AS explanation',
      questionConfig.tags ? `pq.\`${questionConfig.tags}\` AS tags` : 'NULL AS tags',
      questionConfig.difficulty
        ? `pq.\`${questionConfig.difficulty}\` AS difficulty`
        : "'medium' AS difficulty",
      questionConfig.createdAt
        ? `pq.\`${questionConfig.createdAt}\` AS created_at`
        : 'NULL AS created_at',
      questionConfig.updatedAt
        ? `pq.\`${questionConfig.updatedAt}\` AS updated_at`
        : 'NULL AS updated_at',
    ];

    const orderColumn = questionConfig.updatedAt
      ? `pq.\`${questionConfig.updatedAt}\``
      : questionConfig.createdAt
      ? `pq.\`${questionConfig.createdAt}\``
      : `pq.\`${questionConfig.id}\``;

    const rows = await query(
      `SELECT ${selectFragments.join(', ')}
         FROM practice_questions pq
        WHERE pq.\`${questionConfig.setId}\` = :setId
        ORDER BY ${orderColumn} ASC, pq.\`${questionConfig.id}\` ASC`,
      { setId },
    );

    const questions = rows.map((row, index) => formatQuestionRow(row, index));

    res.json({ questions });
  } catch (error) {
    console.error('获取题目失败', error);
    res.status(500).json({ message: '加载题目失败，请稍后重试' });
  }
});

router.post('/sets/:setId/questions', requireAuth, async (req, res) => {
  const { setId } = req.params;
  const { questionText, answerText, explanation, tags = [], difficulty = 'medium' } = req.body || {};

  if (!questionText) {
    return res.status(400).json({ message: '题目内容不能为空' });
  }

  try {
    const questionConfig = await getPracticeQuestionConfig();

    if (!questionConfig) {
      return res
        .status(500)
        .json({ message: 'practice_questions 表不存在，请先创建题目表后再试。' });
    }

    if (!questionConfig.setId) {
      return res
        .status(500)
        .json({ message: 'practice_questions 表缺少题单关联字段（practice_set_id），请补充数据表结构。' });
    }

    if (!questionConfig.questionText) {
      return res
        .status(500)
        .json({ message: 'practice_questions 表缺少题干字段（question_text/content），请补充数据表结构。' });
    }

    const payload = createQuestionPayload(questionConfig, setId, {
      questionText,
      answerText,
      explanation,
      tags,
      difficulty,
    });

    const result = await insertRecord('practice_questions', payload);

    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error('创建题目失败', error);
    res.status(500).json({ message: '录入题目失败，请稍后重试' });
  }
});

module.exports = router;
