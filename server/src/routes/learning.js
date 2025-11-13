const express = require('express');
const {
  query,
  insertRecord,
  tableExists,
  getTableColumns,
  getTableColumnDetails,
} = require('../database');
const { requireAuth } = require('../middleware/auth');
const { normalizeDate, parseTags, stringifyTags, toMySqlDateTime } = require('../utils/formatters');
const { normalizeIdentifier, normalizeValueForColumn } = require('../utils/db');
const { getDefaultMajorId } = require('../utils/majors');
const { buildRecommendationResponse, buildSubjectRecommendations } = require('../utils/universityAdvisor');
const { listFollowedInstitutions, listPushMessages } = require('../data/institutionState');
const { getExamProfile } = require('../data/userExtras');
const {
  getFallbackTaskForDate,
  recordFallbackCompletion,
  getFallbackCompletionDates,
  getFallbackLeaderboard,
} = require('../data/learningFallback');

const router = express.Router();

const resolveColumn = (columns, candidates) => candidates.find((column) => columns.has(column)) || null;

const DAILY_TASK_TABLE = 'daily_learning_tasks';
const DAILY_TASK_COMPLETION_TABLE = 'daily_task_completions';

const formatDateOnly = (value) => {
  if (!value) {
    return null;
  }

  const base = value instanceof Date ? new Date(value.getTime()) : new Date(value);

  if (Number.isNaN(base.getTime())) {
    return null;
  }

  base.setHours(0, 0, 0, 0);
  const year = base.getFullYear();
  const month = `${base.getMonth() + 1}`.padStart(2, '0');
  const day = `${base.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const differenceInDays = (left, right) => {
  const leftDate = formatDateOnly(left);
  const rightDate = formatDateOnly(right);

  if (!leftDate || !rightDate) {
    return Number.NaN;
  }

  const leftTime = new Date(`${leftDate}T00:00:00`).getTime();
  const rightTime = new Date(`${rightDate}T00:00:00`).getTime();
  return Math.round((leftTime - rightTime) / (24 * 60 * 60 * 1000));
};

const computeStreakFromDates = (dates = [], today = formatDateOnly(new Date())) => {
  const uniqueDates = Array.from(
    new Set(
      dates
        .map((date) => formatDateOnly(date))
        .filter((value) => typeof value === 'string' && value.length === 10),
    ),
  ).sort();

  const totalCompletedDays = uniqueDates.length;

  if (uniqueDates.length === 0) {
    return {
      streak: 0,
      completedToday: false,
      lastCompletedDate: null,
      totalCompletedDays,
    };
  }

  const lastDate = uniqueDates[uniqueDates.length - 1];
  const diffToToday = differenceInDays(today, lastDate);

  if (!Number.isFinite(diffToToday) || diffToToday > 1) {
    return {
      streak: 0,
      completedToday: diffToToday === 0,
      lastCompletedDate: lastDate,
      totalCompletedDays,
    };
  }

  if (diffToToday < 0) {
    return {
      streak: 0,
      completedToday: false,
      lastCompletedDate: lastDate,
      totalCompletedDays,
    };
  }

  let streak = 1;
  let cursor = lastDate;

  for (let index = uniqueDates.length - 2; index >= 0; index -= 1) {
    const current = uniqueDates[index];
    const diff = differenceInDays(cursor, current);

    if (!Number.isFinite(diff)) {
      continue;
    }

    if (diff === 1) {
      streak += 1;
      cursor = current;
      continue;
    }

    if (diff <= 0) {
      continue;
    }

    break;
  }

  return {
    streak,
    completedToday: diffToToday === 0,
    lastCompletedDate: lastDate,
    totalCompletedDays,
  };
};

const buildInClause = (values = [], prefix = 'p') => {
  if (!Array.isArray(values) || values.length === 0) {
    return { clause: '', params: {} };
  }

  const params = {};
  const placeholders = values
    .map((value, index) => {
      const key = `${prefix}_${index}`;
      params[key] = value;
      return `:${key}`;
    })
    .filter(Boolean);

  if (placeholders.length === 0) {
    return { clause: '', params: {} };
  }

  return { clause: placeholders.join(', '), params };
};

const getDailyTaskConfig = async () => {
  const columns = await getTableColumns(DAILY_TASK_TABLE);

  if (columns.size === 0) {
    return null;
  }

  const columnDetails = await getTableColumnDetails(DAILY_TASK_TABLE);

  return {
    table: DAILY_TASK_TABLE,
    columns,
    columnDetails,
    id: resolveColumn(columns, ['id', 'task_id']),
    date: resolveColumn(columns, ['task_date', 'date']),
    title: resolveColumn(columns, ['title', 'name']),
    description: resolveColumn(columns, ['description', 'intro', 'content']),
    targetText: resolveColumn(columns, ['target_text', 'target', 'action_text']),
    estimatedMinutes: resolveColumn(columns, ['estimated_minutes', 'duration_minutes', 'duration']),
    createdAt: resolveColumn(columns, ['created_at', 'create_time']),
    updatedAt: resolveColumn(columns, ['updated_at', 'update_time']),
  };
};

const getDailyTaskCompletionConfig = async () => {
  const columns = await getTableColumns(DAILY_TASK_COMPLETION_TABLE);

  if (columns.size === 0) {
    return null;
  }

  const columnDetails = await getTableColumnDetails(DAILY_TASK_COMPLETION_TABLE);

  return {
    table: DAILY_TASK_COMPLETION_TABLE,
    columns,
    columnDetails,
    id: resolveColumn(columns, ['id', 'log_id']),
    taskId: resolveColumn(columns, ['task_id', 'daily_task_id']),
    userId: resolveColumn(columns, ['user_id', 'student_id']),
    completedAt: resolveColumn(columns, ['completed_at', 'finish_time', 'created_at']),
    createdAt: resolveColumn(columns, ['created_at', 'create_time']),
    updatedAt: resolveColumn(columns, ['updated_at', 'update_time']),
  };
};

const mapDailyTaskRow = (row) => ({
  id: row.id != null ? String(row.id) : '',
  title: row.title || '今日任务待发布',
  description: row.description || '',
  targetText: row.target_text || row.targetText || '请保持专注完成打卡任务',
  estimatedMinutes: Number(row.estimated_minutes ?? row.estimatedMinutes ?? 45) || 45,
});

const ensureDailyTaskForDate = async (config, today) => {
  if (!config || !config.table || !config.date) {
    return null;
  }

  const fallbackTask =
    getFallbackTaskForDate(today) ||
    getFallbackTaskForDate(new Date()) || {
      id: `fallback-${today}`,
      title: '今日任务待发布',
      description: '',
      targetText: '请保持专注完成打卡任务',
      estimatedMinutes: 45,
    };

  const payload = {};

  const assignValue = (columnName, rawValue, defaultValue = undefined) => {
    if (!columnName) {
      return;
    }
    const normalized = normalizeValueForColumn(config.columnDetails, columnName, rawValue);
    if (normalized !== undefined && normalized !== null) {
      payload[columnName] = normalized;
      return;
    }
    if (defaultValue !== undefined) {
      payload[columnName] = defaultValue;
    }
  };

  if (config.id) {
    const fallbackId =
      fallbackTask?.id || `${today}-${Math.random().toString(36).slice(2, 10)}`;
    const normalizedId = normalizeValueForColumn(config.columnDetails, config.id, fallbackId);
    if (normalizedId !== undefined && normalizedId !== null) {
      payload[config.id] = normalizedId;
    }
  }

  assignValue(config.date, today, today);
  assignValue(config.title, fallbackTask?.title || '今日任务待发布', '今日任务待发布');
  assignValue(config.description, fallbackTask?.description || '', '');
  assignValue(config.targetText, fallbackTask?.targetText || '请保持专注完成打卡任务', '请保持专注完成打卡任务');
  assignValue(
    config.estimatedMinutes,
    Number(fallbackTask?.estimatedMinutes ?? 45),
    45,
  );

  if (Object.keys(payload).length === 0) {
    return null;
  }

  try {
    await insertRecord(config.table, payload);
  } catch (error) {
    if (error?.code !== 'ER_DUP_ENTRY') {
      console.warn('ensureDailyTaskForDate insert failed', error);
    }
  }

  return null;
};

const loadDailyTaskForDate = async (targetDate) => {
  const today = formatDateOnly(targetDate) || formatDateOnly(new Date());
  const config = await getDailyTaskConfig();

  if (!today) {
    return getFallbackTaskForDate(targetDate);
  }

  if (!config || !config.id) {
    return getFallbackTaskForDate(today);
  }

  const dateColumn = config.date || config.createdAt || config.updatedAt;

  if (!dateColumn) {
    return getFallbackTaskForDate(today);
  }

  const selectFragments = [
    `t.\`${config.id}\` AS id`,
    config.title ? `t.\`${config.title}\` AS title` : "'今日任务待发布' AS title",
    config.description ? `t.\`${config.description}\` AS description` : 'NULL AS description',
    config.targetText ? `t.\`${config.targetText}\` AS target_text` : 'NULL AS target_text',
    config.estimatedMinutes
      ? `t.\`${config.estimatedMinutes}\` AS estimated_minutes`
      : 'NULL AS estimated_minutes',
  ];

  const orderColumn = config.updatedAt || config.createdAt || config.id;

  let rows = await query(
    `
    SELECT ${selectFragments.join(', ')}
    FROM \`${config.table}\` t
    WHERE DATE(t.\`${dateColumn}\`) = :target
    ORDER BY t.\`${orderColumn || config.id}\` DESC
    LIMIT 1
    `,
    { target: today },
  );

  let row = rows[0];

  if (!row) {
    await ensureDailyTaskForDate(config, today);
    rows = await query(
      `
      SELECT ${selectFragments.join(', ')}
      FROM \`${config.table}\` t
      WHERE DATE(t.\`${dateColumn}\`) = :target
      ORDER BY t.\`${orderColumn || config.id}\` DESC
      LIMIT 1
      `,
      { target: today },
    );
    row = rows[0];
  }

  if (!row) {
    const fallbackRows = await query(
      `
      SELECT ${selectFragments.join(', ')}
      FROM \`${config.table}\` t
      ORDER BY t.\`${orderColumn || config.id}\` DESC
      LIMIT 1
      `,
    );

    row = fallbackRows[0];
  }

  return row ? mapDailyTaskRow(row) : getFallbackTaskForDate(today);
};

