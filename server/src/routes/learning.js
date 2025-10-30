const express = require('express');
const {
  query,
  insertRecord,
  tableExists,
  getTableColumns,
} = require('../database');
const { requireAuth } = require('../middleware/auth');
const { normalizeDate, toMySqlDateTime } = require('../utils/formatters');

const router = express.Router();

const resolveColumn = (columns, candidates) => candidates.find((column) => columns.has(column)) || null;

const getCourseConfig = async () => {
  const columns = await getTableColumns('courses');

  if (columns.size === 0) {
    return null;
  }

  return {
    table: 'courses',
    columns,
    id: resolveColumn(columns, ['id', 'course_id']),
    title: resolveColumn(columns, ['title', 'name', 'course_name']),
    teacher: resolveColumn(columns, ['teacher', 'teacher_name', 'lecturer']),
    category: resolveColumn(columns, ['category', 'type', 'course_category']),
    progress: resolveColumn(columns, ['progress', 'completion', 'completion_rate']),
    nextTask: resolveColumn(columns, ['next_task', 'upcoming_task', 'next_step']),
    description: resolveColumn(columns, ['description', 'summary', 'intro']),
    createdAt: resolveColumn(columns, ['created_at', 'create_time']),
    updatedAt: resolveColumn(columns, ['updated_at', 'update_time']),
  };
};

const formatCourseRow = (row, index = 0) => ({
  id: String(row.id != null ? row.id : index + 1),
  title: row.title || '课程待完善',
  category: row.category || '公共课',
  teacher: row.teacher || '待定讲师',
  progress: row.progress != null ? Math.min(100, Math.max(0, Number(row.progress))) : 0,
  nextTask: row.next_task || '请为课程安排下一次学习任务',
});

const createCoursePayload = (config, { title, teacher, category, progress, nextTask, description }) => {
  const payload = {};

  if (config.title) {
    payload[config.title] = title;
  }

  if (config.teacher) {
    payload[config.teacher] = teacher ?? null;
  }

  if (config.category) {
    payload[config.category] = category ?? null;
  }

  if (config.progress) {
    payload[config.progress] = progress ?? 0;
  }

  if (config.nextTask) {
    payload[config.nextTask] = nextTask ?? null;
  }

  if (config.description) {
    payload[config.description] = description ?? null;
  }

  return payload;
};

const scheduleTableCandidates = ['study_schedule', 'study_tasks', 'schedule_events'];

const getScheduleConfig = async () => {
  for (const table of scheduleTableCandidates) {
    const columns = await getTableColumns(table);
    if (columns.size === 0) {
      continue;
    }

    return {
      table,
      columns,
      id: resolveColumn(columns, ['id', 'event_id', 'task_id']),
      title: resolveColumn(columns, ['title', 'name', 'task_name']),
      type: resolveColumn(columns, ['type', 'category', 'task_type']),
      start: resolveColumn(columns, ['start_time', 'start_at', 'begin_time']),
      end: resolveColumn(columns, ['end_time', 'end_at', 'finish_time']),
      allDay: resolveColumn(columns, ['all_day', 'is_all_day']),
      location: resolveColumn(columns, ['location', 'place']),
      userId: resolveColumn(columns, ['user_id', 'student_id', 'owner_id']),
      createdAt: resolveColumn(columns, ['created_at', 'create_time']),
      updatedAt: resolveColumn(columns, ['updated_at', 'update_time']),
    };
  }

  return null;
};

const formatScheduleRow = (row, index = 0) => ({
  id: String(row.id != null ? row.id : index + 1),
  title: row.title || '待办事项',
  type: row.type || '自习',
  start: normalizeDate(row.start_time) || normalizeDate(row.created_at) || new Date().toISOString(),
  end: normalizeDate(row.end_time) || normalizeDate(row.updated_at) || normalizeDate(row.start_time) || new Date().toISOString(),
  location: row.location || undefined,
});

const createSchedulePayload = (config, { title, type, start, end, allDay, userId, location }) => {
  const payload = {};

  if (config.title) {
    payload[config.title] = title;
  }

  if (config.type) {
    payload[config.type] = type ?? '自习';
  }

  if (config.start) {
    payload[config.start] = toMySqlDateTime(start);
  }

  if (config.end) {
    payload[config.end] = toMySqlDateTime(end);
  }

  if (config.allDay) {
    payload[config.allDay] = allDay ? 1 : 0;
  }

  if (config.location) {
    payload[config.location] = location ?? null;
  }

  if (config.userId) {
    payload[config.userId] = userId ?? null;
  }

  return payload;
};

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
    tags: resolveColumn(columns, ['tags', 'tags_json', 'tag_list']),
    accuracy: resolveColumn(columns, ['accuracy', 'accuracy_rate', 'correct_rate']),
    createdAt: resolveColumn(columns, ['created_at', 'create_time']),
    updatedAt: resolveColumn(columns, ['updated_at', 'update_time']),
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
  };
};

