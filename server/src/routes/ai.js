const express = require('express');
const {
  query,
  insertRecord,
  tableExists,
  getTableColumns,
  getTableColumnDetails,
} = require('../database');
const { requireAuth } = require('../middleware/auth');
const { normalizeIdentifier, normalizeValueForColumn } = require('../utils/db');

const router = express.Router();

const resolveColumn = (columns, candidates) => candidates.find((column) => columns.has(column)) || null;

const CONVERSATION_TABLE = 'ai_conversations';

const getConversationConfig = async () => {
  const columns = await getTableColumns(CONVERSATION_TABLE);

  if (columns.size === 0) {
    return null;
  }

  const columnDetails = await getTableColumnDetails(CONVERSATION_TABLE);

  return {
    tableName: CONVERSATION_TABLE,
    columns,
    columnDetails,
    id: resolveColumn(columns, ['id', 'conversation_id']),
    userId: resolveColumn(columns, ['user_id', 'student_id']),
    question: resolveColumn(columns, ['question', 'prompt']),
    answer: resolveColumn(columns, ['answer', 'response']),
    createdAt: resolveColumn(columns, ['created_at', 'create_time']),
  };
};

const createConversationPayload = (config, { userId, question, answer }) => {
  if (!config || !config.columns || !config.tableName) {
    return null;
  }

  const payload = {};

  if (config.userId) {
    payload[config.userId] = normalizeIdentifier(userId);
  }

  if (config.question) {
    payload[config.question] = normalizeValueForColumn(
      config.columnDetails,
      config.question,
      question,
    );
  }

  if (config.answer) {
    payload[config.answer] = normalizeValueForColumn(
      config.columnDetails,
      config.answer,
      answer,
    );
  }

  return payload;
};

const keywordTopics = [
  { id: 'english', keywords: ['英语', '作文', '写作', '翻译'], summary: '英语写作与语言输出' },
  { id: 'algorithm', keywords: ['算法', '408', '数据结构', '编程'], summary: '408 与算法训练' },
  { id: 'math', keywords: ['数学', '线代', '概率', '高数'], summary: '数学高频考点' },
  { id: 'politics', keywords: ['政治', '时政', '马原', '毛概'], summary: '政治与时政复习' },
  { id: 'interview', keywords: ['复试', '面试', '导师', '自我介绍'], summary: '复试面试准备' },
];

const detectTopics = (question) => {
  const matches = keywordTopics
    .filter((topic) => topic.keywords.some((keyword) => question.includes(keyword)))
    .map((topic) => topic.id);

  if (matches.length === 0) {
    return ['interview'];
  }

  return Array.from(new Set(matches));
};

const getCourseSuggestionConfig = async () => {
  if (!(await tableExists('courses'))) {
    return null;
  }

  const columns = await getTableColumns('courses');
  if (columns.size === 0) {
    return null;
  }

  const columnDetails = await getTableColumnDetails('courses');

  return {
    table: 'courses',
    columns,
    columnDetails,
    title: resolveColumn(columns, ['title', 'name', 'course_name']),
    teacher: resolveColumn(columns, ['teacher', 'teacher_name', 'lecturer']),
    category: resolveColumn(columns, ['category', 'type']),
    summary: resolveColumn(columns, ['summary', 'description', 'intro']),
    nextTask: resolveColumn(columns, ['next_task', 'schedule_info', 'release_window']),
    updatedAt: resolveColumn(columns, ['updated_at', 'update_time', 'created_at']),
  };
};

const getMaterialSuggestionConfig = async () => {
  if (!(await tableExists('materials'))) {
    return null;
  }

  const columns = await getTableColumns('materials');
  if (columns.size === 0) {
    return null;
  }

  const columnDetails = await getTableColumnDetails('materials');

  return {
    table: 'materials',
    columns,
    columnDetails,
    title: resolveColumn(columns, ['title', 'name']),
    type: resolveColumn(columns, ['material_type', 'type']),
    url: resolveColumn(columns, ['url', 'link']),
    description: resolveColumn(columns, ['description', 'summary']),
    updatedAt: resolveColumn(columns, ['updated_at', 'create_time', 'created_at']),
  };
};

const fetchCourseSuggestions = async (topics) => {
  const config = await getCourseSuggestionConfig();

  if (!config || !config.title) {
    return [];
  }

  const keywords = topics.flatMap((topic) => {
    const definition = keywordTopics.find((item) => item.id === topic);
    return definition ? definition.keywords.slice(0, 2) : [];
  });

  if (keywords.length === 0) {
    return [];
  }

  const conditions = [];
  const params = {};

  keywords.forEach((keyword, index) => {
    const key = `kw_${index}`;
    conditions.push(`t.\`${config.title}\` LIKE :${key}`);
    params[key] = `%${keyword}%`;
  });

  const whereSql = conditions.length ? `WHERE ${conditions.join(' OR ')}` : '';
  const orderColumn = config.updatedAt || config.title;

  const selectFragments = [
    `t.\`${config.title}\` AS title`,
    config.teacher ? `t.\`${config.teacher}\` AS teacher` : "'教研团队' AS teacher",
    config.summary ? `t.\`${config.summary}\` AS summary` : 'NULL AS summary',
    config.nextTask ? `t.\`${config.nextTask}\` AS next_task` : 'NULL AS next_task',
  ];

  const rows = await query(
    `SELECT ${selectFragments.join(', ')}
       FROM \`${config.table}\` t
       ${whereSql}
      ORDER BY t.\`${orderColumn}\` DESC
      LIMIT 3`,
    params,
  );

  return rows.map((row) => ({
    title: row.title || '课程推荐',
    teacher: row.teacher || '教研团队',
    highlight: row.summary || row.next_task || '围绕复试要求同步进度。',
  }));
};

