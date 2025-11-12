"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setApiConfig = exports.getApiConfig = void 0;
var defaultConfig = {
    baseUrl: 'http://localhost:3000/api',
    timeout: 8000,
};
var isPartialApiConfig = function (value) {
    if (!value || typeof value !== 'object') {
        return false;
    }
    var record = value;
    if (typeof record.baseUrl !== 'string') {
        return false;
    }
    if ('timeout' in record && typeof record.timeout !== 'number') {
        return false;
    }
    return true;
};
var getApiConfig = function () {
    try {
        var envConfig = wx.getStorageSync('apiConfig');
        if (isPartialApiConfig(envConfig)) {
            return {
                baseUrl: envConfig.baseUrl,
                timeout: typeof envConfig.timeout === 'number' ? envConfig.timeout : defaultConfig.timeout,
            };
        }
    }
    catch (error) {
        console.warn('[config] 无法从存储读取 apiConfig', error);
    }
    return defaultConfig;
};
exports.getApiConfig = getApiConfig;
var setApiConfig = function (config) {
    var resolved = {
        baseUrl: config.baseUrl && config.baseUrl.trim() ? config.baseUrl.trim() : defaultConfig.baseUrl,
        timeout: typeof config.timeout === 'number' && config.timeout > 0 ? config.timeout : defaultConfig.timeout,
    };
    wx.setStorageSync('apiConfig', resolved);
    return resolved;
};
exports.setApiConfig = setApiConfig;
