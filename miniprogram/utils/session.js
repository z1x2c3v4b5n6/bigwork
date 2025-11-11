const { apiRequest } = require('./api.js');
const { loadFromStorage, resetStorageKey, saveToStorage } = require('./storage.js');

const SESSION_STORAGE_KEY = 'sessionUser';

const normalizeSessionUser = (value) => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value;
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

const getStoredSession = () => {
  const stored = loadFromStorage(SESSION_STORAGE_KEY, null);
  const normalized = normalizeSessionUser(stored);

  if (!normalized && stored) {
    resetStorageKey(SESSION_STORAGE_KEY);
  }

  return normalized;
};

const saveSession = (user) => {
  if (user) {
    saveToStorage(SESSION_STORAGE_KEY, user);
  } else {
    resetStorageKey(SESSION_STORAGE_KEY);
  }
};

const extractSessionUser = (payload) => {
  if (payload && typeof payload === 'object' && 'user' in payload) {
    return normalizeSessionUser(payload.user);
  }

  return normalizeSessionUser(payload);
};

const createUnauthorizedError = (message) => {
  const error = new Error(message);
  error.statusCode = 401;
  return error;
};

const fetchSession = async () => {
  const response = await apiRequest({ path: '/auth/session' });
  const sessionUser = extractSessionUser(response);

  if (!sessionUser) {
    throw createUnauthorizedError('登录状态无效，请重新登录。');
  }

  saveSession(sessionUser);
  return sessionUser;
};

const ensureSession = async () => {
  const stored = getStoredSession();

  if (stored) {
    return stored;
  }

  try {
    return await fetchSession();
  } catch (error) {
    if (error && (error.statusCode === 401 || error.statusCode === 404)) {
      saveSession(null);
      throw createUnauthorizedError('请先登录后再进行操作。');
    }

    throw error;
  }
};

const login = async (username, password) => {
  const response = await apiRequest({
    path: '/auth/login',
    method: 'POST',
    data: { username, password },
  });
  const sessionUser = extractSessionUser(response);

  if (!sessionUser) {
    throw new Error('登录响应格式不正确，请稍后重试。');
  }

  saveSession(sessionUser);
  return sessionUser;
};

const logout = async () => {
  try {
    await apiRequest({ path: '/auth/logout', method: 'POST' });
  } catch (error) {
    if (error && error.statusCode && error.statusCode >= 500) {
      console.warn('注销失败', error.message);
    }
  }
  saveSession(null);
};

module.exports = {
  getStoredSession,
  saveSession,
  fetchSession,
  ensureSession,
  login,
  logout,
};
