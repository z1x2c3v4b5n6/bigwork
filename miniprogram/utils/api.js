const { getApiConfig } = require('../config.js');
const {
  clearStoredCookies,
  getStoredCookieHeader,
  storeResponseCookies,
} = require('./authCookies.js');

const joinUrl = (baseUrl, path) => {
  const trimmedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const trimmedPath = path.startsWith('/') ? path.slice(1) : path;
  return `${trimmedBase}/${trimmedPath}`;
};

const apiRequest = ({ path, method = 'GET', data, header, timeout }) => {
  const { baseUrl, timeout: defaultTimeout } = getApiConfig();
  const url = joinUrl(baseUrl, path);

  return new Promise((resolve, reject) => {
    const storedCookie = getStoredCookieHeader();
    const requestHeader = {
      'Content-Type': 'application/json',
      ...(header || {}),
    };

    if (storedCookie && !requestHeader.Cookie && !requestHeader.cookie) {
      requestHeader.Cookie = storedCookie;
    }

    wx.request({
      url,
      method,
      data,
      header: requestHeader,
      timeout: typeof timeout === 'number' ? timeout : defaultTimeout,
      withCredentials: true,
      success: (res) => {
        storeResponseCookies(res);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
          return;
        }
        const error = new Error(
          (res.data && res.data.message) || '请求失败，请稍后重试。'
        );
        error.statusCode = res.statusCode;
        error.data = res.data;
        if (res.statusCode === 401) {
          clearStoredCookies();
        }
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
