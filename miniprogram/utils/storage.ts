export const loadFromStorage = <T>(key: string, fallback: T): T => {
  try {
    const raw = wx.getStorageSync(key);
    if (raw === '' || raw === null || raw === undefined) {
      return fallback;
    }
    return raw as T;
  } catch (error) {
    console.warn(`[storage] 读取 ${key} 失败`, error);
    return fallback;
  }
};

export const saveToStorage = <T>(key: string, value: T): void => {
  try {
    wx.setStorageSync(key, value);
  } catch (error) {
    console.warn(`[storage] 写入 ${key} 失败`, error);
  }
};

export const resetStorageKey = (key: string): void => {
  try {
    wx.removeStorageSync(key);
  } catch (error) {
    console.warn(`[storage] 清除 ${key} 失败`, error);
  }
};
