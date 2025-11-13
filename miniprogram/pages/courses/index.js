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
    var _ = { label: 0, sent: function () { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
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
        }
        catch (e) { op = [6, e]; y = 0; }
        finally { f = t = 0; }
        if (op[0] & 5) throw op[1];
        return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var courses_1 = require("../../data/courses");
var api_1 = require("../../utils/api");
var session_1 = require("../../utils/session");
var mathSubjectOptions = ['数学一', '数学二', '数学三', '不考数学'];
var englishSubjectOptions = ['英语一', '英语二', '不考英语'];
var createEmptyForm = function (majors) {
    if (majors === void 0) { majors = []; }
    var defaultMajorId = (majors[0] && majors[0].id) || '';
    return {
        title: '',
        teacher: '',
        category: '公共课',
        progress: 0,
        nextTask: '',
        description: '',
        majorId: defaultMajorId,
        tagsInput: '',
        mathSubjects: [],
        englishSubjects: [],
        visibleMajorIds: defaultMajorId ? [defaultMajorId] : [],
    };
};
var resolveMajorName = function (majorId, majors) {
    var match = majors.find(function (major) { return major.id === majorId; });
    return (match === null || match === void 0 ? void 0 : match.name) || '请选择';
};
var normalizeList = function (values) {
    if (Array.isArray(values)) {
        return Array.from(new Set(values
            .map(function (value) { return String(value !== null && value !== void 0 ? value : '').trim(); })
            .filter(function (value) { return value.length > 0; })));
    }
    if (typeof values === 'string') {
        return values
            .split(/[，,]/)
            .map(function (value) { return value.trim(); })
            .filter(function (value) { return value.length > 0; });
    }
    return [];
};
var normalizeCourse = function (course) {
    var suitability = course.suitability;
    return Object.assign(Object.assign({}, course), { tags: Array.isArray(course.tags) ? course.tags : [], suitability: suitability
            ? {
                mathSubjects: normalizeList(suitability.mathSubjects),
                englishSubjects: normalizeList(suitability.englishSubjects),
                majors: normalizeList(suitability.majors),
                majorIds: normalizeList(suitability.majorIds),
                scoreMin: suitability.scoreMin !== null && suitability.scoreMin !== void 0 ? suitability.scoreMin : undefined,
                scoreMax: suitability.scoreMax !== null && suitability.scoreMax !== void 0 ? suitability.scoreMax : undefined,
            }
            : undefined });
};
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
        mathSubjectOptions: mathSubjectOptions,
        englishSubjectOptions: englishSubjectOptions,
    },
    onShow: function () {
        void this.loadPage();
    },
    loadPage: function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c, coursesResponse, majorsResponse, majors, currentForm, form, selectedMajorName, error_1, apiError, message;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        this.setData({
                            loading: true,
                            errorMessage: '',
                            successMessage: '',
                            formErrorMessage: '',
                        });
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, session_1.ensureSession)()];
                    case 2:
                        _d.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _d.sent();
                        apiError = error_1;
                        message = (apiError === null || apiError === void 0 ? void 0 : apiError.statusCode) === 401
                            ? '请先登录后再访问课程体系，可在个人中心输入账号密码。'
                            : (apiError === null || apiError === void 0 ? void 0 : apiError.message) || '无法校验登录状态，请稍后重试。';
                        this.setData({ loading: false, errorMessage: message });
                        return [2 /*return*/];
                    case 4:
                        _d.trys.push([4, 7, , 8]);
                        return [4 /*yield*/, Promise.all([this.fetchCourses(), this.fetchMajors()])];
                    case 5:
                        _a = _d.sent(), coursesResponse = _a[0], majorsResponse = _a[1];
                        majors = majorsResponse.length > 0 ? majorsResponse : this.data.majors;
                        currentForm = this.data.form;
                        form = currentForm.majorId ? Object.assign({}, currentForm) : createEmptyForm(majors);
                        if (!form.visibleMajorIds || form.visibleMajorIds.length === 0) {
                            form.visibleMajorIds = form.majorId ? [form.majorId] : [];
                        }
                        selectedMajorName = resolveMajorName(form.majorId, majors);
                        this.setData({
                            courses: coursesResponse.map(normalizeCourse),
                            majors: majors,
                            form: form,
                            selectedMajorName: selectedMajorName,
                        });
                        return [3 /*break*/, 8];
                    case 6:
                        _b = _d.sent();
                        apiError = _b;
                        message = (apiError === null || apiError === void 0 ? void 0 : apiError.message) || '加载课程数据失败，请稍后重试。';
                        this.setData({ errorMessage: message });
                        return [3 /*break*/, 8];
                    case 7:
                        _c = _d.sent();
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
                        if (!Array.isArray(response.courses)) {
                            return [2 /*return*/, []];
                        }
                        return [2 /*return*/, response.courses.map(normalizeCourse)];
                }
            });
        });
    },
    fetchMajors: function () {
        return __awaiter(this, void 0, void 0, function () {
            var majors, error_2, apiError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, api_1.apiRequest)({ path: '/majors' })];
                    case 1:
                        majors = _a.sent();
                        return [2 /*return*/, majors
                                .map(function (major) {
                                var description = major === null || major === void 0 ? void 0 : major.description;
                                return ({
                                    id: major.id != null ? String(major.id) : '',
                                    name: major.name || '未命名专业',
                                    description: description != null ? description : null,
                                });
                            })
                                .filter(function (major) { return major.id; })];
                    case 2:
                        error_2 = _a.sent();
                        apiError = error_2;
                        console.warn('加载专业列表失败，将使用现有选项', (apiError === null || apiError === void 0 ? void 0 : apiError.message) || error_2);
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
        var field = (event === null || event === void 0 ? void 0 : event.currentTarget) && event.currentTarget.dataset
            ? event.currentTarget.dataset.field
            : undefined;
        if (!field) {
            return;
        }
        var value = event.detail.value;
        var nextValue = field === 'progress' ? Number(value) : value;
        this.setData({
            form: Object.assign(Object.assign({}, this.data.form), (_a = {}, _a[field] = nextValue, _a)),
            errorMessage: '',
            successMessage: '',
            formErrorMessage: '',
        });
        var _a;
    },
    handleMajorChange: function (event) {
        var _a, _b;
        var rawValue = (_a = event.detail) === null || _a === void 0 ? void 0 : _a.value;
        var index = Number(rawValue != null ? rawValue : 0);
        var candidateMajor = (_b = this.data.majors[index]) === null || _b === void 0 ? void 0 : _b.id;
        var nextMajor = candidateMajor != null ? candidateMajor : '';
        var visibleMajorIds = this.data.form.visibleMajorIds.includes(nextMajor)
            ? this.data.form.visibleMajorIds
            : nextMajor
                ? Array.from(new Set(this.data.form.visibleMajorIds.concat([nextMajor])))
                : this.data.form.visibleMajorIds;
        this.setData({
            form: Object.assign(Object.assign({}, this.data.form), { majorId: nextMajor, visibleMajorIds: visibleMajorIds }),
            selectedMajorName: resolveMajorName(nextMajor, this.data.majors),
            errorMessage: '',
            successMessage: '',
            formErrorMessage: '',
        });
    },
    handleCheckboxChange: function (event) {
        var field = (event === null || event === void 0 ? void 0 : event.currentTarget) && event.currentTarget.dataset
            ? event.currentTarget.dataset.field
            : undefined;
        if (!field) {
            return;
        }
        var values = Array.isArray(event.detail === null || event.detail === void 0 ? void 0 : event.detail.value) ? event.detail.value : [];
        this.setData({
            form: Object.assign(Object.assign({}, this.data.form), (_a = {}, _a[field] = values, _a)),
            errorMessage: '',
            successMessage: '',
            formErrorMessage: '',
        });
        var _a;
    },
    submitCourse: function () {
        var _this = this;
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var form, normalizedProgress, tags, mathSubjects, englishSubjects, visibleMajorIdsRaw, includeOthers, visibleMajorIds, visibleMajorNames, error_3, apiError, message, refreshed, nextForm;
            return __generator(this, function (_c) {
                switch (_c.label) {
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
                        tags = normalizeList(form.tagsInput);
                        mathSubjects = normalizeList(form.mathSubjects);
                        englishSubjects = normalizeList(form.englishSubjects);
                        visibleMajorIdsRaw = normalizeList(form.visibleMajorIds);
                        includeOthers = visibleMajorIdsRaw.includes('__other__');
                        visibleMajorIds = visibleMajorIdsRaw.filter(function (value) { return value !== '__other__'; });
                        visibleMajorNames = visibleMajorIds
                            .map(function (id) { return resolveMajorName(id, _this.data.majors); })
                            .filter(function (name) { return name && name !== '请选择'; });
                        if (includeOthers && !visibleMajorNames.includes('其他专业')) {
                            visibleMajorNames.push('其他专业');
                        }
                        this.setData({ submitting: true, errorMessage: '', successMessage: '', formErrorMessage: '' });
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, (0, api_1.apiRequest)({
                                path: '/learning/courses',
                                method: 'POST',
                                data: {
                                    title: form.title.trim(),
                                    teacher: ((_a = form.teacher) === null || _a === void 0 ? void 0 : _a.trim()) || '待定讲师',
                                    category: ((_b = form.category) === null || _b === void 0 ? void 0 : _b.trim()) || '公共课',
                                    progress: normalizedProgress,
                                    nextTask: (form.nextTask && form.nextTask.trim()) || null,
                                    description: (form.description && form.description.trim()) || null,
                                    majorId: form.majorId,
                                    tags: tags.length > 0 ? tags : undefined,
                                    mathSubjects: mathSubjects.length > 0 ? mathSubjects : undefined,
                                    englishSubjects: englishSubjects.length > 0 ? englishSubjects : undefined,
                                    visibleMajorIds: visibleMajorIds.length > 0 ? visibleMajorIds : undefined,
                                    visibleMajorNames: visibleMajorNames.length > 0 ? visibleMajorNames : undefined,
                                },
                            })];
                    case 2:
                        _c.sent();
                        return [4 /*yield*/, this.fetchCourses()];
                    case 3:
                        refreshed = _c.sent();
                        nextForm = createEmptyForm(this.data.majors);
                        this.setData({
                            courses: refreshed.map(normalizeCourse),
                            form: nextForm,
                            selectedMajorName: resolveMajorName(nextForm.majorId, this.data.majors),
                            successMessage: '课程已保存，可在列表顶部查看。',
                            formVisible: false,
                            formErrorMessage: '',
                        });
                        return [3 /*break*/, 6];
                    case 4:
                        error_3 = _c.sent();
                        apiError = error_3;
                        message = (apiError === null || apiError === void 0 ? void 0 : apiError.message) || '保存课程失败，请稍后重试。';
                        this.setData({ formErrorMessage: message, errorMessage: message });
                        return [3 /*break*/, 6];
                    case 5:
                        return [7 /*endfinally*/];
                    case 6:
                        this.setData({ submitting: false });
                        return [2 /*return*/];
                }
            });
        });
    },
});