const loadCourses = async (limit = 12) => {
  const config = await getCourseConfig();
  if (!config) {
    return [];
  }

  const selectFragments = [
    config.id ? `c.\`${config.id}\` AS id` : 'NULL AS id',
    config.title ? `c.\`${config.title}\` AS title` : "'课程待完善' AS title",
    config.teacher ? `c.\`${config.teacher}\` AS teacher` : 'NULL AS teacher',
    config.category ? `c.\`${config.category}\` AS category` : "'公共课' AS category",
    config.progress ? `c.\`${config.progress}\` AS progress` : '0 AS progress',
    config.nextTask ? `c.\`${config.nextTask}\` AS next_task` : 'NULL AS next_task',
  ];

  const orderColumn = config.updatedAt
    ? `c.\`${config.updatedAt}\``
    : config.createdAt
    ? `c.\`${config.createdAt}\``
    : config.id
    ? `c.\`${config.id}\``
    : 'c.id';

  const rows = await query(
    `SELECT ${selectFragments.join(', ')}
       FROM courses c
      ORDER BY ${orderColumn} DESC
      LIMIT :limit`,
    { limit },
  );

  return rows.map((row, index) => formatCourseRow(row, index));
};

const loadSchedule = async (userId, limit = 20) => {
  const config = await getScheduleConfig();
  if (!config || !config.start || !config.end) {
    return [];
  }

  const selectFragments = [
    config.id ? `s.\`${config.id}\` AS id` : 'NULL AS id',
    config.title ? `s.\`${config.title}\` AS title` : "'学习任务' AS title",
    config.type ? `s.\`${config.type}\` AS type` : "'自习' AS type",
    `s.\`${config.start}\` AS start_time`,
    `s.\`${config.end}\` AS end_time`,
    config.location ? `s.\`${config.location}\` AS location` : 'NULL AS location',
    config.createdAt ? `s.\`${config.createdAt}\` AS created_at` : 'NULL AS created_at',
    config.updatedAt ? `s.\`${config.updatedAt}\` AS updated_at` : 'NULL AS updated_at',
  ];

  const whereClauses = [];
  const params = { limit };

  if (config.userId && userId) {
    whereClauses.push(`s.\`${config.userId}\` = :userId`);
    params.userId = userId;
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
  const orderColumn = config.start ? `s.\`${config.start}\`` : 's.id';

  const rows = await query(
    `SELECT ${selectFragments.join(', ')}
       FROM ${config.table} s
       ${whereSql}
      ORDER BY ${orderColumn} ASC
      LIMIT :limit`,
    params,
  );

  return rows.map((row, index) => formatScheduleRow(row, index));
};

const loadPracticePreview = async (limit = 3) => {
  const setConfig = await getPracticeSetConfig();
  if (!setConfig || !setConfig.id) {
    return [];
  }

  const hasQuestions = await tableExists('practice_questions');
  const questionConfig = hasQuestions ? await getPracticeQuestionConfig() : null;

  const selectFragments = [
    `ps.\`${setConfig.id}\` AS id`,
    setConfig.title ? `ps.\`${setConfig.title}\` AS title` : "'题单' AS title",
    setConfig.description ? `ps.\`${setConfig.description}\` AS description` : 'NULL AS description',
    setConfig.tags ? `ps.\`${setConfig.tags}\` AS tags` : 'NULL AS tags',
    setConfig.accuracy ? `ps.\`${setConfig.accuracy}\` AS accuracy` : 'NULL AS accuracy',
    setConfig.updatedAt ? `ps.\`${setConfig.updatedAt}\` AS updated_at` : 'NULL AS updated_at',
    setConfig.createdAt ? `ps.\`${setConfig.createdAt}\` AS created_at` : 'NULL AS created_at',
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

  const rows = await query(
    `SELECT ${selectFragments.join(', ')}
       FROM practice_sets ps
       ${joinClause}
      GROUP BY ps.\`${setConfig.id}\`
      ORDER BY ${orderColumn} DESC
      LIMIT :limit`,
    { limit },
  );

  return rows.map((row, index) => ({
    id: String(row.id != null ? row.id : index + 1),
    name: row.title || '题单',
    questions: Number(row.questionCount) || 0,
    accuracy: row.accuracy != null ? Number(row.accuracy) : 0,
    lastAttempt: normalizeDate(row.updated_at) || normalizeDate(row.created_at) || null,
  }));
};

const buildStats = async () => {
  const stats = [];

  const scheduleConfig = await getScheduleConfig();
  if (scheduleConfig) {
    const [row] = await query(`SELECT COUNT(*) AS total FROM \`${scheduleConfig.table}\``);
    stats.push({
      id: 'studyTime',
      title: '记录的学习日程',
      value: `${Number(row?.total) || 0} 项`,
      helperText: '将计划写入系统即可随时查看提醒',
      accent: 'rgba(25, 118, 210, 0.2)',
    });
  }

  if (await tableExists('practice_questions')) {
    const [row] = await query('SELECT COUNT(*) AS total FROM practice_questions');
    stats.push({
      id: 'questionDrill',
      title: '题库覆盖',
      value: `${Number(row?.total) || 0} 题`,
      helperText: '题目均可自定义添加并持久化到数据库',
      accent: 'rgba(255, 112, 67, 0.25)',
    });
  }

  const courseConfig = await getCourseConfig();
  if (courseConfig) {
    const [row] = await query('SELECT COUNT(*) AS total FROM courses');
    stats.push({
      id: 'courseFocus',
      title: '课程体系',
      value: `${Number(row?.total) || 0} 门`,
      helperText: '课程支持管理员或导师随时增补',
      accent: 'rgba(102, 187, 106, 0.25)',
    });
  }

  if (stats.length < 3) {
    stats.push({
      id: 'mockRank',
      title: '学习进度',
      value: '待同步',
      helperText: '完善课程、题库与日程后即可生成学习分析',
      accent: 'rgba(255, 213, 79, 0.35)',
    });
  } else {
    stats.push({
      id: 'mockRank',
      title: '阶段模考建议',
      value: '保持冲刺',
      helperText: '建议每两周进行一次模拟考试检验复习效果',
      accent: 'rgba(255, 213, 79, 0.35)',
    });
  }

  return stats;
};

router.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const userName = req.session?.user?.name || '同学';
    const [courses, practiceSets, schedule, stats] = await Promise.all([
      loadCourses(6),
      loadPracticePreview(3),
      loadSchedule(req.session?.user?.id ? Number(req.session.user.id) : null, 6),
      buildStats(),
    ]);

    const recommendation =
      practiceSets.length > 0
        ? `推荐从「${practiceSets[0].name}」开始复习，并在完成后同步更新课程进度。`
        : '暂未检测到题库或课程数据，建议先在课程体系与刷题训练中新增内容。';

    res.json({
      userName,
      stats,
      courses,
      practiceSets,
      schedule,
      recommendation,
    });
  } catch (error) {
    console.error('加载学习看板失败', error);
    res.status(500).json({ message: '无法加载学习看板数据，请稍后重试' });
  }
});