const loadUserDailyStats = async (userId, today) => {
  const todayString = formatDateOnly(today);

  if (!userId || !todayString) {
    return { streak: 0, completedToday: false, lastCompletedDate: null, totalCompletedDays: 0 };
  }

  const normalizedUserId = normalizeIdentifier(userId);

  if (!normalizedUserId) {
    return { streak: 0, completedToday: false, lastCompletedDate: null, totalCompletedDays: 0 };
  }

  const completionConfig = await getDailyTaskCompletionConfig();

  if (!completionConfig || !completionConfig.userId || !completionConfig.completedAt) {
    const fallbackDates = getFallbackCompletionDates(normalizedUserId);
    return computeStreakFromDates(fallbackDates, todayString);
  }

  const rows = await query(
    `
    SELECT DATE(c.\`${completionConfig.completedAt}\`) AS completed_date
    FROM \`${completionConfig.table}\` c
    WHERE c.\`${completionConfig.userId}\` = :userId
    ORDER BY c.\`${completionConfig.completedAt}\` ASC
    `,
    { userId: normalizedUserId },
  );

  const dates = rows.map((row) => row.completed_date).filter(Boolean);
  return computeStreakFromDates(dates, todayString);
};

const buildLeaderboard = async (scope = 'global', sessionUser = null) => {
  const fallbackRaw = getFallbackLeaderboard(scope, sessionUser) || [];
  const fallbackEntries = fallbackRaw.map((entry, index) => {
    const seed = entry || {};
    const progressValue = Number(seed.progress ?? 0);
    const hoursValue = Number(seed.hours ?? 0);
    const streakValue = Number.isFinite(Number(seed.streak))
      ? Number(seed.streak)
      : Math.max(1, Math.round((Number.isFinite(progressValue) ? progressValue : 0) / 12));
    const activeDaysValue = Number.isFinite(Number(seed.activeDays))
      ? Number(seed.activeDays)
      : Math.max(5, Math.round((Number.isFinite(hoursValue) ? hoursValue : 0) / 1.5));

    return {
      id: seed.id != null ? String(seed.id) : `fallback-${scope}-${index}`,
      name: seed.name || '学习同学',
      university: seed.university || '未填写院校',
      progress: Number.isFinite(progressValue) ? progressValue : 0,
      hours: Number.isFinite(hoursValue) ? hoursValue : 0,
      streak: streakValue,
      activeDays: activeDaysValue,
    };
  });

  const completionConfig = await getDailyTaskCompletionConfig();

  if (!completionConfig || !completionConfig.userId || !completionConfig.completedAt) {
    return fallbackEntries;
  }

  if (!(await tableExists('users'))) {
    return fallbackEntries;
  }

  const userColumns = await getTableColumns('users');

  if (userColumns.size === 0) {
    return fallbackEntries;
  }

  const userIdColumn = resolveColumn(userColumns, ['id', 'user_id']);

  if (!userIdColumn) {
    return fallbackEntries;
  }

  const displayColumn = resolveColumn(userColumns, ['display_name', 'name', 'full_name']);
  const usernameColumn = resolveColumn(userColumns, ['username', 'user_name']);
  const organizationColumn = resolveColumn(userColumns, ['organization', 'university', 'school']);
  const majorColumn = resolveColumn(userColumns, ['major_id', 'major', 'majorId']);

  const nameFragments = [];

  if (displayColumn) {
    nameFragments.push(`NULLIF(TRIM(u.\`${displayColumn}\`), '')`);
  }

  if (usernameColumn) {
    nameFragments.push(`NULLIF(TRIM(u.\`${usernameColumn}\`), '')`);
  }

  const nameExpression = nameFragments.length
    ? `COALESCE(${nameFragments.join(', ')}, '学习同学')`
    : `'学习同学'`;

  const organizationExpression = organizationColumn
    ? `COALESCE(NULLIF(TRIM(u.\`${organizationColumn}\`), ''), '未填写院校')`
    : `'未填写院校'`;

  const selectFragments = [
    `u.\`${userIdColumn}\` AS user_id`,
    `${nameExpression} AS display_name`,
    `${organizationExpression} AS organization`,
    `COUNT(DISTINCT DATE(c.\`${completionConfig.completedAt}\`)) AS active_days`,
    `MAX(c.\`${completionConfig.completedAt}\`) AS last_completed_at`,
  ];

  let joinTask = '';
  const minutesAlias = 'total_minutes';
  let minutesExpression = `SUM(45) AS ${minutesAlias}`;

  const taskConfig = await getDailyTaskConfig();

  if (taskConfig && taskConfig.id && completionConfig.taskId) {
    joinTask = `LEFT JOIN \`${taskConfig.table}\` t ON t.\`${taskConfig.id}\` = c.\`${completionConfig.taskId}\``;
    minutesExpression = taskConfig.estimatedMinutes
      ? `SUM(COALESCE(t.\`${taskConfig.estimatedMinutes}\`, 45)) AS ${minutesAlias}`
      : `SUM(45) AS ${minutesAlias}`;
  }

  selectFragments.push(minutesExpression);

  const whereClauses = [];
  const havingClauses = ['active_days > 0', `${minutesAlias} > 0`];
  const params = {};

  if (scope === 'campus' && majorColumn) {
    const majorId = sessionUser?.major_id || sessionUser?.majorId;

    if (majorId) {
      whereClauses.push(`u.\`${majorColumn}\` = :majorId`);
      params.majorId = normalizeIdentifier(majorId);
    } else {
      whereClauses.push('1 = 0');
    }
  }

  const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';
  const havingSql = havingClauses.length ? `HAVING ${havingClauses.join(' AND ')}` : '';

  const rows = await query(
    `
    SELECT ${selectFragments.join(', ')}
    FROM \`${completionConfig.table}\` c
    JOIN users u ON u.\`${userIdColumn}\` = c.\`${completionConfig.userId}\`
    ${joinTask}
    ${whereSql}
    GROUP BY u.\`${userIdColumn}\`
    ${havingSql}
    ORDER BY active_days DESC, last_completed_at DESC
    LIMIT 20
    `,
    params,
  );

  if (!rows.length) {
    return fallbackEntries;
  }

  const userIds = rows.map((row) => row.user_id).filter(Boolean);
  const { clause, params: inParams } = buildInClause(userIds, 'lb');
  let completionMap = new Map();

  if (clause) {
    const dateRows = await query(
      `
      SELECT c.\`${completionConfig.userId}\` AS user_id,
             DATE(c.\`${completionConfig.completedAt}\`) AS completed_date
      FROM \`${completionConfig.table}\` c
      WHERE c.\`${completionConfig.userId}\` IN (${clause})
      ORDER BY c.\`${completionConfig.userId}\`, c.\`${completionConfig.completedAt}\` ASC
      `,
      inParams,
    );

    completionMap = dateRows.reduce((accumulator, row) => {
      const userIdValue = row.user_id;
      const date = formatDateOnly(row.completed_date);

      if (!userIdValue || !date) {
        return accumulator;
      }

      if (!accumulator.has(userIdValue)) {
        accumulator.set(userIdValue, []);
      }

      accumulator.get(userIdValue).push(date);
      return accumulator;
    }, new Map());
  }

  const today = formatDateOnly(new Date());
  const bestActiveDays = Math.max(...rows.map((row) => Number(row.active_days) || 0), 1);

  const leaderboard = rows
    .map((row) => {
      const userIdValue = row.user_id;
      const dates = completionMap.get(userIdValue) || [];
      const streakInfo = computeStreakFromDates(dates, today);
      const activeDays = Number(row.active_days) || 0;
      const totalMinutes = Number(row.total_minutes) || 0;
      const progress = Math.max(5, Math.min(100, Math.round((activeDays / bestActiveDays) * 100)));
      const hours = Number((totalMinutes / 60).toFixed(1));

      return {
        id: String(userIdValue ?? ''),
        name: row.display_name || '学习同学',
        university: row.organization || '未填写院校',
        progress,
        hours,
        streak: streakInfo.streak,
        activeDays,
      };
    })
    .sort((a, b) => {
      if (b.progress !== a.progress) {
        return b.progress - a.progress;
      }

      if (b.streak !== a.streak) {
        return b.streak - a.streak;
      }

      return b.activeDays - a.activeDays;
    });

  return leaderboard.length ? leaderboard : fallbackEntries;
};

