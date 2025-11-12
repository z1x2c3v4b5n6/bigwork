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
var courses_1 = require("../../data/courses");
var api_1 = require("../../utils/api");
var session_1 = require("../../utils/session");
var createEmptyForm = function (majors) {
    var _a, _b;
    if (majors === void 0) { majors = []; }
    return ({
        title: '',
        teacher: '',
        category: '公共课',
        progress: 0,
        nextTask: '',
        description: '',
        majorId: (_b = (_a = majors[0]) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : '',
    });
};
var resolveMajorName = function (majorId, majors) { var _a, _b; return (_b = (_a = majors.find(function (major) { return major.id === majorId; })) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : '请选择'; };
Page({
    data: {
        courses: [],
        form: createEmptyForm(),
        majors: [],
        workshops: courses_1.boutiqueWorkshops,
        errorMessage: '',
        successMessage: '',
        loading: false,
        submitting: false,
        selectedMajorName: '请选择',
        formVisible: false,
        formErrorMessage: '',
    },
    onShow: function () {
        void this.loadPage();
    },
    loadPage: function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1, apiError, message, _a, coursesResponse, majorsResponse, majors, form, selectedMajorName, error_2, apiError, message;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.setData({ loading: true, errorMessage: '', successMessage: '', formErrorMessage: '' });
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, session_1.ensureSession)()];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _b.sent();
                        apiError = error_1;
                        message = (apiError === null || apiError === void 0 ? void 0 : apiError.statusCode) === 401
                            ? '请先登录后再访问课程体系，可在个人中心输入账号密码。'
                            : (apiError === null || apiError === void 0 ? void 0 : apiError.message) || '无法校验登录状态，请稍后重试。';
                        this.setData({ loading: false, errorMessage: message });
                        return [2 /*return*/];
                    case 4:
                        _b.trys.push([4, 6, 7, 8]);
                        return [4 /*yield*/, Promise.all([
                                this.fetchCourses(),
                                this.fetchMajors(),
                            ])];
                    case 5:
                        _a = _b.sent(), coursesResponse = _a[0], majorsResponse = _a[1];
                        majors = majorsResponse.length > 0 ? majorsResponse : this.data.majors;
                        form = this.data.form.majorId
                            ? this.data.form
                            : createEmptyForm(majors);
                        selectedMajorName = resolveMajorName(form.majorId, majors);
                        this.setData({
                            courses: coursesResponse,
                            majors: majors,
                            form: form,
                            selectedMajorName: selectedMajorName,
                        });
                        return [3 /*break*/, 8];
                    case 6:
                        error_2 = _b.sent();
                        apiError = error_2;
                        message = (apiError === null || apiError === void 0 ? void 0 : apiError.message) || '加载课程数据失败，请稍后重试。';
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
    fetchCourses: function () {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, api_1.apiRequest)({
                            path: '/learning/courses',
                        })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, Array.isArray(response.courses) ? response.courses : []];
                }
            });
        });
    },
    fetchMajors: function () {
        return __awaiter(this, void 0, void 0, function () {
            var majors, error_3, apiError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, api_1.apiRequest)({ path: '/majors' })];
                    case 1:
                        majors = _a.sent();
                        return [2 /*return*/, majors
                                .map(function (major) {
                                var _a;
                                return ({
                                    id: major.id != null ? String(major.id) : '',
                                    name: major.name || '未命名专业',
                                    description: (_a = major.description) !== null && _a !== void 0 ? _a : null,
                                });
                            })
                                .filter(function (major) { return major.id; })];
                    case 2:
                        error_3 = _a.sent();
                        apiError = error_3;
                        console.warn('加载专业列表失败，将使用现有选项', (apiError === null || apiError === void 0 ? void 0 : apiError.message) || error_3);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
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
        var nextForm = createEmptyForm(this.data.majors);
        this.setData({
            formVisible: false,
            form: nextForm,
            selectedMajorName: resolveMajorName(nextForm.majorId, this.data.majors),
            formErrorMessage: '',
        });
    },
    cancelForm: function () {
        if (this.data.submitting) {
            return;
        }
        var nextForm = createEmptyForm(this.data.majors);
        this.setData({
            formVisible: false,
            form: nextForm,
            selectedMajorName: resolveMajorName(nextForm.majorId, this.data.majors),
            formErrorMessage: '',
            successMessage: '',
        });
    },
    handleInput: function (event) {
        var _a;
        var _b, _c;
        var field = (_c = (_b = event.currentTarget) === null || _b === void 0 ? void 0 : _b.dataset) === null || _c === void 0 ? void 0 : _c.field;
        if (!field) {
            return;
        }
        var value = event.detail.value;
        var key = field;
        var nextValue = key === 'progress' ? Number(value) : value;
        this.setData({
            form: __assign(__assign({}, this.data.form), (_a = {}, _a[key] = nextValue, _a)),
            errorMessage: '',
            successMessage: '',
            formErrorMessage: '',
        });
    },
    handleMajorChange: function (event) {
        var _a, _b, _c;
        var index = Number((_a = event.detail.value) !== null && _a !== void 0 ? _a : 0);
        var nextMajor = (_c = (_b = this.data.majors[index]) === null || _b === void 0 ? void 0 : _b.id) !== null && _c !== void 0 ? _c : '';
        this.setData({
            form: __assign(__assign({}, this.data.form), { majorId: nextMajor }),
            selectedMajorName: resolveMajorName(nextMajor, this.data.majors),
            errorMessage: '',
            successMessage: '',
            formErrorMessage: '',
        });
    },
    submitCourse: function () {
        return __awaiter(this, void 0, void 0, function () {
            var form, normalizedProgress, refreshed, nextForm, error_4, apiError, message;
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        form = this.data.form;
                        if (!form.title || !form.title.trim()) {
                            this.setData({ formErrorMessage: '请输入课程名称' });
                            return [2 /*return*/];
                        }
                        if (!form.majorId) {
                            this.setData({ formErrorMessage: '请选择所属专业' });
                            return [2 /*return*/];
                        }
                        normalizedProgress = Math.min(100, Math.max(0, Number(form.progress) || 0));
                        this.setData({ submitting: true, errorMessage: '', successMessage: '', formErrorMessage: '' });
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 4, 5, 6]);
                        return [4 /*yield*/, (0, api_1.apiRequest)({
                                path: '/learning/courses',
                                method: 'POST',
                                data: {
                                    title: form.title.trim(),
                                    teacher: ((_a = form.teacher) === null || _a === void 0 ? void 0 : _a.trim()) || '待定讲师',
                                    category: ((_b = form.category) === null || _b === void 0 ? void 0 : _b.trim()) || '公共课',
                                    progress: normalizedProgress,
                                    nextTask: ((_c = form.nextTask) === null || _c === void 0 ? void 0 : _c.trim()) || null,
                                    description: ((_d = form.description) === null || _d === void 0 ? void 0 : _d.trim()) || null,
                                    majorId: form.majorId,
                                },
                            })];
                    case 2:
                        _e.sent();
                        return [4 /*yield*/, this.fetchCourses()];
                    case 3:
                        refreshed = _e.sent();
                        nextForm = createEmptyForm(this.data.majors);
                        this.setData({
                            courses: refreshed,
                            form: nextForm,
                            selectedMajorName: resolveMajorName(nextForm.majorId, this.data.majors),
                            successMessage: '课程已保存，可在列表顶部查看。',
                            formVisible: false,
                            formErrorMessage: '',
                        });
                        return [3 /*break*/, 6];
                    case 4:
                        error_4 = _e.sent();
                        apiError = error_4;
                        message = (apiError === null || apiError === void 0 ? void 0 : apiError.message) || '保存课程失败，请稍后重试。';
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