router.get('/courses', requireAuth, async (req, res) => {
  try {
    const courses = await loadCourses();
    res.json({ courses });
  } catch (error) {
    console.error('获取课程列表失败', error);
    res.status(500).json({ message: '无法加载课程列表，请稍后重试' });
  }
});

router.post('/courses', requireAuth, async (req, res) => {
  const { title, teacher, category, progress = 0, nextTask, description } = req.body || {};

  if (!title) {
    return res.status(400).json({ message: '课程标题不能为空' });
  }

  try {
    const config = await getCourseConfig();

    if (!config) {
      return res
        .status(500)
        .json({ message: 'courses 表不存在，请先在数据库中创建课程数据表。' });
    }

    if (!config.title) {
      return res
        .status(500)
        .json({ message: 'courses 表缺少标题字段（title/name），请补充数据表结构。' });
    }

    const payload = createCoursePayload(config, {
      title,
      teacher,
      category,
      progress: Math.min(100, Math.max(0, Number(progress))),
      nextTask,
      description,
    });

    const result = await insertRecord('courses', payload);

    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error('创建课程失败', error);
    res.status(500).json({ message: '创建课程失败，请稍后重试' });
  }
});

router.get('/schedule', requireAuth, async (req, res) => {
  try {
    const schedule = await loadSchedule(req.session?.user?.id ? Number(req.session.user.id) : null);
    res.json({ schedule });
  } catch (error) {
    console.error('获取学习日程失败', error);
    res.status(500).json({ message: '无法加载学习日程，请稍后重试' });
  }
});

router.post('/schedule', requireAuth, async (req, res) => {
  const { title, type = '自习', start, end, allDay = false, location } = req.body || {};

  if (!title || !start || !end) {
    return res.status(400).json({ message: '请填写日程标题、开始时间与结束时间' });
  }

  try {
    const config = await getScheduleConfig();

    if (!config || !config.start || !config.end) {
      return res
        .status(500)
        .json({ message: '当前缺少学习日程表或未配置开始/结束时间字段，请完善数据库结构后再试。' });
    }

    const payload = createSchedulePayload(config, {
      title,
      type,
      start,
      end,
      allDay,
      userId: req.session?.user?.id ? Number(req.session.user.id) : null,
      location,
    });

    const result = await insertRecord(config.table, payload);

    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error('创建日程失败', error);
    res.status(500).json({ message: '创建日程失败，请稍后重试' });
  }
});

module.exports = router;
