const { getApiConfig } = require('../config.js');

const joinUrl = (baseUrl, path) => {
  const trimmedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const trimmedPath = path.startsWith('/') ? path.slice(1) : path;
  return `${trimmedBase}/${trimmedPath}`;
};

const apiRequest = ({ path, method = 'GET', data, header, timeout }) => {
  const { baseUrl, timeout: defaultTimeout } = getApiConfig();
  const url = joinUrl(baseUrl, path);

  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...(header || {}),
      },
      timeout: typeof timeout === 'number' ? timeout : defaultTimeout,
      withCredentials: true,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
          return;
        }
        const error = new Error(
          (res.data && res.data.message) || '请求失败，请稍后重试。'
        );
        error.statusCode = res.statusCode;
        error.data = res.data;
        reject(error);
      },
      fail: (networkError) => {
        const error = new Error(networkError.errMsg || '网络请求失败');
        reject(error);
      },
    });
  });
};

module.exports = {
  apiRequest,
};