const parseDateTimeInput = (value, referenceDate = null) => {
  if (value === null || value === undefined) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const stringValue = String(value).trim();
  if (!stringValue) {
    return null;
  }

  const timeOnlyMatch = stringValue.match(/^([0-2]?\d):([0-5]\d)$/);
  if (timeOnlyMatch && referenceDate) {
    const base = new Date(referenceDate);
    if (!Number.isNaN(base.getTime())) {
      const hours = Number.parseInt(timeOnlyMatch[1], 10);
      const minutes = Number.parseInt(timeOnlyMatch[2], 10);
      base.setHours(hours, minutes, 0, 0);
      return base;
    }
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) {
    const date = new Date(`${stringValue}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(stringValue);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getCourseConfig = async () => {
  const columns = await getTableColumns('courses');

  if (columns.size === 0) {
    return null;
  }

  const columnDetails = await getTableColumnDetails('courses');

  return {
    table: 'courses',
    columns,
    columnDetails,
    id: resolveColumn(columns, ['id', 'course_id']),
    majorId: resolveColumn(columns, ['major_id', 'majorid', 'major']),
    title: resolveColumn(columns, ['title', 'name', 'course_name']),
    teacher: resolveColumn(columns, ['teacher', 'teacher_name', 'lecturer']),
    category: resolveColumn(columns, ['category', 'type', 'course_category']),
    progress: resolveColumn(columns, ['progress', 'completion', 'completion_rate']),
    nextTask: resolveColumn(columns, ['next_task', 'upcoming_task', 'next_step', 'schedule_info', 'release_window']),
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

const createCoursePayload = (
  config,
  { title, teacher, category, progress, nextTask, description, majorId },
) => {
  const payload = {};

  if (config.title) {
    payload[config.title] = normalizeValueForColumn(config.columnDetails, config.title, title);
  }

  if (config.majorId && majorId !== undefined && majorId !== null) {
    const normalizedMajorId = normalizeValueForColumn(config.columnDetails, config.majorId, majorId);
    if (normalizedMajorId !== null && normalizedMajorId !== undefined) {
      payload[config.majorId] = normalizedMajorId;
    }
  }

  if (config.teacher) {
    payload[config.teacher] = normalizeValueForColumn(
      config.columnDetails,
      config.teacher,
      teacher ?? '待定讲师',
    );
  }

  if (config.category) {
    payload[config.category] = normalizeValueForColumn(
      config.columnDetails,
      config.category,
      category ?? '公共课',
    );
  }

  if (config.progress) {
    payload[config.progress] = normalizeValueForColumn(
      config.columnDetails,
      config.progress,
      progress ?? 0,
    );
  }

  if (config.nextTask) {
    payload[config.nextTask] = normalizeValueForColumn(
      config.columnDetails,
      config.nextTask,
      nextTask ?? null,
    );
  }

  if (config.description) {
    payload[config.description] = normalizeValueForColumn(
      config.columnDetails,
      config.description,
      description ?? null,
    );
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

    const columnDetails = await getTableColumnDetails(table);

    return {
      table,
      columns,
      columnDetails,
      id: resolveColumn(columns, ['id', 'event_id', 'task_id']),
      title: resolveColumn(columns, ['title', 'name', 'task_name']),
      type: resolveColumn(columns, ['type', 'category', 'task_type', 'event_type']),
      start: resolveColumn(columns, ['start_time', 'start_at', 'begin_time']),
      end: resolveColumn(columns, ['end_time', 'end_at', 'finish_time']),
      allDay: resolveColumn(columns, ['all_day', 'is_all_day']),
      location: resolveColumn(columns, ['location', 'place']),
      userId: resolveColumn(columns, ['user_id', 'student_id', 'owner_id']),
      focus: resolveColumn(columns, ['focus', 'goal', 'notes']),
      tags: resolveColumn(columns, ['tags', 'tags_json', 'tag_list']),
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
  end:
    normalizeDate(row.end_time) ||
    normalizeDate(row.updated_at) ||
    normalizeDate(row.start_time) ||
    new Date().toISOString(),
  allDay: Boolean(row.all_day ?? row.is_all_day ?? 0),
  location: row.location || undefined,
  focus: row.focus || undefined,
  tags: parseTags(row.tags),
});

const ensureMySqlDateTime = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}(?::\d{2})?$/.test(trimmed)) {
      return trimmed.length === 16 ? `${trimmed}:00` : trimmed;
    }

    return toMySqlDateTime(trimmed);
  }

  return toMySqlDateTime(value);
};

const createSchedulePayload = (
  config,
  { title, type, start, end, allDay, userId, location, focus, tags },
) => {
  const payload = {};

  if (config.title) {
    payload[config.title] = normalizeValueForColumn(config.columnDetails, config.title, title);
  }

  if (config.type) {
    payload[config.type] = normalizeValueForColumn(
      config.columnDetails,
      config.type,
      type ?? '自习',
    );
  }

  if (config.start) {
    const normalizedStart = ensureMySqlDateTime(start);
    if (normalizedStart !== null) {
      payload[config.start] = normalizedStart;
    }
  }

  if (config.end) {
    const normalizedEnd = ensureMySqlDateTime(end);
    if (normalizedEnd !== null) {
      payload[config.end] = normalizedEnd;
    }
  }

  if (config.allDay) {
    payload[config.allDay] = normalizeValueForColumn(
      config.columnDetails,
      config.allDay,
      allDay ? 1 : 0,
    );
  }

  if (config.location) {
    payload[config.location] = normalizeValueForColumn(
      config.columnDetails,
      config.location,
      location ?? null,
    );
  }

  if (config.focus) {
    payload[config.focus] = normalizeValueForColumn(
      config.columnDetails,
      config.focus,
      focus ?? null,
    );
  }

  if (config.tags) {
    payload[config.tags] = normalizeValueForColumn(
      config.columnDetails,
      config.tags,
      stringifyTags(tags),
    );
  }

  if (config.userId) {
    const normalized = normalizeIdentifier(userId);
    payload[config.userId] = normalizeValueForColumn(
      config.columnDetails,
      config.userId,
      normalized,
    );
  }

  return payload;
};

const getPracticeSetConfig = async () => {
  const columns = await getTableColumns('practice_sets');

  if (columns.size === 0) {
    return null;
  }

  const columnDetails = await getTableColumnDetails('practice_sets');

  return {
    columns,
    columnDetails,
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

  const columnDetails = await getTableColumnDetails('practice_questions');

  return {
    columns,
    columnDetails,
    id: resolveColumn(columns, ['id', 'question_id']),
    setId: resolveColumn(columns, ['practice_set_id', 'set_id', 'collection_id']),
  };
};

const normalizeLimit = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.min(parsed, 100);
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
      LIMIT ${normalizeLimit(limit, 12)}`,
  );

  return rows.map((row, index) => formatCourseRow(row, index));
};

const loadSchedule = async (sessionUser, limit = 20) => {
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
    config.allDay ? `s.\`${config.allDay}\` AS all_day` : 'NULL AS all_day',
    config.location ? `s.\`${config.location}\` AS location` : 'NULL AS location',
    config.focus ? `s.\`${config.focus}\` AS focus` : 'NULL AS focus',
    config.tags ? `s.\`${config.tags}\` AS tags` : 'NULL AS tags',
    config.createdAt ? `s.\`${config.createdAt}\` AS created_at` : 'NULL AS created_at',
    config.updatedAt ? `s.\`${config.updatedAt}\` AS updated_at` : 'NULL AS updated_at',
  ];

  const whereClauses = [];
  const params = {};

  const isAdmin = sessionUser?.role === 'admin';
  const rawUserId = sessionUser?.id;

  if (config.userId && rawUserId && !isAdmin) {
    const normalizedUserId = normalizeValueForColumn(
      config.columnDetails,
      config.userId,
      normalizeIdentifier(rawUserId),
    );

    if (normalizedUserId !== null && normalizedUserId !== undefined) {
      whereClauses.push(`s.\`${config.userId}\` = :userId`);
      params.userId = normalizedUserId;
    }
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
  const orderColumn = config.start ? `s.\`${config.start}\`` : 's.id';

  const rows = await query(
    `SELECT ${selectFragments.join(', ')}
       FROM ${config.table} s
       ${whereSql}
      ORDER BY ${orderColumn} ASC
      LIMIT ${normalizeLimit(limit, 20)}`,
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
      LIMIT ${normalizeLimit(limit, 3)}`,
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
    const sessionUser = req.session?.user || null;
    const userName = sessionUser?.name || '同学';
    const [courses, practiceSets, schedule, stats] = await Promise.all([
      loadCourses(6),
      loadPracticePreview(3),
      loadSchedule(req.session?.user || null, 6),
      buildStats(),
    ]);

    const recommendation =
      practiceSets.length > 0
        ? `推荐从「${practiceSets[0].name}」开始复习，并在完成后同步更新课程进度。`
        : '暂未检测到题库或课程数据，建议先在课程体系与刷题训练中新增内容。';

    const followedInstitutions = listFollowedInstitutions(sessionUser?.id || '');
    const pushMessages = listPushMessages(sessionUser?.id || '');
    const examProfile = getExamProfile(sessionUser?.id || '');
    const subjectHighlights = buildSubjectRecommendations({
      math: examProfile?.mathSubject,
      english: examProfile?.englishSubject,
      targetMajor: examProfile?.targetMajor,
      totalScore: examProfile?.totalScore,
    });

    res.json({
      userName,
      stats,
      courses,
      practiceSets,
      schedule,
      recommendation,
      pushMessages,
      followedInstitutions,
      subjectHighlights,
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
  const { title, teacher, category, progress = 0, nextTask, description, majorId } = req.body || {};

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

    let resolvedMajorId = normalizeIdentifier(majorId);

    if (!resolvedMajorId && req.session?.user?.majorId) {
      resolvedMajorId = normalizeIdentifier(req.session.user.majorId);
    }

    if (!resolvedMajorId && config.majorId) {
      resolvedMajorId = await getDefaultMajorId();
    }

    if (config.majorId && !resolvedMajorId) {
      return res
        .status(400)
        .json({ message: '无法确定课程所属专业，请先在个人资料中设置目标专业或在创建时指定 majorId。' });
    }

    const payload = createCoursePayload(config, {
      title,
      teacher,
      category,
      progress: Math.min(100, Math.max(0, Number(progress))),
      nextTask,
      description,
      majorId: resolvedMajorId != null ? resolvedMajorId : undefined,
    });

    const result = await insertRecord('courses', payload);

    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error('创建课程失败', error);
    res.status(500).json({ message: '创建课程失败，请稍后重试' });
  }
});

router.get('/daily-task', requireAuth, async (req, res) => {
  try {
    const today = formatDateOnly(new Date());
    const task = await loadDailyTaskForDate(today);

    if (!task) {
      return res.status(404).json({ message: '今日任务尚未配置，请稍后再试。' });
    }

    const stats = await loadUserDailyStats(req.session?.user?.id || null, today);

    return res.json({
      task,
      streak: stats.streak,
      completedToday: stats.completedToday,
      lastCompletedDate: stats.lastCompletedDate,
      totalCompletedDays: stats.totalCompletedDays,
    });
  } catch (error) {
    console.error('获取今日打卡任务失败', error);
    return res.status(500).json({ message: '获取今日任务失败，请稍后再试。' });
  }
});

router.post('/daily-task/complete', requireAuth, async (req, res) => {
  const { taskId } = req.body || {};
  const normalizedTaskId = taskId != null ? String(taskId).trim() : '';

  if (!normalizedTaskId) {
    return res.status(400).json({ message: '缺少任务编号，请刷新后重试。' });
  }

  try {
    const normalizedUserId = normalizeIdentifier(req.session?.user?.id);

    if (!normalizedUserId) {
      return res.status(401).json({ message: '登录状态已失效，请重新登录后再试。' });
    }

    const completionConfig = await getDailyTaskCompletionConfig();
    const taskConfig = await getDailyTaskConfig();
    const today = formatDateOnly(new Date());
    const todayTask = await loadDailyTaskForDate(today);

    if (!todayTask || String(todayTask.id) !== normalizedTaskId) {
      return res.status(400).json({ message: '任务已更新，请刷新后重新打卡。' });
    }

    const normalizedTaskKeyForDb =
      taskConfig && taskConfig.id
        ? normalizeValueForColumn(taskConfig.columnDetails, taskConfig.id, normalizedTaskId)
        : normalizedTaskId;

    if (normalizedTaskKeyForDb === null || normalizedTaskKeyForDb === undefined) {
      return res.status(409).json({ message: '任务已更新，请刷新后重试。' });
    }

    if (taskConfig && taskConfig.id) {
      const taskRows = await query(
        `SELECT 1 AS found FROM \`${taskConfig.table}\` WHERE \`${taskConfig.id}\` = :taskId LIMIT 1`,
        { taskId: normalizedTaskKeyForDb },
      );

      if (!taskRows[0]?.found) {
        return res.status(409).json({ message: '任务已更新，请刷新后重试。' });
      }
    }

    if (
      !completionConfig ||
      !completionConfig.taskId ||
      !completionConfig.userId ||
      !completionConfig.completedAt ||
      !taskConfig ||
      !taskConfig.id
    ) {
      recordFallbackCompletion(normalizedUserId, today);
      const stats = computeStreakFromDates(getFallbackCompletionDates(normalizedUserId), today);
      return res.json({
        streak: stats.streak,
        completedToday: true,
        lastCompletedDate: stats.lastCompletedDate,
        totalCompletedDays: stats.totalCompletedDays,
      });
    }

    const completionTaskId = normalizeValueForColumn(
      completionConfig.columnDetails,
      completionConfig.taskId,
      normalizedTaskKeyForDb,
    );

    const completionUserId = normalizeValueForColumn(
      completionConfig.columnDetails,
      completionConfig.userId,
      normalizedUserId,
    );

    if (completionTaskId === null || completionTaskId === undefined) {
      return res.status(409).json({ message: '任务已更新，请刷新后重试。' });
    }

    if (completionUserId === null || completionUserId === undefined) {
      return res.status(401).json({ message: '登录状态已失效，请重新登录后再试。' });
    }

    await query(
      `INSERT INTO \`${completionConfig.table}\` (\`${completionConfig.taskId}\`, \`${completionConfig.userId}\`, \`${completionConfig.completedAt}\`)
         VALUES (:taskId, :userId, NOW())
        ON DUPLICATE KEY UPDATE \`${completionConfig.completedAt}\` = NOW()`,
      { taskId: completionTaskId, userId: completionUserId },
    );

    const stats = await loadUserDailyStats(normalizedUserId, today);
    recordFallbackCompletion(normalizedUserId, today);

    return res.json({
      streak: stats.streak,
      completedToday: stats.completedToday,
      lastCompletedDate: stats.lastCompletedDate,
      totalCompletedDays: stats.totalCompletedDays,
    });
  } catch (error) {
    console.error('记录每日打卡失败', error);
    return res.status(500).json({ message: '记录每日打卡失败，请稍后再试。' });
  }
});

