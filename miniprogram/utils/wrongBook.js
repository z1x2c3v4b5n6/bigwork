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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
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
exports.syncWrongBook = exports.removeWrongQuestion = exports.markItemsAsSynced = exports.upsertWrongQuestion = exports.getWrongBookItems = void 0;
var wrongBook_1 = require("../data/wrongBook");
var api_1 = require("./api");
var storage_1 = require("./storage");
var WRONG_BOOK_STORAGE_KEY = 'practiceWrongBook';
var mapSeedToItem = function (item) { return (__assign(__assign({}, item), { synced: true })); };
var loadStorageState = function () {
    return (0, storage_1.loadFromStorage)(WRONG_BOOK_STORAGE_KEY, {
        items: wrongBook_1.wrongQuestionSeed.map(function (seed) { return mapSeedToItem(seed); }),
        lastSyncedAt: null,
    });
};
var saveStorageState = function (state) { return (0, storage_1.saveToStorage)(WRONG_BOOK_STORAGE_KEY, state); };
var normalizeItem = function (item) { return (__assign(__assign({}, item), { synced: item.synced !== false })); };
var getWrongBookItems = function () {
    return loadStorageState().items.map(function (item) { return normalizeItem(item); });
};
exports.getWrongBookItems = getWrongBookItems;
var upsertWrongQuestion = function (entry) {
    var state = loadStorageState();
    var items = state.items.filter(function (item) { return item.id !== entry.id; });
    items.unshift(__assign(__assign({}, entry), { synced: false }));
    saveStorageState(__assign(__assign({}, state), { items: items }));
};
exports.upsertWrongQuestion = upsertWrongQuestion;
var markItemsAsSynced = function (ids) {
    var state = loadStorageState();
    var idSet = new Set(ids);
    var nextItems = state.items.map(function (item) {
        return idSet.has(item.id) ? __assign(__assign({}, item), { synced: true }) : item;
    });
    saveStorageState(__assign(__assign({}, state), { items: nextItems, lastSyncedAt: new Date().toISOString() }));
};
exports.markItemsAsSynced = markItemsAsSynced;
var removeWrongQuestion = function (id) {
    var state = loadStorageState();
    var nextItems = state.items.filter(function (item) { return item.id !== id; });
    saveStorageState(__assign(__assign({}, state), { items: nextItems }));
};
exports.removeWrongQuestion = removeWrongQuestion;
var syncWrongBook = function () { return __awaiter(void 0, void 0, void 0, function () {
    var state, pending, uploadResult, uploadError, response, mergedIds_1, remoteItems, localOnly, nextItems, error_1, apiError;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                state = loadStorageState();
                pending = state.items.filter(function (item) { return !item.synced; });
                _c.label = 1;
            case 1:
                _c.trys.push([1, 5, , 6]);
                if (!(pending.length > 0)) return [3 /*break*/, 3];
                return [4 /*yield*/, (0, api_1.apiRequest)({
                        path: '/practice/wrong-questions/bulk',
                        method: 'POST',
                        data: { questions: pending.map(function (_a) {
                                var synced = _a.synced, rest = __rest(_a, ["synced"]);
                                return rest;
                            }) },
                    })];
            case 2:
                uploadResult = _c.sent();
                if ((uploadResult === null || uploadResult === void 0 ? void 0 : uploadResult.success) === false && uploadResult.message) {
                    uploadError = new Error(uploadResult.message);
                    uploadError.statusCode = 0;
                    throw uploadError;
                }
                (0, exports.markItemsAsSynced)(pending.map(function (item) { return item.id; }));
                _c.label = 3;
            case 3: return [4 /*yield*/, (0, api_1.apiRequest)({
                    path: '/practice/wrong-questions',
                })];
            case 4:
                response = _c.sent();
                mergedIds_1 = new Set();
                remoteItems = ((_a = response === null || response === void 0 ? void 0 : response.questions) !== null && _a !== void 0 ? _a : []).map(function (question) {
                    mergedIds_1.add(question.id);
                    return mapSeedToItem(question);
                });
                localOnly = loadStorageState().items.filter(function (item) { return !mergedIds_1.has(item.id); });
                nextItems = __spreadArray(__spreadArray([], remoteItems, true), localOnly, true);
                saveStorageState({ items: nextItems, lastSyncedAt: new Date().toISOString() });
                return [2 /*return*/, { items: nextItems, pendingSync: [] }];
            case 5:
                error_1 = _c.sent();
                apiError = error_1;
                console.warn('[wrong-book] 同步失败，保留本地数据。', (_b = apiError === null || apiError === void 0 ? void 0 : apiError.message) !== null && _b !== void 0 ? _b : error_1);
                return [2 /*return*/, { items: state.items, pendingSync: pending }];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.syncWrongBook = syncWrongBook;
