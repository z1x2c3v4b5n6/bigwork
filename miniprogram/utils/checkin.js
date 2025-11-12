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

const fetchTaskFromApi = async () => {
  try {
    const response = await apiRequest({ path: '/learning/daily-task' });
    if (response && response.task) {
      return normalizeTask(response.task);
    }
  } catch (error) {
    console.warn('[checkin] 获取今日任务失败，将使用本地兜底数据。', error?.message || error);
  }
  return normalizeTask(dailyTaskSeed);
};

const initializeDailyTask = async () => {
  const today = getToday();
  const state = ensureEvaluatedState(getStoredState(), today);
  let task = loadCachedTask(today);

  if (!task) {
    task = await fetchTaskFromApi();
    saveCachedTask(task, today);
  }

  return {
    task,
    streak: state.streak,
    completedToday: state.lastCompletedDate === today,
  };
};

const markTaskCompletedToday = (task) => {
  const today = getToday();
  const yesterday = getYesterday();
  const state = getStoredState();
  let streak = state.streak;

  if (state.lastCompletedDate === today) {
    return state;
  }

  if (state.lastCompletedDate === yesterday) {
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
  const state = ensureEvaluatedState(getStoredState(), today);
  const task = await fetchTaskFromApi();
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