router.get('/leaderboard', requireAuth, async (req, res) => {
  const scope = req.query?.scope === 'campus' ? 'campus' : 'global';

  try {
    const leaderboard = await buildLeaderboard(scope, req.session?.user || null);
    res.json({ leaderboard });
  } catch (error) {
    console.error('获取学习排行榜失败', error);
    res.status(500).json({ message: '无法加载排行榜，请稍后再试。' });
  }
});

router.get('/schedule', requireAuth, async (req, res) => {
  try {
    const schedule = await loadSchedule(req.session?.user || null);
    res.json({ schedule });
  } catch (error) {
    console.error('获取学习日程失败', error);
    res.status(500).json({ message: '无法加载学习日程，请稍后重试' });
  }
});

router.post('/schedule', requireAuth, async (req, res) => {
  const { title, type = '自习', start, end, allDay = false, location, focus, tags } = req.body || {};

  if (!title || !start || !end) {
    return res.status(400).json({ message: '请填写日程标题、开始时间与结束时间' });
  }

  const parsedStart = parseDateTimeInput(start);
  if (!parsedStart) {
    return res.status(400).json({ message: '开始时间格式不正确，请重新选择。' });
  }

  let parsedEnd = parseDateTimeInput(end, parsedStart);
  if (!parsedEnd) {
    return res.status(400).json({ message: '结束时间格式不正确，请重新选择。' });
  }

  if (parsedEnd.getTime() <= parsedStart.getTime()) {
    parsedEnd = new Date(parsedStart.getTime() + 30 * 60 * 1000);
  }

  const normalizedStart = ensureMySqlDateTime(parsedStart);
  const normalizedEnd = ensureMySqlDateTime(parsedEnd);

  if (!normalizedStart || !normalizedEnd) {
    return res.status(400).json({ message: '无法解析日程时间，请检查填写的开始与结束时间。' });
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
      start: normalizedStart,
      end: normalizedEnd,
      allDay,
      userId: req.session?.user?.id ? req.session.user.id : null,
      location,
      focus,
      tags,
    });

    if (!payload[config.start] || !payload[config.end]) {
      return res.status(400).json({ message: '日程时间不完整，请重新填写开始与结束时间。' });
    }

    const result = await insertRecord(config.table, payload);

    res.status(201).json({ id: result.insertId ?? result.generatedId ?? null });
  } catch (error) {
    console.error('创建日程失败', error);
    res.status(500).json({ message: '创建日程失败，请稍后重试' });
  }
});

