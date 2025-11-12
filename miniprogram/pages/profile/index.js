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
var session_1 = require("../../utils/session");
var createEmptyProfile = function () { return ({
    id: '',
    role: 'student',
    name: '',
    email: '',
    phone: '',
    organization: '',
    goal: '',
    majorId: '',
    bio: '',
    avatar: '',
}); };
var createLoginForm = function () { return ({
    username: '',
    password: '',
}); };
var demoAccounts = [
    {
        key: 'student',
        label: '普通学生体验账号',
        username: 'student',
        password: 'study2025',
        description: '体验学习首页、刷题、课程与日程等全部学生功能。',
    },
    {
        key: 'admin',
        label: '教研管理员体验账号',
        username: 'admin',
        password: 'admin123',
        description: '可访问后台管理面板，演示课程、题库与论坛审核流程。',
    },
];
var resolveMajorName = function (majorId, majors) { var _a, _b; return (_b = (_a = majors.find(function (major) { return major.id === majorId; })) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : '请选择'; };
var mapProfile = function (profile) { return ({
    id: profile.id != null ? String(profile.id) : '',
    role: (profile.role === 'admin' ? 'admin' : 'student'),
    name: typeof profile.name === 'string' ? profile.name : '未命名用户',
    email: (typeof profile.email === 'string' && profile.email) || '',
    phone: (typeof profile.phone === 'string' && profile.phone) || '',
    organization: (typeof profile.organization === 'string' && profile.organization) || '',
    goal: (typeof profile.goal === 'string' && profile.goal) || '',
    majorId: profile.majorId != null ? String(profile.majorId) : '',
    bio: (typeof profile.bio === 'string' && profile.bio) || '',
    avatar: (typeof profile.avatar === 'string' && profile.avatar) || '',
}); };
Page({
    data: {
        profile: createEmptyProfile(),
        majors: [],
        selectedMajorName: '请选择',
        sessionUser: null,
        loginForm: createLoginForm(),
        demoAccounts: demoAccounts,
        selectedDemoKey: '',
        errorMessage: '',
        successMessage: '',
        loading: false,
        saving: false,
        loggingIn: false,
    },
    onShow: function () {
        void this.loadProfile();
    },
    loadProfile: function () {
        return __awaiter(this, void 0, void 0, function () {
            var app, session, error_1, apiError, _a, majors, profile, error_2, apiError;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        this.setData({ loading: true, errorMessage: '', successMessage: '' });
                        app = getApp();
                        session = (_c = (_b = app === null || app === void 0 ? void 0 : app.globalData) === null || _b === void 0 ? void 0 : _b.sessionUser) !== null && _c !== void 0 ? _c : null;
                        if (!session) {
                            session = (0, session_1.getStoredSession)();
                            if (session && (app === null || app === void 0 ? void 0 : app.setSessionUser)) {
                                app.setSessionUser(session);
                            }
                        }
                        if (!session) {
                            this.setData({ loading: false, sessionUser: null });
                            return [2 /*return*/];
                        }
                        this.setData({ sessionUser: session });
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, session_1.ensureSession)()];
                    case 2:
                        session = _d.sent();
                        if (app === null || app === void 0 ? void 0 : app.setSessionUser) {
                            app.setSessionUser(session);
                        }
                        this.setData({ sessionUser: session });
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _d.sent();
                        apiError = error_1;
                        if ((apiError === null || apiError === void 0 ? void 0 : apiError.statusCode) === 401) {
                            this.setData({ loading: false, sessionUser: null });
                            return [2 /*return*/];
                        }
                        this.setData({ loading: false, errorMessage: (apiError === null || apiError === void 0 ? void 0 : apiError.message) || '无法校验登录状态，请稍后重试。' });
                        return [2 /*return*/];
                    case 4:
                        _d.trys.push([4, 6, 7, 8]);
                        return [4 /*yield*/, Promise.all([
                                this.fetchMajors(),
                                this.fetchProfile(session.id),
                            ])];
                    case 5:
                        _a = _d.sent(), majors = _a[0], profile = _a[1];
                        this.setData({
                            majors: majors,
                            profile: profile,
                            selectedMajorName: resolveMajorName(profile.majorId, majors),
                        });
                        return [3 /*break*/, 8];
                    case 6:
                        error_2 = _d.sent();
                        apiError = error_2;
                        this.setData({ errorMessage: (apiError === null || apiError === void 0 ? void 0 : apiError.message) || '加载个人资料失败，请稍后重试。' });
                        return [3 /*break*/, 8];
                    case 7:
                        this.setData({ loading: false });
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        });
    },
    fetchMajors: function () {
        return __awaiter(this, void 0, void 0, function () {
            var majors, error_3;
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
                        console.warn('加载专业列表失败', error_3);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    fetchProfile: function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, api_1.apiRequest)({ path: "/users/".concat(userId) })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, mapProfile(response)];
                }
            });
        });
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
            profile: __assign(__assign({}, this.data.profile), (_a = {}, _a[field] = value, _a)),
            errorMessage: '',
            successMessage: '',
        });
    },
    handleMajorChange: function (event) {
        var _a, _b, _c;
        var index = Number((_a = event.detail.value) !== null && _a !== void 0 ? _a : 0);
        var majorId = (_c = (_b = this.data.majors[index]) === null || _b === void 0 ? void 0 : _b.id) !== null && _c !== void 0 ? _c : '';
        this.setData({
            profile: __assign(__assign({}, this.data.profile), { majorId: majorId }),
            selectedMajorName: resolveMajorName(majorId, this.data.majors),
            errorMessage: '',
            successMessage: '',
        });
    },
    handleLoginInput: function (event) {
        var _a;
        var _b, _c, _d;
        var field = (_c = (_b = event.currentTarget) === null || _b === void 0 ? void 0 : _b.dataset) === null || _c === void 0 ? void 0 : _c.field;
        if (!field) {
            return;
        }
        var value = (_d = event.detail.value) !== null && _d !== void 0 ? _d : '';
        this.setData({
            loginForm: __assign(__assign({}, this.data.loginForm), (_a = {}, _a[field] = value, _a)),
            selectedDemoKey: '',
            errorMessage: '',
            successMessage: '',
        });
    },
    useDemoAccount: function (event) {
        var _a;
        var dataset = (_a = event.currentTarget) === null || _a === void 0 ? void 0 : _a.dataset;
        var username = typeof (dataset === null || dataset === void 0 ? void 0 : dataset.username) === 'string' ? dataset.username : '';
        var password = typeof (dataset === null || dataset === void 0 ? void 0 : dataset.password) === 'string' ? dataset.password : '';
        var key = typeof (dataset === null || dataset === void 0 ? void 0 : dataset.key) === 'string' ? dataset.key : '';
        if (!username || !password || !key) {
            return;
        }
        this.setData({
            loginForm: { username: username, password: password },
            selectedDemoKey: key,
            errorMessage: '',
            successMessage: '',
        });
        wx.showToast({ title: '已填充体验账号', icon: 'none' });
    },
    submitLogin: function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, username, password, session, app, error_4, apiError;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.data.loginForm, username = _a.username, password = _a.password;
                        if (!username || !password) {
                            this.setData({ errorMessage: '请输入用户名和密码' });
                            return [2 /*return*/];
                        }
                        this.setData({ loggingIn: true, errorMessage: '', successMessage: '' });
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, 5, 6]);
                        return [4 /*yield*/, (0, session_1.login)(username.trim(), password)];
                    case 2:
                        session = _b.sent();
                        app = getApp();
                        if (app === null || app === void 0 ? void 0 : app.setSessionUser) {
                            app.setSessionUser(session);
                        }
                        this.setData({ sessionUser: session, loginForm: createLoginForm(), selectedDemoKey: '' });
                        return [4 /*yield*/, this.loadProfile()];
                    case 3:
                        _b.sent();
                        this.setData({ successMessage: '登录成功。' });
                        wx.showToast({ title: '登录成功', icon: 'success' });
                        return [3 /*break*/, 6];
                    case 4:
                        error_4 = _b.sent();
                        apiError = error_4;
                        this.setData({ errorMessage: (apiError === null || apiError === void 0 ? void 0 : apiError.message) || '登录失败，请稍后重试。' });
                        return [3 /*break*/, 6];
                    case 5:
                        this.setData({ loggingIn: false });
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    },
    handleRegisterTap: function () {
        wx.navigateTo({ url: '/pages/intro/index' });
    },
    logoutUser: function () {
        return __awaiter(this, void 0, void 0, function () {
            var app, error_5, apiError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.setData({ loading: true, errorMessage: '', successMessage: '' });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, (0, session_1.logout)()];
                    case 2:
                        _a.sent();
                        app = getApp();
                        if (app === null || app === void 0 ? void 0 : app.setSessionUser) {
                            app.setSessionUser(null);
                        }
                        this.setData({
                            sessionUser: null,
                            profile: createEmptyProfile(),
                            majors: [],
                            selectedMajorName: '请选择',
                            selectedDemoKey: '',
                            successMessage: '已退出登录。',
                        });
                        return [3 /*break*/, 5];
                    case 3:
                        error_5 = _a.sent();
                        apiError = error_5;
                        this.setData({ errorMessage: (apiError === null || apiError === void 0 ? void 0 : apiError.message) || '退出登录失败，请稍后重试。' });
                        return [3 /*break*/, 5];
                    case 4:
                        this.setData({ loading: false });
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    },
    saveProfile: function () {
        return __awaiter(this, void 0, void 0, function () {
            var profile, payload, updated, error_6, apiError, message;
            var _a, _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        profile = this.data.profile;
                        if (!profile.name || !profile.name.trim()) {
                            this.setData({ errorMessage: '请填写姓名' });
                            return [2 /*return*/];
                        }
                        payload = {
                            name: profile.name.trim(),
                            email: ((_a = profile.email) === null || _a === void 0 ? void 0 : _a.trim()) || null,
                            phone: ((_b = profile.phone) === null || _b === void 0 ? void 0 : _b.trim()) || null,
                            organization: ((_c = profile.organization) === null || _c === void 0 ? void 0 : _c.trim()) || null,
                            goal: ((_d = profile.goal) === null || _d === void 0 ? void 0 : _d.trim()) || null,
                            bio: ((_e = profile.bio) === null || _e === void 0 ? void 0 : _e.trim()) || null,
                            majorId: profile.majorId || null,
                        };
                        this.setData({ saving: true, errorMessage: '', successMessage: '' });
                        _f.label = 1;
                    case 1:
                        _f.trys.push([1, 5, 6, 7]);
                        return [4 /*yield*/, (0, session_1.ensureSession)()];
                    case 2:
                        _f.sent();
                        return [4 /*yield*/, (0, api_1.apiRequest)({
                                path: "/users/".concat(profile.id),
                                method: 'PATCH',
                                data: payload,
                            })];
                    case 3:
                        _f.sent();
                        return [4 /*yield*/, this.fetchProfile(profile.id)];
                    case 4:
                        updated = _f.sent();
                        this.setData({
                            profile: updated,
                            selectedMajorName: resolveMajorName(updated.majorId, this.data.majors),
                            successMessage: '资料已更新。',
                        });
                        return [3 /*break*/, 7];
                    case 5:
                        error_6 = _f.sent();
                        apiError = error_6;
                        message = (apiError === null || apiError === void 0 ? void 0 : apiError.statusCode) === 401
                            ? '请先登录后再保存资料。'
                            : (apiError === null || apiError === void 0 ? void 0 : apiError.message) || '保存资料失败，请稍后重试。';
                        this.setData({ errorMessage: message });
                        return [3 /*break*/, 7];
                    case 6:
                        this.setData({ saving: false });
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        });
    },
    navigateToAdmin: function () {
        wx.navigateTo({ url: '/pages/admin/index' }).catch(function (error) {
            console.warn('进入后台管理失败', error);
            wx.showToast({ title: '无法打开后台管理', icon: 'none' });
        });
    },
});
