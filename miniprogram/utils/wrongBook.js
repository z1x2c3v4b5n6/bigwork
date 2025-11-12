const { wrongQuestionSeed } = require('../data/wrongBook.js');
const { apiRequest } = require('./api.js');
const { loadFromStorage, saveToStorage } = require('./storage.js');

const WRONG_BOOK_STORAGE_KEY = 'practiceWrongBook';

const mapSeedToItem = (item) => Object.assign({}, item, { synced: true });

const loadStorageState = () =>
  loadFromStorage(WRONG_BOOK_STORAGE_KEY, {
    items: wrongQuestionSeed.map((seed) => mapSeedToItem(seed)),
    lastSyncedAt: null,
  });

const saveStorageState = (state) => {
  saveToStorage(WRONG_BOOK_STORAGE_KEY, state);
};

const normalizeItem = (item) => Object.assign({}, item, { synced: item.synced !== false });

const getWrongBookItems = () => loadStorageState().items.map((item) => normalizeItem(item));

const upsertWrongQuestion = (entry) => {
  const state = loadStorageState();
  const items = state.items.filter((item) => item.id !== entry.id);
  items.unshift(Object.assign({}, entry, { synced: false }));
  saveStorageState(Object.assign({}, state, { items }));
};

const markItemsAsSynced = (ids) => {
  const state = loadStorageState();
  const idSet = new Set(ids);
  const nextItems = state.items.map((item) =>
    idSet.has(item.id) ? Object.assign({}, item, { synced: true }) : item,
  );
  saveStorageState({ items: nextItems, lastSyncedAt: new Date().toISOString() });
};

const removeWrongQuestion = (id) => {
  const state = loadStorageState();
  const nextItems = state.items.filter((item) => item.id !== id);
  saveStorageState(Object.assign({}, state, { items: nextItems }));
};

const syncWrongBook = async () => {
  const state = loadStorageState();
  const pending = state.items.filter((item) => !item.synced);

  try {
    if (pending.length > 0) {
      await apiRequest({
        path: '/practice/wrong-questions/bulk',
        method: 'POST',
        data: { questions: pending.map(({ synced, ...rest }) => rest) },
      });
      markItemsAsSynced(pending.map((item) => item.id));
    }

    const response = await apiRequest({ path: '/practice/wrong-questions' });
    const mergedIds = new Set();
    const remoteItems = (response?.questions || []).map((question) => {
      mergedIds.add(question.id);
      return mapSeedToItem(question);
    });

    const localOnly = loadStorageState().items.filter((item) => !mergedIds.has(item.id));
    const nextItems = [...remoteItems, ...localOnly];
    saveStorageState({ items: nextItems, lastSyncedAt: new Date().toISOString() });

    return { items: nextItems, pendingSync: [] };
  } catch (error) {
    console.warn('[wrong-book] 同步失败，保留本地数据。', error?.message || error);
    return { items: state.items, pendingSync: pending };
  }
};

module.exports = {
  getWrongBookItems,
  upsertWrongQuestion,
  markItemsAsSynced,
  removeWrongQuestion,
  syncWrongBook,
};
