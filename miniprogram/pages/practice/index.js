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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
var practice_1 = require("../../data/practice");
var api_1 = require("../../utils/api");
var session_1 = require("../../utils/session");
var createSetForm = function () { return ({
    title: '',
    description: '',
    difficulty: '基础',
    tags: '',
}); };
var createQuestionForm = function () { return ({
    questionText: '',
    answerText: '',
    explanation: '',
    tags: '',
    difficulty: '基础',
}); };
var difficultyDisplayMap = {
    easy: '基础',
    medium: '进阶',
    hard: '冲刺',
};
var difficultyApiMap = {
    基础: 'easy',
    进阶: 'medium',
    冲刺: 'hard',
};
var toDisplayDifficulty = function (value) {
    if (!value) {
        return '基础';
    }
    var trimmed = String(value).trim();
    return difficultyDisplayMap[trimmed] || trimmed || '基础';
};
var toApiDifficulty = function (value) {
    if (!value) {
        return 'medium';
    }
    var trimmed = String(value).trim();
    return difficultyApiMap[trimmed] || trimmed || 'medium';
};
var mapSet = function (set) {
    var _a;
    return (__assign(__assign({}, set), { difficulty: toDisplayDifficulty(set.difficulty), questionCount: Number((_a = set.questionCount) !== null && _a !== void 0 ? _a : 0), tags: Array.isArray(set.tags) ? set.tags : [] }));
};
var mapQuestion = function (question, setId) { return (__assign(__assign({}, question), { setId: setId, difficulty: toDisplayDifficulty(question.difficulty), tags: Array.isArray(question.tags) ? question.tags : [] })); };
Page({
    data: {
        sets: practice_1.practiceSetSeed.map(function (set) { return mapSet(set); }),
        selectedSetId: (_b = (_a = practice_1.practiceSetSeed[0]) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : '',
        visibleQuestions: practice_1.practiceQuestionSeed
            .filter(function (item) { var _a, _b; return item.setId === ((_b = (_a = practice_1.practiceSetSeed[0]) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : ''); })
            .map(function (question) { return mapQuestion(question, question.setId); }),
        setForm: createSetForm(),
        questionForm: createQuestionForm(),
        errorMessage: '',
        successMessage: '',
        loadingSets: false,
        loadingQuestions: false,
        submittingSet: false,
        submittingQuestion: false,
        setFormVisible: false,
        questionFormVisible: false,
        setFormErrorMessage: '',
        questionFormErrorMessage: '',
    },
    onShow: function () {
        void this.loadSets();
    },
    loadSets: function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1, apiError, message, response, sets, selectedSetId, error_2, apiError;
            var _this = this;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        this.setData({ loadingSets: true, errorMessage: '', successMessage: '' });
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, session_1.ensureSession)()];
                    case 2:
                        _c.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _c.sent();
                        apiError = error_1;
                        message = (apiError === null || apiError === void 0 ? void 0 : apiError.statusCode) === 401
                            ? '请先登录后再同步题单，可在个人中心完成账号密码登录。'
                            : (apiError === null || apiError === void 0 ? void 0 : apiError.message) || '无法校验登录状态，请稍后重试。';
                        this.setData({ loadingSets: false, errorMessage: message });
                        return [2 /*return*/];
                    case 4:
                        _c.trys.push([4, 9, 10, 11]);
                        return [4 /*yield*/, (0, api_1.apiRequest)({ path: '/practice/sets' })];
                    case 5:
                        response = _c.sent();
                        sets = Array.isArray(response.sets) ? response.sets.map(function (set) { return mapSet(set); }) : [];
                        selectedSetId = sets.some(function (set) { return set.id === _this.data.selectedSetId; })
                            ? this.data.selectedSetId
                            : (_b = (_a = sets[0]) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : '';
                        this.setData({ sets: sets, selectedSetId: selectedSetId });
                        if (!selectedSetId) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.loadQuestions(selectedSetId)];
                    case 6:
                        _c.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        this.setData({ visibleQuestions: [] });
                        _c.label = 8;
                    case 8: return [3 /*break*/, 11];
                    case 9:
                        error_2 = _c.sent();
                        apiError = error_2;
                        this.setData({ errorMessage: (apiError === null || apiError === void 0 ? void 0 : apiError.message) || '加载题单失败，请稍后重试。' });
                        return [3 /*break*/, 11];
                    case 10:
                        this.setData({ loadingSets: false, setFormErrorMessage: '', questionFormErrorMessage: '' });
                        return [7 /*endfinally*/];
                    case 11: return [2 /*return*/];
                }
            });
        });
    },
    loadQuestions: function (setId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, questions, error_3, apiError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.setData({ loadingQuestions: true, errorMessage: '', successMessage: '' });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, (0, api_1.apiRequest)({
                                path: "/practice/sets/".concat(setId, "/questions"),
                            })];
                    case 2:
                        response = _a.sent();
                        questions = Array.isArray(response.questions)
                            ? response.questions.map(function (question) { return mapQuestion(question, setId); })
                            : [];
                        this.setData({ visibleQuestions: questions });
                        return [3 /*break*/, 5];
                    case 3:
                        error_3 = _a.sent();
                        apiError = error_3;
                        this.setData({ errorMessage: (apiError === null || apiError === void 0 ? void 0 : apiError.message) || '加载题目失败，请稍后重试。' });
                        this.setData({ visibleQuestions: [] });
                        return [3 /*break*/, 5];
                    case 4:
                        this.setData({ loadingQuestions: false, questionFormErrorMessage: '' });
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    },
    selectSet: function (event) {
        var _a, _b;
        var id = (_b = (_a = event.currentTarget) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b.id;
        if (!id || id === this.data.selectedSetId) {
            return;
        }
        this.setData({
            selectedSetId: id,
            visibleQuestions: [],
            questionFormVisible: false,
            questionForm: createQuestionForm(),
            questionFormErrorMessage: '',
        });
        void this.loadQuestions(id);
    },
    handleSetInput: function (event) {
        var _a;
        var _b, _c, _d;
        var field = (_c = (_b = event.currentTarget) === null || _b === void 0 ? void 0 : _b.dataset) === null || _c === void 0 ? void 0 : _c.field;
        if (!field) {
            return;
        }
        var value = (_d = event.detail.value) !== null && _d !== void 0 ? _d : '';
        this.setData({
            setForm: __assign(__assign({}, this.data.setForm), (_a = {}, _a[field] = value, _a)),
            errorMessage: '',
            successMessage: '',
            setFormErrorMessage: '',
        });
    },
    handleQuestionInput: function (event) {
        var _a;
        var _b, _c, _d;
        var field = (_c = (_b = event.currentTarget) === null || _b === void 0 ? void 0 : _b.dataset) === null || _c === void 0 ? void 0 : _c.field;
        if (!field) {
            return;
        }
        var value = (_d = event.detail.value) !== null && _d !== void 0 ? _d : '';
        this.setData({
            questionForm: __assign(__assign({}, this.data.questionForm), (_a = {}, _a[field] = value, _a)),
            errorMessage: '',
            successMessage: '',
            questionFormErrorMessage: '',
        });
    },
    toggleSetForm: function () {
        var nextVisible = !this.data.setFormVisible;
        if (!nextVisible && this.data.submittingSet) {
            return;
        }
        if (nextVisible) {
            this.setData({ setFormVisible: true, setFormErrorMessage: '', successMessage: '' });
            return;
        }
        this.setData({ setFormVisible: false, setForm: createSetForm(), setFormErrorMessage: '' });
    },
    cancelSetForm: function () {
        if (this.data.submittingSet) {
            return;
        }
        this.setData({
            setFormVisible: false,
            setForm: createSetForm(),
            setFormErrorMessage: '',
            successMessage: '',
        });
    },
    toggleQuestionForm: function () {
        if (!this.data.selectedSetId) {
            this.setData({ questionFormErrorMessage: '请先选择题单' });
            return;
        }
        var nextVisible = !this.data.questionFormVisible;
        if (!nextVisible && this.data.submittingQuestion) {
            return;
        }
        if (nextVisible) {
            this.setData({ questionFormVisible: true, questionFormErrorMessage: '', successMessage: '' });
            return;
        }
        this.setData({ questionFormVisible: false, questionForm: createQuestionForm(), questionFormErrorMessage: '' });
    },
    cancelQuestionForm: function () {
        if (this.data.submittingQuestion) {
            return;
        }
        this.setData({
            questionFormVisible: false,
            questionForm: createQuestionForm(),
            questionFormErrorMessage: '',
            successMessage: '',
        });
    },
    createSet: function () {
        return __awaiter(this, void 0, void 0, function () {
            var form, tags, error_4, apiError, message;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        form = this.data.setForm;
                        if (!form.title || !form.title.trim()) {
                            this.setData({ setFormErrorMessage: '请输入题单名称' });
                            return [2 /*return*/];
                        }
                        tags = form.tags
                            .split(/[,，\s]+/)
                            .map(function (tag) { return tag.trim(); })
                            .filter(Boolean);
                        this.setData({
                            submittingSet: true,
                            errorMessage: '',
                            successMessage: '',
                            setFormErrorMessage: '',
                        });
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, 5, 6]);
                        return [4 /*yield*/, (0, api_1.apiRequest)({
                                path: '/practice/sets',
                                method: 'POST',
                                data: {
                                    title: form.title.trim(),
                                    description: ((_a = form.description) === null || _a === void 0 ? void 0 : _a.trim()) || null,
                                    difficulty: toApiDifficulty(form.difficulty),
                                    tags: tags,
                                },
                            })];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, this.loadSets()];
                    case 3:
                        _b.sent();
                        this.setData({
                            setForm: createSetForm(),
                            successMessage: '题单创建成功，请继续添加题目。',
                            setFormVisible: false,
                            setFormErrorMessage: '',
                        });
                        return [3 /*break*/, 6];
                    case 4:
                        error_4 = _b.sent();
                        apiError = error_4;
                        message = (apiError === null || apiError === void 0 ? void 0 : apiError.message) || '创建题单失败，请稍后重试。';
                        this.setData({ errorMessage: message, setFormErrorMessage: message });
                        return [3 /*break*/, 6];
                    case 5:
                        this.setData({ submittingSet: false });
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    },
    createQuestion: function () {
        return __awaiter(this, void 0, void 0, function () {
            var form, setId, tags, error_5, apiError, message;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        form = this.data.questionForm;
                        setId = this.data.selectedSetId;
                        if (!setId) {
                            this.setData({ questionFormErrorMessage: '请先选择题单' });
                            return [2 /*return*/];
                        }
                        if (!form.questionText || !form.questionText.trim()) {
                            this.setData({ questionFormErrorMessage: '请输入题干内容' });
                            return [2 /*return*/];
                        }
                        tags = form.tags
                            .split(/[,，\s]+/)
                            .map(function (tag) { return tag.trim(); })
                            .filter(Boolean);
                        this.setData({
                            submittingQuestion: true,
                            errorMessage: '',
                            successMessage: '',
                            questionFormErrorMessage: '',
                        });
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 4, 5, 6]);
                        return [4 /*yield*/, (0, api_1.apiRequest)({
                                path: "/practice/sets/".concat(setId, "/questions"),
                                method: 'POST',
                                data: {
                                    questionText: form.questionText.trim(),
                                    answerText: ((_a = form.answerText) === null || _a === void 0 ? void 0 : _a.trim()) || null,
                                    explanation: ((_b = form.explanation) === null || _b === void 0 ? void 0 : _b.trim()) || null,
                                    tags: tags,
                                    difficulty: toApiDifficulty(form.difficulty),
                                },
                            })];
                    case 2:
                        _c.sent();
                        return [4 /*yield*/, this.loadQuestions(setId)];
                    case 3:
                        _c.sent();
                        this.setData({
                            questionForm: createQuestionForm(),
                            successMessage: '题目已录入。',
                            questionFormVisible: false,
                            questionFormErrorMessage: '',
                        });
                        return [3 /*break*/, 6];
                    case 4:
                        error_5 = _c.sent();
                        apiError = error_5;
                        message = (apiError === null || apiError === void 0 ? void 0 : apiError.message) || '保存题目失败，请稍后重试。';
                        this.setData({ errorMessage: message, questionFormErrorMessage: message });
                        return [3 /*break*/, 6];
                    case 5:
                        this.setData({ submittingQuestion: false });
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    },
});
