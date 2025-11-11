const { apiRequest } = require('./api.js');
const { loadFromStorage, resetStorageKey, saveToStorage } = require('./storage.js');

const SESSION_STORAGE_KEY = 'sessionUser';

const getStoredSession = () => loadFromStorage(SESSION_STORAGE_KEY, null);

const saveSession = (user) => {
  if (user) {
    saveToStorage(SESSION_STORAGE_KEY, user);
  } else {
    resetStorageKey(SESSION_STORAGE_KEY);
  }
};

const fetchSession = async () => {
  const response = await apiRequest({ path: '/auth/session' });
  if (response && response.user) {
    saveSession(response.user);
    return response.user;
  }
  throw new Error('无法获取登录状态');
};

const ensureSession = async () => {
  try {
    return await fetchSession();
  } catch (error) {
    if (error && error.statusCode === 401) {
      saveSession(null);
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
  if (response && response.user) {
    saveSession(response.user);
    return response.user;
  }
  throw new Error('登录失败，请稍后重试。');
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
