import { apiRequest, type ApiError } from './api';
import { clearStoredToken, saveToken } from './authToken';
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
  user?: SessionUser;
}

const SESSION_STORAGE_KEY = 'sessionUser';

const normalizeSessionUser = (value: unknown): SessionUser | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Record<string, unknown>;
  const id = record.id != null ? String(record.id) : '';

  if (!id) {
    return null;
  }

  return {
    id,
    name:
      typeof record.name === 'string' && record.name.trim()
        ? record.name.trim()
        : '未命名用户',
    role: record.role === 'admin' ? 'admin' : 'student',
    email: typeof record.email === 'string' && record.email ? record.email : null,
    phone: typeof record.phone === 'string' && record.phone ? record.phone : null,
    organization:
      typeof record.organization === 'string' && record.organization
        ? record.organization
        : null,
    goal: typeof record.goal === 'string' && record.goal ? record.goal : null,
    majorId: record.majorId != null ? String(record.majorId) : null,
    majorName:
      typeof record.majorName === 'string' && record.majorName
        ? record.majorName
        : null,
    avatar: typeof record.avatar === 'string' && record.avatar ? record.avatar : null,
    bio: typeof record.bio === 'string' && record.bio ? record.bio : null,
  };
};

export const getStoredSession = (): SessionUser | null => {
  const stored = loadFromStorage<unknown>(SESSION_STORAGE_KEY, null);
  const normalized = normalizeSessionUser(stored);

  if (!normalized && stored) {
    resetStorageKey(SESSION_STORAGE_KEY);
  }

  return normalized;
};

export const saveSession = (user: SessionUser | null) => {
  if (user) {
    saveToStorage(SESSION_STORAGE_KEY, user);
  } else {
    resetStorageKey(SESSION_STORAGE_KEY);
    clearStoredToken();
  }
};

const extractSessionUser = (payload: unknown): SessionUser | null => {
  if (payload && typeof payload === 'object' && 'user' in (payload as Record<string, unknown>)) {
    return normalizeSessionUser((payload as { user?: unknown }).user);
  }

  return normalizeSessionUser(payload);
};

const createUnauthorizedError = (message: string): ApiError => {
  const error: ApiError = new Error(message);
  error.statusCode = 401;
  return error;
};

export const fetchSession = async (): Promise<SessionUser> => {
  const response = await apiRequest<SessionResponse | SessionUser>({ path: '/auth/session' });
  const sessionUser = extractSessionUser(response);

  if (!sessionUser) {
    clearStoredToken();
    throw createUnauthorizedError('登录状态无效，请重新登录。');
  }

  saveSession(sessionUser);
  return sessionUser;
};

export const ensureSession = async (): Promise<SessionUser> => {
  const stored = getStoredSession();

  if (stored) {
    return stored;
  }

  try {
    return await fetchSession();
  } catch (error) {
    const apiError = error as ApiError;

    if (apiError?.statusCode === 401 || apiError?.statusCode === 404) {
      saveSession(null);
      clearStoredToken();
      throw createUnauthorizedError('请先登录后再进行操作。');
    }

    throw error;
  }
};

interface LoginResponse extends SessionResponse {
  token?: string;
}

export const login = async (username: string, password: string): Promise<SessionUser> => {
  const response = await apiRequest<LoginResponse | SessionUser, { username: string; password: string }>({
    path: '/auth/login',
    method: 'POST',
    data: { username, password },
  });

  const payload = response as LoginResponse | SessionUser;
  const sessionUser = extractSessionUser(payload);

  if (!sessionUser) {
    throw new Error('登录响应格式不正确，请稍后重试。');
  }

  const token = (payload as LoginResponse)?.token;
  if (typeof token === 'string' && token.trim()) {
    saveToken(token);
  } else {
    clearStoredToken();
    throw new Error('登录响应缺少访问令牌，请稍后重试。');
  }

  saveSession(sessionUser);
  return sessionUser;
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
  clearStoredToken();
};
