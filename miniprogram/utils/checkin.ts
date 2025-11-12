import { dailyTaskSeed, type DailyTaskSeed } from '../data/checkin';
import { apiRequest, type ApiError } from './api';
import { loadFromStorage, saveToStorage } from './storage';

export interface DailyTask {
  id: string;
  title: string;
  description: string;
  targetText: string;
  estimatedMinutes: number;
}

interface CheckinStorageState {
  lastCompletedDate: string | null;
  lastEvaluatedDate: string | null;
  streak: number;
}

interface CachedTaskState {
  date: string;
  task: DailyTask;
}

const CHECKIN_STATE_KEY = 'studyCheckinState';
const CHECKIN_TASK_KEY = 'studyCheckinTask';

const formatDate = (date: Date) => {
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

const normalizeTask = (task: DailyTask | DailyTaskSeed): DailyTask => ({
  id: task.id,
  title: task.title,
  description: task.description,
  targetText: task.targetText,
  estimatedMinutes: task.estimatedMinutes,
});

const getStoredState = (): CheckinStorageState =>
  loadFromStorage<CheckinStorageState>(CHECKIN_STATE_KEY, {
    lastCompletedDate: null,
    lastEvaluatedDate: null,
    streak: 0,
  });

const setStoredState = (state: CheckinStorageState) => saveToStorage(CHECKIN_STATE_KEY, state);

const ensureEvaluatedState = (state: CheckinStorageState, today: string): CheckinStorageState => {
  if (state.lastEvaluatedDate === today) {
    return state;
  }

  const yesterday = getYesterday();
  const shouldKeepStreak = state.lastCompletedDate === yesterday;
  const nextState: CheckinStorageState = {
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

const loadCachedTask = (today: string): DailyTask | null => {
  const cached = loadFromStorage<CachedTaskState | null>(CHECKIN_TASK_KEY, null);
  if (!cached || cached.date !== today) {
    return null;
  }
  return cached.task;
};

const saveCachedTask = (task: DailyTask, today: string) => {
  const cache: CachedTaskState = { date: today, task };
  saveToStorage(CHECKIN_TASK_KEY, cache);
};

const fetchTaskFromApi = async (): Promise<DailyTask> => {
  try {
    const response = await apiRequest<{ task: DailyTask | DailyTaskSeed }>({
      path: '/learning/daily-task',
    });
    if (response?.task) {
      return normalizeTask(response.task);
    }
  } catch (error) {
    const apiError = error as ApiError;
    console.warn('[checkin] 获取今日任务失败，将使用本地兜底数据。', apiError?.message ?? error);
  }
  return normalizeTask(dailyTaskSeed);
};

export interface CheckinInitializationResult {
  task: DailyTask;
  streak: number;
  completedToday: boolean;
}

export const initializeDailyTask = async (): Promise<CheckinInitializationResult> => {
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

export const markTaskCompletedToday = (task: DailyTask): CheckinStorageState => {
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

  const nextState: CheckinStorageState = {
    lastCompletedDate: today,
    lastEvaluatedDate: today,
    streak,
  };
  setStoredState(nextState);
  saveCachedTask(task, today);
  return nextState;
};

export const reloadDailyTask = async (): Promise<CheckinInitializationResult> => {
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
