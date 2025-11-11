const loadFromStorage = (key, fallback) => {
  try {
    const raw = wx.getStorageSync(key);
    if (raw === '' || raw === null || typeof raw === 'undefined') {
      return fallback;
    }
    return raw;
  } catch (error) {
    console.warn(`[storage] 读取 ${key} 失败`, error);
    return fallback;
  }
};

const saveToStorage = (key, value) => {
  try {
    wx.setStorageSync(key, value);
  } catch (error) {
    console.warn(`[storage] 写入 ${key} 失败`, error);
  }
};

const resetStorageKey = (key) => {
  try {
    wx.removeStorageSync(key);
  } catch (error) {
    console.warn(`[storage] 清除 ${key} 失败`, error);
  }
};

module.exports = {
  loadFromStorage,
  saveToStorage,
  resetStorageKey,
};
