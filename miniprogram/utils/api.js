"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRequest = void 0;
var config_1 = require("../config");
var authToken_1 = require("./authToken");
var joinUrl = function (baseUrl, path) {
    var trimmedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    var trimmedPath = path.startsWith('/') ? path.slice(1) : path;
    return "".concat(trimmedBase, "/").concat(trimmedPath);
};
var ALLOWED_DEV_HOSTS = new Set(['127.0.0.1', 'localhost']);
var domainWarningShown = false;
var parseUrlParts = function (value) {
    var _a, _b, _c;
    var match = /^([a-zA-Z][a-zA-Z0-9+.-]*):\/\/([^\/]*)/.exec(value);
    if (!match) {
        return null;
    }
    var protocol = (_a = match[1]) === null || _a === void 0 ? void 0 : _a.toLowerCase();
    var host = (_b = match[2]) !== null && _b !== void 0 ? _b : '';
    var hostname = (_c = host.split(':')[0]) === null || _c === void 0 ? void 0 : _c.toLowerCase();
    if (!protocol || !hostname) {
        return null;
    }
    return { protocol: protocol, hostname: hostname };
};
var isDevtoolsEnvironment = function () {
    try {
        var info = wx.getSystemInfoSync();
        return info.platform === 'devtools';
    }
    catch (error) {
        console.warn('[api] 无法获取系统信息判断运行环境', error);
        return false;
    }
};
var notifyIllegalDomain = function (message) {
    if (domainWarningShown) {
        return;
    }
    domainWarningShown = true;
    console.warn('[api] 域名校验未通过:', message);
    try {
        void wx.showModal({
            title: '请求域名未校验',
            content: "".concat(message, "\n\u8BF7\u6309\u7167\u6587\u6863\u914D\u7F6E\u5408\u6CD5\u57DF\u540D\u6216\u5728\u5F00\u53D1\u5DE5\u5177\u4E2D\u5B8C\u6210\u6821\u9A8C\uFF1Ahttps://developers.weixin.qq.com/miniprogram/dev/framework/ability/network.html"),
            showCancel: false,
            confirmText: '我知道了',
        });
    }
    catch (modalError) {
        console.warn('[api] 显示域名提醒失败', modalError);
    }
};
var validateRequestDomain = function (url) {
    var parts = parseUrlParts(url);
    if (!parts) {
        return { ok: true };
    }
    if (parts.protocol === 'https') {
        return { ok: true };
    }
    if (ALLOWED_DEV_HOSTS.has(parts.hostname) && isDevtoolsEnvironment()) {
        return { ok: true };
    }
    return {
        ok: false,
        message: '请求地址未在微信公众平台配置为合法域名，已切换为示例数据，请参照文档完成校验后再试。',
    };
};
var apiRequest = function (_a) {
    var path = _a.path, _b = _a.method, method = _b === void 0 ? 'GET' : _b, data = _a.data, header = _a.header, timeout = _a.timeout;
    var _c = (0, config_1.getApiConfig)(), baseUrl = _c.baseUrl, defaultTimeout = _c.timeout;
    var url = joinUrl(baseUrl, path);
    var domainValidation = validateRequestDomain(url);
    if (!domainValidation.ok) {
        var message = domainValidation.message || '请求域名未通过校验。';
        notifyIllegalDomain(message);
        var error = new Error(message);
        error.statusCode = 0;
        return Promise.reject(error);
    }
    return new Promise(function (resolve, reject) {
        var storedToken = (0, authToken_1.getStoredToken)();
        var requestHeader = __assign({ 'Content-Type': 'application/json' }, header);
        if (storedToken && !requestHeader.Authorization && !requestHeader.authorization) {
            requestHeader.Authorization = "Bearer ".concat(storedToken);
        }
        wx.request({
            url: url,
            method: method,
            data: data,
            header: requestHeader,
            timeout: timeout !== null && timeout !== void 0 ? timeout : defaultTimeout,
            withCredentials: false,
            success: function (res) {
                var _a;
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(res.data);
                    return;
                }
                var responseData = ((_a = res.data) !== null && _a !== void 0 ? _a : {});
                var message = typeof responseData.message === 'string' && responseData.message
                    ? responseData.message
                    : '请求失败，请稍后重试。';
                var error = new Error(message);
                error.statusCode = res.statusCode;
                error.data = res.data;
                if (res.statusCode === 401) {
                    (0, authToken_1.clearStoredToken)();
                }
                reject(error);
            },
            fail: function (networkError) {
                var error = new Error(networkError.errMsg || '网络请求失败');
                reject(error);
            },
        });
    });
};
exports.apiRequest = apiRequest;
