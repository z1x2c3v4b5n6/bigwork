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
Object.defineProperty(exports, "__esModule", { value: true });
var api_1 = require("../../utils/api");
var wrongBook_1 = require("../../utils/wrongBook");
var session_1 = require("../../utils/session");
var createForm = function () { return ({
    question: '',
    answer: '',
    analysis: '',
}); };
var formatDateTime = function (value) {
    if (!value) {
        return '';
    }
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    var yyyy = date.getFullYear();
    var mm = "".concat(date.getMonth() + 1).padStart(2, '0');
    var dd = "".concat(date.getDate()).padStart(2, '0');
    var hh = "".concat(date.getHours()).padStart(2, '0');
    var mi = "".concat(date.getMinutes()).padStart(2, '0');
    return "".concat(yyyy, "-").concat(mm, "-").concat(dd, " ").concat(hh, ":").concat(mi);
};
var decorateItems = function (items) {
    return items.map(function (item) { return (__assign(__assign({}, item), { displayTime: formatDateTime(item.updatedAt) })); });
};
Page({
    data: {
        items: decorateItems((0, wrongBook_1.getWrongBookItems)()),
        pendingCount: (0, wrongBook_1.getWrongBookItems)().filter(function (item) { return !item.synced; }).length,
        syncing: false,
        errorMessage: '',
        successMessage: '',
        formVisible: false,
        form: createForm(),
    },
    onShow: function () {
        this.refreshLocal();
        void this.syncWithServer();
    },
    refreshLocal: function () {
        var items = (0, wrongBook_1.getWrongBookItems)();
        this.setData({
            items: decorateItems(items),
            pendingCount: items.filter(function (item) { return !item.synced; }).length,
        });
    },
    syncWithServer: function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1, apiError, message, result, pendingCount, error_2, apiError, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.data.syncing) {
                            return [2 /*return*/];
                        }
                        this.setData({ syncing: true, errorMessage: '', successMessage: '' });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, session_1.ensureSession)()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        apiError = error_1;
                        message = (apiError === null || apiError === void 0 ? void 0 : apiError.statusCode) === 401
                            ? '登录后可同步错题，当前展示为本地缓存。'
                            : (apiError === null || apiError === void 0 ? void 0 : apiError.message) || '登录状态校验失败，请稍后再试。';
                        this.setData({ syncing: false, errorMessage: message });
                        return [2 /*return*/];
                    case 4:
                        _a.trys.push([4, 6, 7, 8]);
                        return [4 /*yield*/, (0, wrongBook_1.syncWrongBook)()];
                    case 5:
                        result = _a.sent();
                        pendingCount = result.pendingSync.filter(function (item) { return !item.synced; }).length;
                        this.setData({
                            items: decorateItems(result.items),
                            pendingCount: pendingCount,
                            successMessage: pendingCount === 0 ? '错题本已与云端同步。' : '存在离线修改，待网络恢复自动同步。',
                        });
                        return [3 /*break*/, 8];
                    case 6:
                        error_2 = _a.sent();
                        apiError = error_2;
                        message = (apiError === null || apiError === void 0 ? void 0 : apiError.message) || '同步错题失败，请稍后再试。';
                        this.setData({ errorMessage: message });
                        return [3 /*break*/, 8];
                    case 7:
                        this.setData({ syncing: false });
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        });
    },
    toggleForm: function () {
        this.setData({
            formVisible: !this.data.formVisible,
            form: !this.data.formVisible ? this.data.form : createForm(),
            successMessage: '',
            errorMessage: '',
        });
    },
    handleFormInput: function (event) {
        var _a;
        var _b, _c, _d;
        var field = (_c = (_b = event.currentTarget) === null || _b === void 0 ? void 0 : _b.dataset) === null || _c === void 0 ? void 0 : _c.field;
        if (!field) {
            return;
        }
        var value = (_d = event.detail.value) !== null && _d !== void 0 ? _d : '';
        this.setData({ form: __assign(__assign({}, this.data.form), (_a = {}, _a[field] = value, _a)) });
    },
    submitForm: function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, question, answer, analysis, id, entry;
            return __generator(this, function (_b) {
                _a = this.data.form, question = _a.question, answer = _a.answer, analysis = _a.analysis;
                if (!question.trim() || !answer.trim()) {
                    this.setData({ errorMessage: '题干和参考答案不能为空。' });
                    return [2 /*return*/];
                }
                id = "local-".concat(Date.now());
                entry = {
                    id: id,
                    question: question.trim(),
                    answer: answer.trim(),
                    analysis: analysis.trim(),
                    updatedAt: new Date().toISOString(),
                    synced: false,
                };
                (0, wrongBook_1.upsertWrongQuestion)(entry);
                this.setData({ form: createForm(), formVisible: false });
                this.refreshLocal();
                wx.showToast({ title: '已保存', icon: 'success' });
                void this.syncWithServer();
                return [2 /*return*/];
            });
        });
    },
    removeEntry: function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var id, error_3, apiError;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        id = (_b = (_a = event.currentTarget) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b.id;
                        if (!id) {
                            return [2 /*return*/];
                        }
                        (0, wrongBook_1.removeWrongQuestion)(id);
                        this.refreshLocal();
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, (0, session_1.ensureSession)()];
                    case 2:
                        _d.sent();
                        return [4 /*yield*/, (0, api_1.apiRequest)({ path: "/practice/wrong-questions/".concat(id), method: 'DELETE' })];
                    case 3:
                        _d.sent();
                        wx.showToast({ title: '已删除', icon: 'none' });
                        void this.syncWithServer();
                        return [3 /*break*/, 5];
                    case 4:
                        error_3 = _d.sent();
                        apiError = error_3;
                        console.warn('[wrongbook] 删除云端记录失败', (_c = apiError === null || apiError === void 0 ? void 0 : apiError.message) !== null && _c !== void 0 ? _c : error_3);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    },
    handleManualSync: function () {
        void this.syncWithServer();
    },
    formatDisplayTime: function (value) {
        return formatDateTime(value);
    },
});
