import { apiRequest, type ApiError } from './api';
import { loadFromStorage, resetStorageKey, saveToStorage } from './storage';

export interface SessionUser {
  id: string;
  name: string;
  role: string;
  email: string | null;
  phone: string | null;
  organization: string | null;
  goal: string | null;
  majorId: string | null;
  majorName: string | null;
  avatar: string | null;
  bio: string | null;
}

interface SessionResponse {
  user: SessionUser;
}

const SESSION_STORAGE_KEY = 'sessionUser';

export const getStoredSession = (): SessionUser | null =>
  loadFromStorage<SessionUser | null>(SESSION_STORAGE_KEY, null);

export const saveSession = (user: SessionUser | null) => {
  if (user) {
    saveToStorage(SESSION_STORAGE_KEY, user);
  } else {
    resetStorageKey(SESSION_STORAGE_KEY);
  }
};

export const fetchSession = async (): Promise<SessionUser> => {
  const response = await apiRequest<SessionResponse>({ path: '/auth/session' });
  saveSession(response.user);
  return response.user;
};

export const ensureSession = async (): Promise<SessionUser> => {
  try {
    return await fetchSession();
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError?.statusCode === 401) {
      saveSession(null);
    }
    throw error;
  }
};

export const login = async (username: string, password: string): Promise<SessionUser> => {
  const response = await apiRequest<SessionResponse, { username: string; password: string }>({
    path: '/auth/login',
    method: 'POST',
    data: { username, password },
  });
  saveSession(response.user);
  return response.user;
};

export const logout = async (): Promise<void> => {
  try {
    await apiRequest({ path: '/auth/logout', method: 'POST' });
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError?.statusCode && apiError.statusCode >= 500) {
      console.warn('注销失败', apiError.message);
    }
  }
  saveSession(null);
};
