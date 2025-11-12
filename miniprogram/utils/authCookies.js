"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearStoredCookies = exports.storeResponseCookies = exports.getStoredCookieHeader = void 0;
var storage_1 = require("./storage");
var COOKIE_STORAGE_KEY = 'sessionCookieHeader';
var normalizeCookie = function (cookie) {
    var _a;
    if (!cookie) {
        return null;
    }
    var trimmed = (_a = cookie.split(';')[0]) === null || _a === void 0 ? void 0 : _a.trim();
    return trimmed ? trimmed : null;
};
var extractFromCookieArray = function (cookies) {
    if (!Array.isArray(cookies)) {
        return [];
    }
    return cookies
        .map(function (cookie) {
        if (typeof cookie === 'string') {
            return cookie;
        }
        if (cookie && typeof cookie === 'object') {
            var record = cookie;
            if (typeof record.name === 'string' && typeof record.value === 'string') {
                return "".concat(record.name, "=").concat(record.value);
            }
        }
        return '';
    })
        .filter(function (value) { return Boolean(value); });
};
var extractFromHeader = function (headerValue) {
    if (typeof headerValue === 'string') {
        return [headerValue];
    }
    if (Array.isArray(headerValue)) {
        return headerValue.filter(function (value) { return typeof value === 'string'; });
    }
    return [];
};
var deduplicate = function (values) {
    var seen = new Set();
    var result = [];
    values.forEach(function (value) {
        if (!seen.has(value)) {
            seen.add(value);
            result.push(value);
        }
    });
    return result;
};
var getStoredCookieHeader = function () {
    var stored = (0, storage_1.loadFromStorage)(COOKIE_STORAGE_KEY, null);
    if (typeof stored === 'string' && stored.trim()) {
        return stored;
    }
    return null;
};
exports.getStoredCookieHeader = getStoredCookieHeader;
var storeResponseCookies = function (response) {
    var _a;
    var header = (_a = response.header) !== null && _a !== void 0 ? _a : {};
    var cookieCandidates = __spreadArray(__spreadArray(__spreadArray([], extractFromCookieArray(response.cookies), true), extractFromHeader(header['Set-Cookie']), true), extractFromHeader(header['set-cookie']), true);
    var normalized = deduplicate(cookieCandidates
        .map(function (cookie) { return normalizeCookie(cookie); })
        .filter(function (cookie) { return Boolean(cookie); }));
    if (!normalized.length) {
        return null;
    }
    var headerValue = normalized.join('; ');
    (0, storage_1.saveToStorage)(COOKIE_STORAGE_KEY, headerValue);
    return headerValue;
};
exports.storeResponseCookies = storeResponseCookies;
var clearStoredCookies = function () {
    (0, storage_1.resetStorageKey)(COOKIE_STORAGE_KEY);
};
exports.clearStoredCookies = clearStoredCookies;
