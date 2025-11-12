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
Object.defineProperty(exports, "__esModule", { value: true });
var dashboard_1 = require("../../data/dashboard");
var api_1 = require("../../utils/api");
var session_1 = require("../../utils/session");
var pad = function (value) { return (value < 10 ? "0".concat(value) : "".concat(value)); };
var toTimestamp = function (value) {
    if (!value) {
        return Date.now();
    }
    var candidate = value.includes('T') ? value : value.replace(' ', 'T');
    var parsed = new Date(candidate);
    return Number.isNaN(parsed.getTime()) ? Date.now() : parsed.getTime();
};
var formatDisplayTime = function (value) {
    var timestamp = toTimestamp(value);
    var date = new Date(timestamp);
    return "".concat(date.getFullYear(), "-").concat(pad(date.getMonth() + 1), "-").concat(pad(date.getDate()), " ").concat(pad(date.getHours()), ":").concat(pad(date.getMinutes()));
};
var formatDate = function (date) { return "".concat(date.getFullYear(), "-").concat(pad(date.getMonth() + 1), "-").concat(pad(date.getDate())); };
var formatTime = function (date) { return "".concat(pad(date.getHours()), ":").concat(pad(date.getMinutes())); };
var createForm = function () {
    var now = new Date();
    var end = new Date(now.getTime() + 60 * 60 * 1000);
    return {
        title: '',
        type: '自习',
        startDate: formatDate(now),
        startTime: formatTime(now),
        endDate: formatDate(end),
        endTime: formatTime(end),
        location: '',
        focus: '',
        tags: '',
    };
};
var normalizeSchedule = function (items) {
    return items
        .map(function (item) {
        var startTimestamp = toTimestamp(item.start);
        return __assign(__assign({}, item), { id: item.id || "schedule_".concat(startTimestamp), title: item.title || '学习任务', type: item.type || '自习', start: formatDisplayTime(item.start), end: formatDisplayTime(item.end), tags: Array.isArray(item.tags) ? item.tags : [], _timestamp: startTimestamp });
    })
        .sort(function (a, b) { return a._timestamp - b._timestamp; })
        .map(function (_a) {
        var _timestamp = _a._timestamp, rest = __rest(_a, ["_timestamp"]);
        return rest;
    });
};
Page({
    data: {
        schedule: normalizeSchedule(dashboard_1.scheduleSeed),
        form: createForm(),
        errorMessage: '',
        successMessage: '',
        loading: false,
        submitting: false,
        formVisible: false,
        formErrorMessage: '',
    },
    onShow: function () {
        void this.loadSchedule();
    },
    loadSchedule: function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1, apiError, message, response, items, error_2, apiError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.setData({ loading: true, errorMessage: '', successMessage: '', formErrorMessage: '' });
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
                            ? '请先在个人中心完成登录后，再同步学习日程。'
                            : (apiError === null || apiError === void 0 ? void 0 : apiError.message) || '无法校验登录状态，请稍后重试。';
                        this.setData({ loading: false, errorMessage: message });
                        return [2 /*return*/];
                    case 4:
                        _a.trys.push([4, 6, 7, 8]);
                        return [4 /*yield*/, (0, api_1.apiRequest)({ path: '/learning/schedule' })];
                    case 5:
                        response = _a.sent();
                        items = Array.isArray(response.schedule) ? response.schedule : [];
                        this.setData({ schedule: normalizeSchedule(items) });
                        return [3 /*break*/, 8];
                    case 6:
                        error_2 = _a.sent();
                        apiError = error_2;
                        this.setData({ errorMessage: (apiError === null || apiError === void 0 ? void 0 : apiError.message) || '加载学习日程失败，请稍后重试。' });
                        return [3 /*break*/, 8];
                    case 7:
                        this.setData({ loading: false });
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        });
    },
    toggleFormVisibility: function () {
        var nextVisible = !this.data.formVisible;
        if (!nextVisible && this.data.submitting) {
            return;
        }
        if (nextVisible) {
            this.setData({ formVisible: true, formErrorMessage: '', successMessage: '' });
            return;
        }
        this.setData({ formVisible: false, form: createForm(), formErrorMessage: '', successMessage: '' });
    },
    cancelForm: function () {
        if (this.data.submitting) {
            return;
        }
        this.setData({ formVisible: false, form: createForm(), formErrorMessage: '', successMessage: '' });
    },
    handleInput: function (event) {
        var _a;
        var _b, _c, _d;
        var field = (_c = (_b = event.currentTarget) === null || _b === void 0 ? void 0 : _b.dataset) === null || _c === void 0 ? void 0 : _c.field;
        if (!field) {
            return;
        }
        var value = (_d = event.detail.value) !== null && _d !== void 0 ? _d : '';
        this.setData({
            form: __assign(__assign({}, this.data.form), (_a = {}, _a[field] = value, _a)),
            errorMessage: '',
            successMessage: '',
            formErrorMessage: '',
        });
    },
    handleDateChange: function (event) {
        var _a;
        var _b, _c, _d;
        var field = (_c = (_b = event.currentTarget) === null || _b === void 0 ? void 0 : _b.dataset) === null || _c === void 0 ? void 0 : _c.field;
        if (!field) {
            return;
        }
        var value = (_d = event.detail.value) !== null && _d !== void 0 ? _d : '';
        this.setData({
            form: __assign(__assign({}, this.data.form), (_a = {}, _a[field] = value, _a)),
            errorMessage: '',
            successMessage: '',
            formErrorMessage: '',
        });
    },
    handleTimeChange: function (event) {
        var _a;
        var _b, _c, _d;
        var field = (_c = (_b = event.currentTarget) === null || _b === void 0 ? void 0 : _b.dataset) === null || _c === void 0 ? void 0 : _c.field;
        if (!field) {
            return;
        }
        var value = (_d = event.detail.value) !== null && _d !== void 0 ? _d : '';
        this.setData({
            form: __assign(__assign({}, this.data.form), (_a = {}, _a[field] = value, _a)),
            errorMessage: '',
            successMessage: '',
            formErrorMessage: '',
        });
    },
    createSchedule: function () {
        return __awaiter(this, void 0, void 0, function () {
            var form, tags, error_3, apiError, message;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        form = this.data.form;
                        if (!form.title || !form.title.trim()) {
                            this.setData({ formErrorMessage: '请输入日程标题' });
                            return [2 /*return*/];
                        }
                        if (!form.startDate || !form.startTime || !form.endDate || !form.endTime) {
                            this.setData({ formErrorMessage: '请选择开始与结束时间' });
                            return [2 /*return*/];
                        }
                        tags = form.tags
                            .split(/[,，\s]+/)
                            .map(function (tag) { return tag.trim(); })
                            .filter(Boolean);
                        this.setData({ submitting: true, errorMessage: '', successMessage: '', formErrorMessage: '' });
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 4, 5, 6]);
                        return [4 /*yield*/, (0, api_1.apiRequest)({
                                path: '/learning/schedule',
                                method: 'POST',
                                data: {
                                    title: form.title.trim(),
                                    type: ((_a = form.type) === null || _a === void 0 ? void 0 : _a.trim()) || '自习',
                                    start: "".concat(form.startDate, " ").concat(form.startTime),
                                    end: "".concat(form.endDate, " ").concat(form.endTime),
                                    allDay: false,
                                    location: ((_b = form.location) === null || _b === void 0 ? void 0 : _b.trim()) || null,
                                    focus: ((_c = form.focus) === null || _c === void 0 ? void 0 : _c.trim()) || null,
                                    tags: tags,
                                },
                            })];
                    case 2:
                        _d.sent();
                        return [4 /*yield*/, this.loadSchedule()];
                    case 3:
                        _d.sent();
                        this.setData({ form: createForm(), successMessage: '日程已创建。', formVisible: false, formErrorMessage: '' });
                        return [3 /*break*/, 6];
                    case 4:
                        error_3 = _d.sent();
                        apiError = error_3;
                        message = (apiError === null || apiError === void 0 ? void 0 : apiError.message) || '创建日程失败，请稍后重试。';
                        this.setData({ formErrorMessage: message, errorMessage: message });
                        return [3 /*break*/, 6];
                    case 5:
                        this.setData({ submitting: false });
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    },
});
