import { wrongQuestionSeed, type WrongQuestionSeed } from '../data/wrongBook';
import { apiRequest, type ApiError } from './api';
import { loadFromStorage, saveToStorage } from './storage';

export interface WrongQuestionItem {
  id: string;
  question: string;
  answer: string;
  analysis: string;
  updatedAt: string;
  synced: boolean;
}

interface WrongBookStorageState {
  items: WrongQuestionItem[];
  lastSyncedAt: string | null;
}

const WRONG_BOOK_STORAGE_KEY = 'practiceWrongBook';

const mapSeedToItem = (item: WrongQuestionSeed): WrongQuestionItem => ({
  ...item,
  synced: true,
});

const loadStorageState = (): WrongBookStorageState =>
  loadFromStorage<WrongBookStorageState>(WRONG_BOOK_STORAGE_KEY, {
    items: wrongQuestionSeed.map((seed) => mapSeedToItem(seed)),
    lastSyncedAt: null,
  });

const saveStorageState = (state: WrongBookStorageState) => saveToStorage(WRONG_BOOK_STORAGE_KEY, state);

const normalizeItem = (item: WrongQuestionItem): WrongQuestionItem => ({
  ...item,
  synced: item.synced !== false,
});

export const getWrongBookItems = (): WrongQuestionItem[] =>
  loadStorageState().items.map((item) => normalizeItem(item));

export const upsertWrongQuestion = (entry: WrongQuestionItem) => {
  const state = loadStorageState();
  const items = state.items.filter((item) => item.id !== entry.id);
  items.unshift({ ...entry, synced: false });
  saveStorageState({ ...state, items });
};

export const markItemsAsSynced = (ids: string[]) => {
  const state = loadStorageState();
  const idSet = new Set(ids);
  const nextItems = state.items.map((item) =>
    idSet.has(item.id) ? { ...item, synced: true } : item,
  );
  saveStorageState({ ...state, items: nextItems, lastSyncedAt: new Date().toISOString() });
};

export const removeWrongQuestion = (id: string) => {
  const state = loadStorageState();
  const nextItems = state.items.filter((item) => item.id !== id);
  saveStorageState({ ...state, items: nextItems });
};

export interface WrongBookSyncResult {
  items: WrongQuestionItem[];
  pendingSync: WrongQuestionItem[];
}

export const syncWrongBook = async (): Promise<WrongBookSyncResult> => {
  const state = loadStorageState();
  const pending = state.items.filter((item) => !item.synced);

  try {
    if (pending.length > 0) {
      const uploadResult = await apiRequest<{
        success?: boolean;
        synced?: number;
        message?: string;
      }>({
        path: '/practice/wrong-questions/bulk',
        method: 'POST',
        data: { questions: pending.map(({ synced, ...rest }) => rest) },
      });

      if (uploadResult?.success === false && uploadResult.message) {
        const uploadError: ApiError = new Error(uploadResult.message);
        uploadError.statusCode = 0;
        throw uploadError;
      }

      markItemsAsSynced(pending.map((item) => item.id));
    }

    const response = await apiRequest<{ questions: WrongQuestionSeed[] }>({
      path: '/practice/wrong-questions',
    });
    const mergedIds = new Set<string>();
    const remoteItems = (response?.questions ?? []).map((question) => {
      mergedIds.add(question.id);
      return mapSeedToItem(question);
    });

    const localOnly = loadStorageState().items.filter((item) => !mergedIds.has(item.id));
    const nextItems = [...remoteItems, ...localOnly];
    saveStorageState({ items: nextItems, lastSyncedAt: new Date().toISOString() });

    return { items: nextItems, pendingSync: [] };
  } catch (error) {
    const apiError = error as ApiError;
    console.warn('[wrong-book] 同步失败，保留本地数据。', apiError?.message ?? error);
    return { items: state.items, pendingSync: pending };
  }
};
