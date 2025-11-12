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

interface DailyTaskApiResponse {
  task?: DailyTask | DailyTaskSeed | null;
  streak?: number;
  completedToday?: boolean;
  lastCompletedDate?: string | null;
  totalCompletedDays?: number;
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

const syncStateFromServer = (
  today: string,
  payload: DailyTaskApiResponse | null,
  fallbackState: CheckinStorageState,
): CheckinStorageState => {
  if (!payload) {
    return fallbackState;
  }

  const nextState: CheckinStorageState = {
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

const fetchTaskFromApi = async (today: string): Promise<{ task: DailyTask; state: CheckinStorageState }> => {
  const stateBeforeSync = ensureEvaluatedState(getStoredState(), today);

  try {
    const response = await apiRequest<DailyTaskApiResponse>({
      path: '/learning/daily-task',
    });
    const task = response?.task ? normalizeTask(response.task) : normalizeTask(dailyTaskSeed);
    const syncedState = syncStateFromServer(today, response ?? null, stateBeforeSync);
    return { task, state: syncedState };
  } catch (error) {
    const apiError = error as ApiError;
    console.warn('[checkin] 获取今日任务失败，将使用本地兜底数据。', apiError?.message ?? error);
    const fallbackTask = normalizeTask(dailyTaskSeed);
    return { task: fallbackTask, state: stateBeforeSync };
  }
};

export interface CheckinInitializationResult {
  task: DailyTask;
  streak: number;
  completedToday: boolean;
}

export const initializeDailyTask = async (): Promise<CheckinInitializationResult> => {
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

export const markTaskCompletedToday = (
  task: DailyTask,
  overrideStreak?: number,
): CheckinStorageState => {
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
  const remote = await fetchTaskFromApi(today);
  const state = remote.state;
  const task = remote.task;
  saveCachedTask(task, today);
  return {
    task,
    streak: state.streak,
    completedToday: state.lastCompletedDate === today,
  };
};
