const { dailyTaskSeed } = require('../data/checkin.js');
const { apiRequest } = require('./api.js');
const { loadFromStorage, saveToStorage } = require('./storage.js');

const CHECKIN_STATE_KEY = 'studyCheckinState';
const CHECKIN_TASK_KEY = 'studyCheckinTask';

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getToday = () => formatDate(new Date());

const getYesterday = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return formatDate(yesterday);
};

const normalizeTask = (task) => ({
  id: task.id,
  title: task.title,
  description: task.description,
  targetText: task.targetText,
  estimatedMinutes: task.estimatedMinutes,
});

const getStoredState = () =>
  loadFromStorage(CHECKIN_STATE_KEY, {
    lastCompletedDate: null,
    lastEvaluatedDate: null,
    streak: 0,
  });

const setStoredState = (state) => {
  saveToStorage(CHECKIN_STATE_KEY, state);
};

const ensureEvaluatedState = (state, today) => {
  if (state.lastEvaluatedDate === today) {
    return state;
  }

  const yesterday = getYesterday();
  const shouldKeepStreak = state.lastCompletedDate === yesterday;
  const nextState = {
    lastCompletedDate: state.lastCompletedDate,
    lastEvaluatedDate: today,
    streak: shouldKeepStreak ? state.streak : state.lastCompletedDate === today ? state.streak : 0,
  };

  if (!shouldKeepStreak && state.lastCompletedDate !== today) {
    nextState.streak = 0;
  }

  setStoredState(nextState);
  return nextState;
};

const loadCachedTask = (today) => {
  const cached = loadFromStorage(CHECKIN_TASK_KEY, null);
  if (!cached || cached.date !== today) {
    return null;
  }
  return cached.task;
};

const saveCachedTask = (task, today) => {
  const cache = { date: today, task };
  saveToStorage(CHECKIN_TASK_KEY, cache);
};

const syncStateFromServer = (today, payload, fallbackState) => {
  if (!payload) {
    return fallbackState;
  }

  const nextState = {
    lastCompletedDate: fallbackState.lastCompletedDate,
    lastEvaluatedDate: today,
    streak: fallbackState.streak,
  };

  const streakFromServer =
    typeof payload.streak === 'number' && Number.isFinite(payload.streak)
      ? Math.max(0, Math.floor(payload.streak))
      : null;

  const completedToday = Boolean(payload.completedToday);
  const serverLastDate =
    typeof payload.lastCompletedDate === 'string' && payload.lastCompletedDate.length === 10
      ? payload.lastCompletedDate
      : null;

  if (streakFromServer !== null) {
    nextState.streak = streakFromServer;
  }

  if (completedToday) {
    nextState.lastCompletedDate = today;
  } else if (serverLastDate) {
    nextState.lastCompletedDate = serverLastDate;
  }

  setStoredState(nextState);
  return nextState;
};

const fetchTaskFromApi = async (today) => {
  const stateBeforeSync = ensureEvaluatedState(getStoredState(), today);

  try {
    const response = await apiRequest({ path: '/learning/daily-task' });
    const task = response && response.task ? normalizeTask(response.task) : normalizeTask(dailyTaskSeed);
    const syncedState = syncStateFromServer(today, response || null, stateBeforeSync);
    return { task, state: syncedState };
  } catch (error) {
    console.warn('[checkin] 获取今日任务失败，将使用本地兜底数据。', error?.message || error);
    const fallbackTask = normalizeTask(dailyTaskSeed);
    return { task: fallbackTask, state: stateBeforeSync };
  }
};

const initializeDailyTask = async () => {
  const today = getToday();
  let state = ensureEvaluatedState(getStoredState(), today);
  let task = loadCachedTask(today);

  if (!task) {
    const remote = await fetchTaskFromApi(today);
    task = remote.task;
    state = remote.state;
    saveCachedTask(task, today);
  }

  return {
    task,
    streak: state.streak,
    completedToday: state.lastCompletedDate === today,
  };
};

const markTaskCompletedToday = (task, overrideStreak) => {
  const today = getToday();
  const yesterday = getYesterday();
  const state = getStoredState();

  if (state.lastCompletedDate === today && overrideStreak === undefined) {
    return state;
  }

  let streak = state.streak;

  if (typeof overrideStreak === 'number' && Number.isFinite(overrideStreak)) {
    streak = Math.max(0, Math.floor(overrideStreak));
  } else if (state.lastCompletedDate === yesterday) {
    streak += 1;
  } else {
    streak = 1;
  }

  const nextState = {
    lastCompletedDate: today,
    lastEvaluatedDate: today,
    streak,
  };
  setStoredState(nextState);
  saveCachedTask(task, today);
  return nextState;
};

const reloadDailyTask = async () => {
  const today = getToday();
  const remote = await fetchTaskFromApi(today);
  const task = remote.task;
  const state = remote.state;
  saveCachedTask(task, today);
  return {
    task,
    streak: state.streak,
    completedToday: state.lastCompletedDate === today,
  };
};

module.exports = {
  initializeDailyTask,
  markTaskCompletedToday,
  reloadDailyTask,
};