router.post('/recommendations/universities', requireAuth, (req, res) => {
  const { totalScore, targetMajor, examSubjects } = req.body || {};
  const sessionUser = req.session?.user || null;
  const storedProfile = getExamProfile(sessionUser?.id || '');

  const parseScore = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  };

  const resolvedScore = parseScore(totalScore) ?? parseScore(storedProfile?.totalScore);
  if (resolvedScore == null) {
    return res.status(400).json({ message: '请填写有效的初试总分（需为正数）。' });
  }

  const resolvedMajor =
    typeof targetMajor === 'string' && targetMajor.trim()
      ? targetMajor.trim()
      : storedProfile?.targetMajor || undefined;

  const mathPreferenceRaw =
    examSubjects && typeof examSubjects.math === 'string' && examSubjects.math.trim()
      ? examSubjects.math.trim()
      : storedProfile?.mathSubject || undefined;
  const englishPreferenceRaw =
    examSubjects && typeof examSubjects.english === 'string' && examSubjects.english.trim()
      ? examSubjects.english.trim()
      : storedProfile?.englishSubject || undefined;

  try {
    const payload = buildRecommendationResponse({
      totalScore: Math.min(500, resolvedScore),
      major: resolvedMajor,
      examPreferences: {
        math: mathPreferenceRaw,
        english: englishPreferenceRaw,
      },
    });

    res.json(payload);
  } catch (error) {
    console.error('生成院校推荐失败', error);
    res.status(500).json({ message: '暂时无法生成院校推荐，请稍后重试。' });
  }
});

module.exports = router;
