"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetStorageKey = exports.saveToStorage = exports.loadFromStorage = void 0;
var loadFromStorage = function (key, fallback) {
    try {
        var raw = wx.getStorageSync(key);
        if (raw === '' || raw === null || raw === undefined) {
            return fallback;
        }
        return raw;
    }
    catch (error) {
        console.warn("[storage] \u8BFB\u53D6 ".concat(key, " \u5931\u8D25"), error);
        return fallback;
    }
};
exports.loadFromStorage = loadFromStorage;
var saveToStorage = function (key, value) {
    try {
        wx.setStorageSync(key, value);
    }
    catch (error) {
        console.warn("[storage] \u5199\u5165 ".concat(key, " \u5931\u8D25"), error);
    }
};
exports.saveToStorage = saveToStorage;
var resetStorageKey = function (key) {
    try {
        wx.removeStorageSync(key);
    }
    catch (error) {
        console.warn("[storage] \u6E05\u9664 ".concat(key, " \u5931\u8D25"), error);
    }
};
exports.resetStorageKey = resetStorageKey;