const fetchMaterialSuggestions = async (topics) => {
  const config = await getMaterialSuggestionConfig();

  if (!config || !config.title) {
    return [];
  }

  const keywords = topics.flatMap((topic) => {
    const definition = keywordTopics.find((item) => item.id === topic);
    return definition ? definition.keywords.slice(0, 2) : [];
  });

  if (keywords.length === 0) {
    return [];
  }

  const conditions = [];
  const params = {};

  keywords.forEach((keyword, index) => {
    const key = `mat_${index}`;
    conditions.push(`m.\`${config.title}\` LIKE :${key}`);
    params[key] = `%${keyword}%`;
  });

  const whereSql = conditions.length ? `WHERE ${conditions.join(' OR ')}` : '';
  const orderColumn = config.updatedAt || config.title;

  const selectFragments = [
    `m.\`${config.title}\` AS title`,
    config.type ? `m.\`${config.type}\` AS material_type` : "'资料' AS material_type",
    config.url ? `m.\`${config.url}\` AS url` : 'NULL AS url',
    config.description ? `m.\`${config.description}\` AS description` : 'NULL AS description',
  ];

  const rows = await query(
    `SELECT ${selectFragments.join(', ')}
       FROM \`${config.table}\` m
       ${whereSql}
      ORDER BY m.\`${orderColumn}\` DESC
      LIMIT 3`,
    params,
  );

  return rows.map((row) => ({
    title: row.title || '复试资料',
    type: row.material_type || '资料',
    url: row.url || '',
    description: row.description || '结合课程进度及时查阅。',
  }));
};

const buildAnswer = async (question, sessionUser) => {
  const trimmed = question.trim();
  const topics = detectTopics(trimmed);
  const courseSuggestions = await fetchCourseSuggestions(topics);
  const materialSuggestions = await fetchMaterialSuggestions(topics);

  const advicePieces = [];

  if (topics.includes('english')) {
    advicePieces.push('先整理英语作文素材库，形成首段/结尾模板并以真题限时演练。');
  }
  if (topics.includes('algorithm')) {
    advicePieces.push('以真题高频考点为主线复盘代码实现，补齐图论与动态规划薄弱环节。');
  }
  if (topics.includes('math')) {
    advicePieces.push('梳理核心公式推导并针对薄弱章节做套题冲刺，保持计算熟练度。');
  }
  if (topics.includes('politics')) {
    advicePieces.push('结合近期时政热点整理答题框架，练习材料题速读与要点提炼。');
  }
  if (topics.includes('interview')) {
    advicePieces.push('准备结构化自我介绍并模拟导师追问，突出科研/项目成果。');
  }

  const lines = [];
  lines.push(`你提到“${trimmed}”，可以参考以下复习建议：`);

  if (advicePieces.length > 0) {
    lines.push(`• 核心思路：${advicePieces.join('；')}`);
  }

  if (courseSuggestions.length > 0) {
    const courseText = courseSuggestions
      .map((item) => `- ${item.title}（${item.teacher}）：${item.highlight}`)
      .join('\n');
    lines.push(`• 课程资源：\n${courseText}`);
  }

  if (materialSuggestions.length > 0) {
    const materialText = materialSuggestions
      .map((item) => {
        const link = item.url ? `（${item.url}）` : '';
        return `- ${item.title}${link}：${item.description}`;
      })
      .join('\n');
    lines.push(`• 资料推荐：\n${materialText}`);
  }

  const userName = sessionUser?.name || sessionUser?.display_name || '同学';
  lines.push(
    `坚持在学习打卡中记录完成情况，${userName} 已可直接在排行榜对比同校进度，保持连续性更容易建立优势。`,
  );

  return lines.join('\n\n');
};

router.post('/ask', requireAuth, async (req, res) => {
  const { question } = req.body || {};

  if (typeof question !== 'string' || !question.trim()) {
    return res.status(400).json({ message: '请填写要咨询的问题内容。' });
  }

  try {
    const normalizedQuestion = question.trim();
    const answer = await buildAnswer(normalizedQuestion, req.session?.user || null);
    const config = await getConversationConfig();

    if (config && config.userId && config.question && config.answer && req.session?.user?.id) {
      const payload = createConversationPayload(config, {
        userId: req.session.user.id,
        question: normalizedQuestion,
        answer,
      });

      if (payload) {
        await insertRecord(config.tableName, payload);
      }
    }

    res.json({ answer });
  } catch (error) {
    console.error('AI 助手回答失败', error);
    res.status(500).json({ message: 'AI 助手暂时不可用，请稍后再试。' });
  }
});

module.exports = router;
