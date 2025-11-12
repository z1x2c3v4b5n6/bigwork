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
var storage_1 = require("../../utils/storage");
var DASHBOARD_STORAGE_KEY = 'dashboardSnapshot';
var clampNumber = function (value, min, max) {
    var numeric = Number(value);
    if (Number.isNaN(numeric)) {
        return min;
    }
    return Math.min(max, Math.max(min, numeric));
};
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
var normalizeDashboard = function (snapshot) {
    var _a, _b, _c;
    var normalizeCourses = ((_a = snapshot.courses) !== null && _a !== void 0 ? _a : []).map(function (course) { return (__assign(__assign({}, course), { progress: clampNumber(course.progress, 0, 100) })); });
    var normalizePractice = ((_b = snapshot.practiceSets) !== null && _b !== void 0 ? _b : []).map(function (set) {
        var accuracy = clampNumber(set.accuracy, 0, 1);
        var accuracyText = "".concat(Math.round(accuracy * 100), "%");
        var focusText = set.focus && set.focus.trim() ? set.focus : '请在刷题页补充';
        return __assign(__assign({}, set), { accuracy: accuracy, accuracyText: accuracyText, focusText: focusText });
    });
    var normalizeSchedule = ((_c = snapshot.schedule) !== null && _c !== void 0 ? _c : [])
        .map(function (item) { return (__assign(__assign({}, item), { start: formatDisplayTime(item.start), end: formatDisplayTime(item.end), tags: Array.isArray(item.tags) ? item.tags : [], _timestamp: toTimestamp(item.start) })); })
        .sort(function (a, b) { return a._timestamp - b._timestamp; })
        .map(function (_a) {
        var _timestamp = _a._timestamp, rest = __rest(_a, ["_timestamp"]);
        return rest;
    });
    return {
        userName: snapshot.userName || dashboard_1.dashboardSnapshotSeed.userName,
        stats: snapshot.stats && snapshot.stats.length > 0 ? snapshot.stats : dashboard_1.dashboardStatsSeed,
        courses: normalizeCourses.length > 0 ? normalizeCourses : dashboard_1.courseProgressSeed,
        practiceSets: normalizePractice.length > 0
            ? normalizePractice
            : dashboard_1.practiceSetSeed.map(function (set) {
                var _a;
                return (__assign(__assign({}, set), { accuracyText: "".concat(Math.round(((_a = set.accuracy) !== null && _a !== void 0 ? _a : 0) * 100), "%"), focusText: set.focus && set.focus.trim() ? set.focus : '请在刷题页补充' }));
            }),
        schedule: normalizeSchedule.length > 0
            ? normalizeSchedule
            : dashboard_1.scheduleSeed.map(function (item) { return (__assign(__assign({}, item), { start: formatDisplayTime(item.start), end: formatDisplayTime(item.end), tags: Array.isArray(item.tags) ? item.tags : [] })); }),
        recommendation: snapshot.recommendation || dashboard_1.dashboardSnapshotSeed.recommendation,
    };
};
var quickLinkEntries = [
    { id: 'advisor', label: '院校推荐', caption: '智能匹配', icon: '🎯', page: 'advisor' },
    { id: 'analytics', label: '学习分析', caption: '数据看板', icon: '📊', page: 'analytics' },
    { id: 'forum', label: '考研论坛', caption: '交流讨论', icon: '💬', page: 'forum' },
    { id: 'admin', label: '后台管理', caption: '运营任务', icon: '🛠️', page: 'admin' },
    { id: 'checkin', label: '今日打卡', caption: '完成计划', icon: '✅', page: 'checkin', variant: 'accent' },
    { id: 'ai', label: 'AI 助手', caption: '随问随答', icon: '🤖', page: 'ai', variant: 'accent' },
];
var filterQuickLinksByRole = function (role) {
    var normalizedRole = role === 'admin' ? 'admin' : 'student';
    return quickLinkEntries.filter(function (item) { return normalizedRole === 'admin' || item.id !== 'admin'; });
};
var initialSession = (0, session_1.getStoredSession)();
Page({
    data: {
        quickLinks: filterQuickLinksByRole(((initialSession === null || initialSession === void 0 ? void 0 : initialSession.role) || null)),
        snapshot: normalizeDashboard((0, storage_1.loadFromStorage)(DASHBOARD_STORAGE_KEY, dashboard_1.dashboardSnapshotSeed)),
        loading: false,
        errorMessage: '',
    },
    onShow: function () {
        var stored = (0, session_1.getStoredSession)();
        this.updateQuickLinks((stored === null || stored === void 0 ? void 0 : stored.role) || null);
        void this.loadDashboard();
    },
    updateQuickLinks: function (role) {
        this.setData({ quickLinks: filterQuickLinksByRole(role) });
    },
    loadDashboard: function () {
        return __awaiter(this, void 0, void 0, function () {
            var sessionUser, error_1, apiError, message, snapshot, normalized, error_2, apiError, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.setData({ loading: true, errorMessage: '' });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, session_1.ensureSession)()];
                    case 2:
                        sessionUser = _a.sent();
                        this.updateQuickLinks((sessionUser === null || sessionUser === void 0 ? void 0 : sessionUser.role) || null);
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        apiError = error_1;
                        message = (apiError === null || apiError === void 0 ? void 0 : apiError.statusCode) === 401
                            ? '请先在个人中心使用账号密码登录后，再刷新学习看板。'
                            : (apiError === null || apiError === void 0 ? void 0 : apiError.message) || '无法校验登录状态，请稍后重试。';
                        this.setData({ loading: false, errorMessage: message });
                        this.updateQuickLinks(null);
                        return [2 /*return*/];
                    case 4:
                        _a.trys.push([4, 6, 7, 8]);
                        return [4 /*yield*/, (0, api_1.apiRequest)({ path: '/learning/dashboard' })];
                    case 5:
                        snapshot = _a.sent();
                        normalized = normalizeDashboard(snapshot);
                        this.setData({ snapshot: normalized });
                        (0, storage_1.saveToStorage)(DASHBOARD_STORAGE_KEY, snapshot);
                        return [3 /*break*/, 8];
                    case 6:
                        error_2 = _a.sent();
                        apiError = error_2;
                        message = (apiError === null || apiError === void 0 ? void 0 : apiError.message) || '加载学习看板失败，请稍后重试。';
                        this.setData({ errorMessage: message });
                        return [3 /*break*/, 8];
                    case 7:
                        this.setData({ loading: false });
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        });
    },
    navigateToPage: function (event) {
        var _a, _b, _c;
        var dataset = (_b = (_a = event.currentTarget) === null || _a === void 0 ? void 0 : _a.dataset) !== null && _b !== void 0 ? _b : {};
        var page = dataset.page;
        var openType = (_c = dataset.openType) !== null && _c !== void 0 ? _c : 'navigate';
        if (!page) {
            return;
        }
        var url = "/pages/".concat(page, "/index");
        if (openType === 'switchTab') {
            wx.switchTab({ url: url }).catch(function (error) {
                console.warn('切换 Tab 失败', error);
            });
            return;
        }
        wx.navigateTo({ url: url }).catch(function (error) {
            console.warn('导航失败', error);
        });
    },
});
