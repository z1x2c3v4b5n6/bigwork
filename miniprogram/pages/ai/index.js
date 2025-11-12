"use strict";
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
var api_1 = require("../../utils/api");
var session_1 = require("../../utils/session");
var fallbackSuggestions = [
    {
        id: 'english',
        title: '英语写作突破',
        description: '梳理写作模板与高分表达，匹配历年真题训练。',
        sampleQuestion: '如何整理英语作文模板，写作时更快进入状态？',
    },
    {
        id: 'algorithm',
        title: '算法与 408 提升',
        description: '围绕 408 高频考点强化，补齐数据结构薄弱环节。',
        sampleQuestion: '408 数据结构与算法刷题应该如何安排顺序？',
    },
    {
        id: 'interview',
        title: '复试面试准备',
        description: '模拟导师追问场景，完善结构化自我介绍。',
        sampleQuestion: '复试面试自我介绍需要包含哪些重点？',
    },
];
var fallbackCourseRecommendations = [
    {
        title: '英语写作冲刺训练营',
        teacher: '王老师',
        highlight: '系统整理万能开头、结尾模板，配合真题限时演练。',
    },
    {
        title: '408 高频考点刷题班',
        teacher: '张老师',
        highlight: '按知识点拆分题型，补齐图论与动态规划薄弱环节。',
    },
    {
        title: '复试面试模拟工作坊',
        teacher: '教研团队',
        highlight: '模拟导师追问场景，打磨结构化自我介绍。',
    },
];
var fallbackMaterialRecommendations = [
    {
        title: '英语作文万能句型速查表',
        type: '资料',
        url: '',
        description: '精选 30 句高频万能句，支持临场快速套用。',
    },
    {
        title: '线代必背公式与易错点',
        type: '资料',
        url: '',
        description: '覆盖矩阵运算、特征值等核心考点，附典型例题。',
    },
    {
        title: '复试热点答题模板',
        type: '资料',
        url: '',
        description: '按时政主题整理的结构化答题模板，便于速记。',
    },
];
var formatTimestamp = function (input) {
    var date = new Date(input);
    if (Number.isNaN(date.getTime())) {
        return '';
    }
    var pad = function (value) { return String(value).padStart(2, '0'); };
    var now = new Date();
    if (now.getFullYear() === date.getFullYear()) {
        if (now.getMonth() === date.getMonth() && now.getDate() === date.getDate()) {
            return "\u4ECA\u5929 ".concat(pad(date.getHours()), ":").concat(pad(date.getMinutes()));
        }
        var yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        if (yesterday.getFullYear() === date.getFullYear() &&
            yesterday.getMonth() === date.getMonth() &&
            yesterday.getDate() === date.getDate()) {
            return "\u6628\u5929 ".concat(pad(date.getHours()), ":").concat(pad(date.getMinutes()));
        }
    }
    return "".concat(date.getFullYear(), "-").concat(pad(date.getMonth() + 1), "-").concat(pad(date.getDate()), " ").concat(pad(date.getHours()), ":").concat(pad(date.getMinutes()));
};
var createMessage = function (role, content) {
    var now = new Date();
    return {
        id: "".concat(role, "-").concat(now.getTime(), "-").concat(Math.random().toString(16).slice(2)),
        role: role,
        content: content,
        createdAtIso: now.toISOString(),
        createdAtText: formatTimestamp(now),
    };
};
Page({
    data: {
        inputValue: '',
        loading: false,
        errorMessage: '',
        overviewLoading: false,
        overviewError: '',
        messages: [],
        suggestions: fallbackSuggestions,
        recentConversations: [],
        recommendedCourses: fallbackCourseRecommendations,
        recommendedMaterials: fallbackMaterialRecommendations,
    },
    onShow: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initialize()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    },
    initialize: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.setData({ errorMessage: '', overviewError: '' });
                        return [4 /*yield*/, this.loadOverview()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    },
    loadOverview: function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, suggestions, recentConversations, recommendedCourses, recommendedMaterials, error_1, apiError, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.setData({ overviewLoading: true, overviewError: '' });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, (0, api_1.apiRequest)({ path: '/ai/overview' })];
                    case 2:
                        response = _a.sent();
                        suggestions = Array.isArray(response.suggestions) && response.suggestions.length
                            ? response.suggestions.map(function (item, index) { return ({
                                id: item.id || "suggestion-".concat(index),
                                title: item.title || fallbackSuggestions[index % fallbackSuggestions.length].title,
                                description: item.description || fallbackSuggestions[index % fallbackSuggestions.length].description,
                                sampleQuestion: item.sampleQuestion || fallbackSuggestions[index % fallbackSuggestions.length].sampleQuestion,
                            }); })
                            : fallbackSuggestions;
                        recentConversations = Array.isArray(response.recentConversations)
                            ? response.recentConversations
                                .filter(function (item) { return typeof (item === null || item === void 0 ? void 0 : item.question) === 'string' && item.question.trim(); })
                                .map(function (item, index) { return ({
                                id: item.id ? String(item.id) : "recent-".concat(index),
                                question: item.question.trim(),
                                answer: item.answer || '',
                                createdAt: item.createdAt || null,
                                createdAtText: item.createdAtText || (item.createdAt ? formatTimestamp(item.createdAt) : ''),
                            }); })
                            : [];
                        recommendedCourses = Array.isArray(response.recommendedCourses) && response.recommendedCourses.length
                            ? response.recommendedCourses
                            : fallbackCourseRecommendations;
                        recommendedMaterials = Array.isArray(response.recommendedMaterials) && response.recommendedMaterials.length
                            ? response.recommendedMaterials
                            : fallbackMaterialRecommendations;
                        this.setData({
                            suggestions: suggestions,
                            recentConversations: recentConversations,
                            recommendedCourses: recommendedCourses,
                            recommendedMaterials: recommendedMaterials,
                        });
                        return [3 /*break*/, 5];
                    case 3:
                        error_1 = _a.sent();
                        apiError = error_1;
                        message = (apiError === null || apiError === void 0 ? void 0 : apiError.statusCode) === 401
                            ? '登录后可查看个性化推荐，可在“我的”页登录后重试。'
                            : (apiError === null || apiError === void 0 ? void 0 : apiError.message) || '获取 AI 助手概览失败，请稍后再试。';
                        this.setData({
                            overviewError: message,
                            suggestions: fallbackSuggestions,
                            recentConversations: [],
                            recommendedCourses: fallbackCourseRecommendations,
                            recommendedMaterials: fallbackMaterialRecommendations,
                        });
                        return [3 /*break*/, 5];
                    case 4:
                        this.setData({ overviewLoading: false });
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    },
    handleInput: function (event) {
        var _a;
        this.setData({ inputValue: (_a = event.detail.value) !== null && _a !== void 0 ? _a : '' });
    },
    sendMessage: function () {
        return __awaiter(this, void 0, void 0, function () {
            var question, userMessage, nextMessages, error_2, apiError, message, response, answerText, assistantMessage, newRecent, dedupedRecent, error_3, apiError, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        question = this.data.inputValue.trim();
                        if (!question || this.data.loading) {
                            return [2 /*return*/];
                        }
                        userMessage = createMessage('user', question);
                        nextMessages = __spreadArray(__spreadArray([], this.data.messages, true), [userMessage], false);
                        this.setData({
                            loading: true,
                            inputValue: '',
                            errorMessage: '',
                            messages: nextMessages,
                        });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, session_1.ensureSession)()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        apiError = error_2;
                        message = (apiError === null || apiError === void 0 ? void 0 : apiError.statusCode) === 401
                            ? '登录后可使用 AI 助手，可在“我的”页登录后重试。'
                            : (apiError === null || apiError === void 0 ? void 0 : apiError.message) || '登录状态校验失败，请稍后再试。';
                        this.setData({ loading: false, errorMessage: message });
                        return [2 /*return*/];
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, (0, api_1.apiRequest)({
                                path: '/ai/ask',
                                method: 'POST',
                                data: { question: question },
                            })];
                    case 5:
                        response = _a.sent();
                        answerText = (response === null || response === void 0 ? void 0 : response.answer) || '暂未获取到答案，请稍后再试。';
                        assistantMessage = createMessage('assistant', answerText);
                        newRecent = {
                            id: assistantMessage.id,
                            question: question,
                            answer: answerText,
                            createdAt: assistantMessage.createdAtIso,
                            createdAtText: assistantMessage.createdAtText,
                        };
                        dedupedRecent = __spreadArray([newRecent], this.data.recentConversations, true).filter(function (item, index, array) { return array.findIndex(function (entry) { return entry.question === item.question; }) === index; })
                            .slice(0, 5);
                        this.setData({
                            messages: __spreadArray(__spreadArray([], nextMessages, true), [assistantMessage], false),
                            loading: false,
                            recentConversations: dedupedRecent,
                        });
                        void this.loadOverview();
                        return [3 /*break*/, 7];
                    case 6:
                        error_3 = _a.sent();
                        apiError = error_3;
                        message = (apiError === null || apiError === void 0 ? void 0 : apiError.message) || 'AI 助手暂时不可用，请稍后再试。';
                        this.setData({ loading: false, errorMessage: message });
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    },
    applySuggestion: function (event) {
        var _a, _b, _c;
        var question = (_c = (_b = (_a = event.currentTarget) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b.question) !== null && _c !== void 0 ? _c : '';
        if (!question) {
            return;
        }
        this.setData({ inputValue: question });
        void this.sendMessage();
    },
    copyLink: function (event) {
        var _a, _b, _c;
        var url = (_c = (_b = (_a = event.currentTarget) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b.url) !== null && _c !== void 0 ? _c : '';
        if (!url) {
            wx.showToast({ title: '暂无链接', icon: 'none' });
            return;
        }
        wx.setClipboardData({
            data: url,
            success: function () {
                wx.showToast({ title: '链接已复制', icon: 'success' });
            },
            fail: function () {
                wx.showToast({ title: '复制失败', icon: 'none' });
            },
        });
    },
    resend: function (event) {
        var _a, _b;
        var question = (_b = (_a = event.currentTarget) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b.question;
        if (!question) {
            return;
        }
        this.setData({ inputValue: question });
        void this.sendMessage();
    },
});
