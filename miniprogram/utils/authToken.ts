import { loadFromStorage, resetStorageKey, saveToStorage } from './storage';

const TOKEN_STORAGE_KEY = 'authToken';

export const getStoredToken = (): string | null => {
  const stored = loadFromStorage<string | null>(TOKEN_STORAGE_KEY, null);
  if (typeof stored === 'string' && stored.trim()) {
    return stored;
  }
  return null;
};

export const saveToken = (token: string): void => {
  if (typeof token === 'string' && token.trim()) {
    saveToStorage(TOKEN_STORAGE_KEY, token.trim());
    return;
  }
  resetStorageKey(TOKEN_STORAGE_KEY);
};

export const clearStoredToken = (): void => {
  resetStorageKey(TOKEN_STORAGE_KEY);
};
