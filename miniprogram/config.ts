export interface ApiConfig {
  baseUrl: string;
  timeout: number;
}

const defaultConfig: ApiConfig = {
  baseUrl: 'http://localhost:3000/api',
  timeout: 8000,
};

export const getApiConfig = (): ApiConfig => {
  try {
    const envConfig = wx.getStorageSync('apiConfig');
    if (envConfig && typeof envConfig === 'object' && typeof envConfig.baseUrl === 'string') {
      return {
        baseUrl: envConfig.baseUrl,
        timeout: typeof envConfig.timeout === 'number' ? envConfig.timeout : defaultConfig.timeout,
      };
    }
  } catch (error) {
    console.warn('[config] 无法从存储读取 apiConfig', error);
  }

  return defaultConfig;
};

export const setApiConfig = (config: Partial<ApiConfig>) => {
  const resolved: ApiConfig = {
    baseUrl: config.baseUrl && config.baseUrl.trim() ? config.baseUrl.trim() : defaultConfig.baseUrl,
    timeout: typeof config.timeout === 'number' && config.timeout > 0 ? config.timeout : defaultConfig.timeout,
  };

  wx.setStorageSync('apiConfig', resolved);
  return resolved;
};
