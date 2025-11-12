"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearStoredToken = exports.saveToken = exports.getStoredToken = void 0;
var storage_1 = require("./storage");
var TOKEN_STORAGE_KEY = 'authToken';
var getStoredToken = function () {
    var stored = (0, storage_1.loadFromStorage)(TOKEN_STORAGE_KEY, null);
    if (typeof stored === 'string' && stored.trim()) {
        return stored;
    }
    return null;
};
exports.getStoredToken = getStoredToken;
var saveToken = function (token) {
    if (typeof token === 'string' && token.trim()) {
        (0, storage_1.saveToStorage)(TOKEN_STORAGE_KEY, token.trim());
        return;
    }
    (0, storage_1.resetStorageKey)(TOKEN_STORAGE_KEY);
};
exports.saveToken = saveToken;
var clearStoredToken = function () {
    (0, storage_1.resetStorageKey)(TOKEN_STORAGE_KEY);
};
exports.clearStoredToken = clearStoredToken;
