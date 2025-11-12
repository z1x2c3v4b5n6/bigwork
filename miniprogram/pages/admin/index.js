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
var admin_1 = require("../../data/admin");
var admin_2 = require("../../services/admin");
var session_1 = require("../../utils/session");
var tabs = [
    { id: 'overview', label: '总览' },
    { id: 'settings', label: '基本信息' },
    { id: 'users', label: '用户' },
    { id: 'majors', label: '专业' },
    { id: 'courses', label: '课程' },
    { id: 'materials', label: '资料' },
    { id: 'forum', label: '论坛' },
    { id: 'mobileToolkit', label: '掌上工具' },
    { id: 'statistics', label: '统计' },
];
var createUserForm = function () { return ({
    username: '',
    password: '',
    displayName: '',
    email: '',
    role: 'student',
}); };
var createMajorForm = function () { return ({ name: '', description: '' }); };
var createCourseForm = function (majors) {
    if (majors === void 0) { majors = []; }
    return ({
        title: '',
        teacher: '',
        credit: '',
        description: '',
        majorId: majors[0] ? String(majors[0].id) : '',
    });
};
var createMaterialForm = function (courses) {
    if (courses === void 0) { courses = []; }
    return ({
        title: '',
        description: '',
        fileUrl: '',
        courseId: courses[0] ? String(courses[0].id) : '',
    });
};
var createSettingsForm = function (settings) {
    var _a, _b, _c;
    if (settings === void 0) { settings = {}; }
    return ({
        platform_name: (_a = settings.platform_name) !== null && _a !== void 0 ? _a : '',
        support_email: (_b = settings.support_email) !== null && _b !== void 0 ? _b : '',
        security_note: (_c = settings.security_note) !== null && _c !== void 0 ? _c : '',
    });
};
var createFieldNoteForm = function () { return ({
    title: '',
    description: '',
    photos: [],
    locationName: '',
    latitude: null,
    longitude: null,
}); };
var getErrorMessage = function (error, fallback) {
    var _a;
    if (!error) {
        return fallback;
    }
    if (typeof error === 'string') {
        return error || fallback;
    }
    var apiError = error;
    if (apiError === null || apiError === void 0 ? void 0 : apiError.message) {
        return apiError.message;
    }
    var maybeResponse = error.response;
    if ((_a = maybeResponse === null || maybeResponse === void 0 ? void 0 : maybeResponse.data) === null || _a === void 0 ? void 0 : _a.message) {
        return maybeResponse.data.message;
    }
    return fallback;
};
var FIELD_NOTES_STORAGE_KEY = 'adminFieldNotes';
var cloneMetricCards = function () { return admin_1.adminMetricsSeed.map(function (item) { return (__assign({}, item)); }); };
var cloneStudentProgress = function () {
    return admin_1.adminStudentProgressSeed.map(function (item) { return (__assign({}, item)); });
};
var cloneAuditLogs = function () {
    return admin_1.adminAuditLogSeed.map(function (item) { return ({
        id: item.id,
        title: item.title,
        description: item.description,
        actor: item.actor,
        created_at: item.createdAt,
    }); });
};
var cloneAdministrators = function () { return admin_1.adminAdministratorsSeed.slice(); };
var cloneUsers = function () {
    return admin_1.adminUsersSeed.map(function (item) { return ({
        id: item.id,
        username: item.username,
        displayName: item.displayName,
        role: item.role,
        email: item.email,
        created_at: item.createdAt,
    }); });
};
var cloneMajors = function () {
    return admin_1.adminMajorsSeed.map(function (item) { return ({
        id: item.id,
        name: item.name,
        description: item.description,
    }); });
};
var cloneCourses = function () {
    return admin_1.adminCoursesSeed.map(function (item) { return ({
        id: item.id,
        title: item.title,
        description: item.description,
        teacher: item.teacher,
        credit: item.credit,
        majorId: item.majorId,
        majorName: item.majorName,
        courseTitle: item.title,
    }); });
};
var cloneMaterials = function () {
    return admin_1.adminMaterialsSeed.map(function (item) { return ({
        id: item.id,
        title: item.title,
        description: item.description,
        fileUrl: item.fileUrl,
        courseId: item.courseId,
        courseTitle: item.courseTitle,
    }); });
};
var cloneForumTopics = function () {
    return admin_1.adminForumTopicsSeed.map(function (item) { return ({
        id: item.id,
        title: item.title,
        description: item.description,
        created_at: item.createdAt,
        updated_at: item.updatedAt,
    }); });
};
var cloneForumPosts = function (topicId) {
    var numericId = Number(topicId);
    var posts = admin_1.adminForumPostsSeed[numericId] || [];
    return posts.map(function (post) { return ({
        id: post.id,
        content: post.content,
        author: post.author,
        created_at: post.createdAt,
        updated_at: post.createdAt,
    }); });
};
var cloneStatistics = function () { return (__assign({}, admin_1.adminStatisticsSeed)); };
var buildToolkitInsights = function (metricsCards, fieldNotes) {
    var _a, _b, _c, _d;
    var pendingNotes = fieldNotes.filter(function (note) { return !note.resolved; }).length;
    var followUps = (_b = (_a = metricsCards.find(function (card) { return card.id === 'followUpsPending'; })) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : 0;
    var systemAlerts = (_d = (_c = metricsCards.find(function (card) { return card.id === 'systemAlerts'; })) === null || _c === void 0 ? void 0 : _c.value) !== null && _d !== void 0 ? _d : 0;
    var today = new Date();
    var todayLabel = "".concat(today.getMonth() + 1, "\u6708").concat(today.getDate(), "\u65E5");
    return [
        {
            id: 'fieldNotes',
            title: '巡课速记进度',
            description: pendingNotes > 0
                ? "\u8FD8\u6709 ".concat(pendingNotes, " \u6761\u5DE1\u8BFE\u901F\u8BB0\u5F85\u8DDF\u8FDB\uFF0C\u53EF\u76F4\u63A5\u5728\u638C\u4E0A\u5DE5\u5177\u4E2D\u66F4\u65B0\u72B6\u6001\u3002")
                : '所有巡课速记均已处理，保持巡课节奏，持续补充新的现场记录。',
        },
        {
            id: 'followUps',
            title: '待跟进提醒',
            description: followUps > 0
                ? "\u540E\u53F0\u5F85\u8DDF\u8FDB\u63D0\u9192 ".concat(followUps, " \u6761\uFF0C\u5EFA\u8BAE\u7ED3\u5408\u5DE1\u8BFE\u901F\u8BB0\u9010\u4E00\u56DE\u8BBF\u3002")
                : '暂无待跟进提醒，可利用移动端完成线下巡查与访谈记录。',
        },
        {
            id: 'systemHealth',
            title: '系统健康度',
            description: systemAlerts > 0
                ? "\u7CFB\u7EDF\u5F53\u524D\u5B58\u5728 ".concat(systemAlerts, " \u6761\u544A\u8B66\uFF0C\u5EFA\u8BAE\u5C3D\u5FEB\u767B\u5F55 Web \u540E\u53F0\u5904\u7406\u3002")
                : "\u7CFB\u7EDF\u8FD0\u884C\u6B63\u5E38\u3002".concat(todayLabel, " \u53EF\u5B89\u6392\u65B0\u7684\u76F4\u64AD\u6216\u8D44\u6599\u63A8\u9001\u8BA1\u5212\u3002"),
        },
        {
            id: 'dailySuggestion',
            title: "".concat(todayLabel, " \u638C\u4E0A\u5EFA\u8BAE"),
            description: '巡课时点击“新增巡课速记”，拍照、定位与记录反馈，一次完成数据沉淀。',
        },
    ];
};
var buildInitialAdminState = function () {
    var metricsCards = cloneMetricCards();
    var studentProgress = cloneStudentProgress();
    var auditLogs = cloneAuditLogs();
    var administrators = cloneAdministrators();
    var users = cloneUsers();
    var majors = cloneMajors();
    var majorsForCourses = majors.map(function (item) { return (__assign({}, item)); });
    var courses = cloneCourses();
    var coursesForMaterials = courses.map(function (item) { return (__assign({}, item)); });
    var materials = cloneMaterials();
    var statistics = cloneStatistics();
    var forumTopics = cloneForumTopics();
    var selectedTopicId = forumTopics.length > 0 ? String(forumTopics[0].id) : '';
    var forumPosts = selectedTopicId ? cloneForumPosts(selectedTopicId) : [];
    var settingsForm = createSettingsForm(__assign({}, admin_1.adminSettingsSeed));
    var courseForm = createCourseForm(majors);
    var materialForm = createMaterialForm(courses);
    var mobileFieldNotes = [];
    var mobileToolkitInsights = buildToolkitInsights(metricsCards, mobileFieldNotes);
    return {
        metricsCards: metricsCards,
        dashboardNote: admin_1.adminDashboardNote,
        studentProgress: studentProgress,
        auditLogs: auditLogs,
        administrators: administrators,
        users: users,
        majors: majors,
        majorsForCourses: majorsForCourses,
        courses: courses,
        coursesForMaterials: coursesForMaterials,
        materials: materials,
        statistics: statistics,
        forumTopics: forumTopics,
        forumPosts: forumPosts,
        selectedTopicId: selectedTopicId,
        settingsForm: settingsForm,
        courseForm: courseForm,
        materialForm: materialForm,
        mobileFieldNotes: mobileFieldNotes,
        mobileToolkitInsights: mobileToolkitInsights,
    };
};
var isUnauthorizedError = function (error) {
    var apiError = error;
    var statusCode = apiError === null || apiError === void 0 ? void 0 : apiError.statusCode;
    return statusCode === 401 || statusCode === 403;
};
var formatDateTime = function (input) {
    var date = input ? new Date(input) : new Date();
    if (Number.isNaN(date.getTime())) {
        return '刚刚';
    }
    var year = date.getFullYear();
    var month = "".concat(date.getMonth() + 1).padStart(2, '0');
    var day = "".concat(date.getDate()).padStart(2, '0');
    var hours = "".concat(date.getHours()).padStart(2, '0');
    var minutes = "".concat(date.getMinutes()).padStart(2, '0');
    return "".concat(year, "-").concat(month, "-").concat(day, " ").concat(hours, ":").concat(minutes);
};
var normalizeStoredFieldNotes = function (value) {
    if (!Array.isArray(value)) {
        return [];
    }
    return value
        .map(function (entry) {
        if (!entry || typeof entry !== 'object') {
            return null;
        }
        var raw = entry;
        var id = raw.id ? String(raw.id) : "".concat(Date.now(), "-").concat(Math.random().toString(16).slice(2, 8));
        var title = typeof raw.title === 'string' ? raw.title : '';
        var description = typeof raw.description === 'string' ? raw.description : '';
        var photos = Array.isArray(raw.photos)
            ? raw.photos.filter(function (item) { return typeof item === 'string'; })
            : [];
        var createdAtRaw = (typeof raw.createdAt === 'string' && raw.createdAt) ||
            (typeof raw.created_at === 'string' && raw.created_at) ||
            new Date().toISOString();
        var createdAt = new Date(createdAtRaw).toString() === 'Invalid Date' ? new Date().toISOString() : createdAtRaw;
        var createdText = typeof raw.createdText === 'string' && raw.createdText ? raw.createdText : formatDateTime(createdAt);
        var locationName = (typeof raw.locationName === 'string' && raw.locationName) ||
            (typeof raw.location === 'string' && raw.location) ||
            '';
        var latitude = typeof raw.latitude === 'number' ? raw.latitude : null;
        var longitude = typeof raw.longitude === 'number' ? raw.longitude : null;
        var resolved = Boolean(raw.resolved);
        return {
            id: id,
            title: title,
            description: description,
            photos: photos,
            createdAt: createdAt,
            createdText: createdText,
            locationName: locationName,
            latitude: latitude,
            longitude: longitude,
            resolved: resolved,
        };
    })
        .filter(function (note) { return Boolean(note === null || note === void 0 ? void 0 : note.id); });
};
var buildFieldNoteFromForm = function (form) {
    var now = new Date();
    return {
        id: "".concat(now.getTime(), "-").concat(Math.random().toString(16).slice(2, 8)),
        title: form.title.trim(),
        description: form.description.trim(),
        photos: form.photos.slice(0, 6),
        createdAt: now.toISOString(),
        createdText: formatDateTime(now),
        locationName: form.locationName.trim(),
        latitude: form.latitude,
        longitude: form.longitude,
        resolved: false,
    };
};
Page({
    data: __assign(__assign({ tabs: tabs, activeTab: 'overview', referenceSites: admin_1.adminReferenceSites, globalError: '' }, buildInitialAdminState()), { sectionLoading: {
            overview: false,
            settings: false,
            users: false,
            majors: false,
            courses: false,
            materials: false,
            forum: false,
            mobileToolkit: false,
            statistics: false,
        }, sectionErrors: {
            overview: '',
            settings: '',
            users: '',
            majors: '',
            courses: '',
            materials: '',
            forum: '',
            mobileToolkit: '',
            statistics: '',
        }, loadedTabs: {
            overview: false,
            settings: false,
            users: false,
            majors: false,
            courses: false,
            materials: false,
            forum: false,
            mobileToolkit: false,
            statistics: false,
        }, forumPostsLoading: false, forumPostsError: '', settingsFormError: '', settingsMessage: '', settingsSubmitting: false, roleOptions: [
            { value: 'student', label: '学员' },
            { value: 'admin', label: '管理员' },
        ], userFormVisible: false, userForm: createUserForm(), userFormError: '', userSubmitting: false, userRoleIndex: 0, updatingUserId: null, majorFormVisible: false, majorForm: createMajorForm(), majorFormError: '', majorSubmitting: false, courseFormVisible: false, courseFormError: '', courseSubmitting: false, courseFormMajorIndex: 0, materialFormVisible: false, materialFormError: '', materialSubmitting: false, materialFormCourseIndex: 0, statisticsSearchKeyword: '', statisticsSearchLoading: false, statisticsSearchError: '', statisticsSearchResult: null, fieldNoteFormVisible: false, fieldNoteForm: createFieldNoteForm(), fieldNoteFormError: '', fieldNoteSubmitting: false, fieldNoteLocationLoading: false }),
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
            var error_1, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.setData({
                            globalError: '',
                            'sectionLoading.overview': true,
                            'sectionErrors.overview': '',
                        });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, session_1.ensureSession)()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        message = getErrorMessage(error_1, '请先登录后再访问后台管理。');
                        this.setData({
                            globalError: message,
                            'sectionLoading.overview': false,
                        });
                        this.applyOverviewFallback("".concat(admin_1.adminDashboardNote, " \u82E5\u9700\u67E5\u770B\u5B9E\u65F6\u6570\u636E\uFF0C\u8BF7\u4F7F\u7528\u7BA1\u7406\u5458\u8D26\u53F7\u767B\u5F55\u3002"));
                        return [2 /*return*/];
                    case 4: return [4 /*yield*/, this.loadOverview()];
                    case 5:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    },
    _getData: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.data.loadedTabs.overview) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.loadOverview()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/, {
                            metricsCards: this.data.metricsCards,
                            studentProgress: this.data.studentProgress,
                            auditLogs: this.data.auditLogs,
                            administrators: this.data.administrators,
                            dashboardNote: this.data.dashboardNote,
                            loadedTabs: __assign({}, this.data.loadedTabs),
                        }];
                }
            });
        });
    },
    applyOverviewFallback: function (note) {
        var metricsCards = cloneMetricCards();
        this.setData({
            metricsCards: metricsCards,
            studentProgress: cloneStudentProgress(),
            auditLogs: cloneAuditLogs(),
            administrators: cloneAdministrators(),
            dashboardNote: note !== null && note !== void 0 ? note : admin_1.adminDashboardNote,
            'loadedTabs.overview': true,
            'sectionErrors.overview': '',
        });
        this.refreshMobileToolkitInsights();
    },
    applySettingsFallback: function () {
        this.setData({
            settingsForm: createSettingsForm(__assign({}, admin_1.adminSettingsSeed)),
            'loadedTabs.settings': true,
            settingsFormError: '',
        });
    },
    applyUsersFallback: function () {
        this.setData({
            users: cloneUsers(),
            'loadedTabs.users': true,
            'sectionErrors.users': '',
        });
    },
    applyMajorsFallback: function () {
        var majors = cloneMajors();
        this.setData({
            majors: majors,
            'loadedTabs.majors': true,
            'sectionErrors.majors': '',
        });
        this.syncCourseFormMajor(majors);
    },
    applyCoursesFallback: function () {
        var courses = cloneCourses();
        this.setData({
            courses: courses,
            coursesForMaterials: courses,
            'loadedTabs.courses': true,
            'sectionErrors.courses': '',
        });
        this.syncMaterialFormCourse(courses);
    },
    applyMaterialsFallback: function () {
        var materials = cloneMaterials();
        this.setData({
            materials: materials,
            'loadedTabs.materials': true,
            'sectionErrors.materials': '',
        });
    },
    applyForumFallback: function () {
        var topics = cloneForumTopics();
        var nextTopicId = topics.length > 0 ? String(topics[0].id) : '';
        this.setData({
            forumTopics: topics,
            selectedTopicId: nextTopicId,
            forumPosts: nextTopicId ? cloneForumPosts(nextTopicId) : [],
            'loadedTabs.forum': true,
            'sectionErrors.forum': '',
        });
    },
    applyForumPostsFallback: function (topicId) {
        this.setData({
            forumPosts: cloneForumPosts(topicId),
            forumPostsError: '',
        });
    },
    applyStatisticsFallback: function () {
        this.setData({
            statistics: cloneStatistics(),
            'loadedTabs.statistics': true,
            'sectionErrors.statistics': '',
        });
    },
    switchTab: function (event) {
        var _a, _b;
        var tab = (_b = (_a = event.currentTarget) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b.tab;
        if (!tab || tab === this.data.activeTab) {
            return;
        }
        this.setData({ activeTab: tab });
        if (!this.data.loadedTabs[tab]) {
            void this.loadTab(tab);
        }
    },
    loadTab: function (tab) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = tab;
                        switch (_a) {
                            case 'overview': return [3 /*break*/, 1];
                            case 'settings': return [3 /*break*/, 3];
                            case 'users': return [3 /*break*/, 5];
                            case 'majors': return [3 /*break*/, 7];
                            case 'courses': return [3 /*break*/, 9];
                            case 'materials': return [3 /*break*/, 11];
                            case 'forum': return [3 /*break*/, 13];
                            case 'mobileToolkit': return [3 /*break*/, 15];
                            case 'statistics': return [3 /*break*/, 17];
                        }
                        return [3 /*break*/, 19];
                    case 1: return [4 /*yield*/, this.loadOverview()];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 20];
                    case 3: return [4 /*yield*/, this.loadSettings()];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 20];
                    case 5: return [4 /*yield*/, this.loadUsers()];
                    case 6:
                        _b.sent();
                        return [3 /*break*/, 20];
                    case 7: return [4 /*yield*/, this.loadMajors()];
                    case 8:
                        _b.sent();
                        return [3 /*break*/, 20];
                    case 9: return [4 /*yield*/, this.loadCourses()];
                    case 10:
                        _b.sent();
                        return [3 /*break*/, 20];
                    case 11: return [4 /*yield*/, this.loadMaterials()];
                    case 12:
                        _b.sent();
                        return [3 /*break*/, 20];
                    case 13: return [4 /*yield*/, this.loadForum()];
                    case 14:
                        _b.sent();
                        return [3 /*break*/, 20];
                    case 15: return [4 /*yield*/, this.loadMobileToolkit()];
                    case 16:
                        _b.sent();
                        return [3 /*break*/, 20];
                    case 17: return [4 /*yield*/, this.loadStatistics()];
                    case 18:
                        _b.sent();
                        return [3 /*break*/, 20];
                    case 19: return [3 /*break*/, 20];
                    case 20: return [2 /*return*/];
                }
            });
        });
    },
    loadOverview: function () {
        return __awaiter(this, void 0, void 0, function () {
            var dashboard, metrics, metricsCards, error_2, message, unauthorized, wasLoaded, note;
            var _a, _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        this.setData({
                            'sectionLoading.overview': true,
                            'sectionErrors.overview': '',
                        });
                        _f.label = 1;
                    case 1:
                        _f.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, (0, admin_2.fetchAdminDashboard)()];
                    case 2:
                        dashboard = _f.sent();
                        metrics = (_a = dashboard.metrics) !== null && _a !== void 0 ? _a : { activeStudents: 0, tasksCompletedToday: 0, followUpsPending: 0, systemAlerts: 0 };
                        metricsCards = [
                            { id: 'activeStudents', label: '活跃学员', value: (_b = metrics.activeStudents) !== null && _b !== void 0 ? _b : 0 },
                            { id: 'tasksCompletedToday', label: '今日完成任务', value: (_c = metrics.tasksCompletedToday) !== null && _c !== void 0 ? _c : 0 },
                            { id: 'followUpsPending', label: '待跟进提醒', value: (_d = metrics.followUpsPending) !== null && _d !== void 0 ? _d : 0 },
                            { id: 'systemAlerts', label: '系统告警', value: (_e = metrics.systemAlerts) !== null && _e !== void 0 ? _e : 0 },
                        ];
                        this.setData({
                            metricsCards: metricsCards,
                            studentProgress: Array.isArray(dashboard.studentProgress) ? dashboard.studentProgress : [],
                            auditLogs: Array.isArray(dashboard.auditLogs) ? dashboard.auditLogs : [],
                            administrators: Array.isArray(dashboard.administrators) ? dashboard.administrators : [],
                            dashboardNote: dashboard.securityNote || '',
                            'loadedTabs.overview': true,
                        });
                        this.refreshMobileToolkitInsights();
                        return [3 /*break*/, 5];
                    case 3:
                        error_2 = _f.sent();
                        message = getErrorMessage(error_2, '无法加载后台概览数据，请稍后重试。');
                        unauthorized = isUnauthorizedError(error_2);
                        wasLoaded = this.data.loadedTabs.overview;
                        if (!wasLoaded || unauthorized) {
                            note = unauthorized
                                ? "".concat(admin_1.adminDashboardNote, " \u82E5\u9700\u67E5\u770B\u5B9E\u65F6\u6570\u636E\uFF0C\u8BF7\u4F7F\u7528\u7BA1\u7406\u5458\u8D26\u53F7\u767B\u5F55\u3002")
                                : "".concat(admin_1.adminDashboardNote, " \u5F53\u524D\u4E3A\u793A\u4F8B\u6570\u636E\u5C55\u793A\uFF0C\u7A0D\u540E\u91CD\u8BD5\u53EF\u83B7\u53D6\u5B9E\u65F6\u6570\u636E\u3002");
                            this.applyOverviewFallback(note);
                            if (!unauthorized) {
                                wx.showToast({ title: message, icon: 'none' });
                            }
                        }
                        else {
                            this.setData({ 'sectionErrors.overview': message });
                        }
                        if (unauthorized) {
                            this.setData({ globalError: message, 'sectionErrors.overview': '' });
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        this.setData({ 'sectionLoading.overview': false });
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    },
    loadSettings: function () {
        return __awaiter(this, void 0, void 0, function () {
            var settings, form, error_3, message, unauthorized, wasLoaded;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.setData({
                            'sectionLoading.settings': true,
                            'sectionErrors.settings': '',
                            settingsFormError: '',
                            settingsMessage: '',
                        });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, (0, admin_2.fetchAdminSettings)()];
                    case 2:
                        settings = _a.sent();
                        form = createSettingsForm(settings);
                        this.setData({
                            settingsForm: form,
                            'loadedTabs.settings': true,
                        });
                        return [3 /*break*/, 5];
                    case 3:
                        error_3 = _a.sent();
                        message = getErrorMessage(error_3, '无法加载平台基础信息。');
                        unauthorized = isUnauthorizedError(error_3);
                        wasLoaded = this.data.loadedTabs.settings;
                        if (!wasLoaded || unauthorized) {
                            this.applySettingsFallback();
                            if (unauthorized) {
                                this.setData({ globalError: message });
                            }
                            else {
                                wx.showToast({ title: message, icon: 'none' });
                            }
                        }
                        else {
                            this.setData({ 'sectionErrors.settings': message });
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        this.setData({ 'sectionLoading.settings': false });
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    },
    handleSettingsInput: function (event) {
        var _a;
        var _b, _c, _d, _e;
        var field = (_c = (_b = event.currentTarget) === null || _b === void 0 ? void 0 : _b.dataset) === null || _c === void 0 ? void 0 : _c.field;
        if (!field) {
            return;
        }
        var value = (_e = (_d = event.detail) === null || _d === void 0 ? void 0 : _d.value) !== null && _e !== void 0 ? _e : '';
        this.setData({
            settingsForm: __assign(__assign({}, this.data.settingsForm), (_a = {}, _a[field] = value, _a)),
            settingsFormError: '',
            settingsMessage: '',
        });
    },
    submitSettings: function () {
        return __awaiter(this, void 0, void 0, function () {
            var platformName, supportEmail, securityNote, error_4;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (this.data.settingsSubmitting) {
                            return [2 /*return*/];
                        }
                        platformName = ((_a = this.data.settingsForm.platform_name) !== null && _a !== void 0 ? _a : '').trim();
                        if (!platformName) {
                            this.setData({ settingsFormError: '请填写平台名称。', settingsMessage: '' });
                            return [2 /*return*/];
                        }
                        supportEmail = ((_b = this.data.settingsForm.support_email) !== null && _b !== void 0 ? _b : '').trim();
                        securityNote = ((_c = this.data.settingsForm.security_note) !== null && _c !== void 0 ? _c : '').trim();
                        this.setData({
                            settingsSubmitting: true,
                            settingsFormError: '',
                            settingsMessage: '',
                        });
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 4, 5, 6]);
                        return [4 /*yield*/, (0, admin_2.updateAdminSettings)({
                                platform_name: platformName,
                                support_email: supportEmail,
                                security_note: securityNote,
                            })];
                    case 2:
                        _d.sent();
                        this.setData({ settingsMessage: '设置已保存。' });
                        wx.showToast({ title: '已保存', icon: 'success' });
                        return [4 /*yield*/, this.loadOverview()];
                    case 3:
                        _d.sent();
                        return [3 /*break*/, 6];
                    case 4:
                        error_4 = _d.sent();
                        this.setData({ settingsFormError: getErrorMessage(error_4, '保存失败，请稍后重试。') });
                        return [3 /*break*/, 6];
                    case 5:
                        this.setData({ settingsSubmitting: false });
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    },
    loadUsers: function () {
        return __awaiter(this, void 0, void 0, function () {
            var users, error_5, message, unauthorized, wasLoaded;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.setData({ 'sectionLoading.users': true, 'sectionErrors.users': '' });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, (0, admin_2.fetchAdminUsers)()];
                    case 2:
                        users = _a.sent();
                        this.setData({
                            users: users,
                            'loadedTabs.users': true,
                        });
                        return [3 /*break*/, 5];
                    case 3:
                        error_5 = _a.sent();
                        message = getErrorMessage(error_5, '无法加载用户列表。');
                        unauthorized = isUnauthorizedError(error_5);
                        wasLoaded = this.data.loadedTabs.users;
                        if (!wasLoaded || unauthorized) {
                            this.applyUsersFallback();
                            if (unauthorized) {
                                this.setData({ globalError: message });
                            }
                            else {
                                wx.showToast({ title: message, icon: 'none' });
                            }
                        }
                        else {
                            this.setData({ 'sectionErrors.users': message });
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        this.setData({ 'sectionLoading.users': false });
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    },
    openUserForm: function () {
        var _this = this;
        var roleIndex = this.data.roleOptions.findIndex(function (option) { return option.value === _this.data.userForm.role; });
        this.setData({
            userFormVisible: true,
            userFormError: '',
            userRoleIndex: roleIndex >= 0 ? roleIndex : 0,
        });
    },
    closeUserForm: function () {
        if (this.data.userSubmitting) {
            return;
        }
        this.setData({
            userFormVisible: false,
            userForm: createUserForm(),
            userFormError: '',
            userRoleIndex: 0,
        });
    },
    handleUserInput: function (event) {
        var _a;
        var _b, _c, _d;
        var field = (_c = (_b = event.currentTarget) === null || _b === void 0 ? void 0 : _b.dataset) === null || _c === void 0 ? void 0 : _c.field;
        if (!field) {
            return;
        }
        var value = (_d = event.detail.value) !== null && _d !== void 0 ? _d : '';
        this.setData({
            userForm: __assign(__assign({}, this.data.userForm), (_a = {}, _a[field] = value, _a)),
            userFormError: '',
        });
    },
    handleUserRolePicker: function (event) {
        var _a, _b, _c;
        var index = Number((_a = event.detail.value) !== null && _a !== void 0 ? _a : 0);
        var nextRole = (_c = (_b = this.data.roleOptions[index]) === null || _b === void 0 ? void 0 : _b.value) !== null && _c !== void 0 ? _c : 'student';
        this.setData({
            userRoleIndex: index,
            userForm: __assign(__assign({}, this.data.userForm), { role: nextRole }),
            userFormError: '',
        });
    },
    submitUserForm: function () {
        return __awaiter(this, void 0, void 0, function () {
            var form, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.data.userSubmitting) {
                            return [2 /*return*/];
                        }
                        form = this.data.userForm;
                        if (!form.username.trim() || !form.password.trim() || !form.displayName.trim()) {
                            this.setData({ userFormError: '请完整填写用户名、密码与姓名。' });
                            return [2 /*return*/];
                        }
                        this.setData({ userSubmitting: true, userFormError: '' });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, 5, 6]);
                        return [4 /*yield*/, (0, admin_2.createAdminUser)({
                                username: form.username.trim(),
                                password: form.password.trim(),
                                displayName: form.displayName.trim(),
                                email: form.email.trim() || undefined,
                                role: form.role,
                            })];
                    case 2:
                        _a.sent();
                        wx.showToast({ title: '已创建', icon: 'success' });
                        this.closeUserForm();
                        return [4 /*yield*/, this.loadUsers()];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 4:
                        error_6 = _a.sent();
                        this.setData({ userFormError: getErrorMessage(error_6, '创建用户失败，请稍后重试。') });
                        return [3 /*break*/, 6];
                    case 5:
                        this.setData({ userSubmitting: false });
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    },
    handleUserRoleChange: function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var id, index, role, error_7;
            var _a, _b, _c, _d, _e, _f, _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        id = Number((_c = (_b = (_a = event.currentTarget) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b.id) !== null && _c !== void 0 ? _c : 0);
                        if (!id) {
                            return [2 /*return*/];
                        }
                        index = Number((_d = event.detail.value) !== null && _d !== void 0 ? _d : 0);
                        role = (_f = (_e = this.data.roleOptions[index]) === null || _e === void 0 ? void 0 : _e.value) !== null && _f !== void 0 ? _f : 'student';
                        if (this.data.updatingUserId === id && ((_g = this.data.users.find(function (user) { return user.id === id; })) === null || _g === void 0 ? void 0 : _g.role) === role) {
                            return [2 /*return*/];
                        }
                        this.setData({ updatingUserId: id });
                        _h.label = 1;
                    case 1:
                        _h.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, (0, admin_2.updateAdminUser)(id, { role: role })];
                    case 2:
                        _h.sent();
                        this.setData({
                            users: this.data.users.map(function (user) { return (user.id === id ? __assign(__assign({}, user), { role: role }) : user); }),
                        });
                        wx.showToast({ title: '已更新', icon: 'success' });
                        return [3 /*break*/, 5];
                    case 3:
                        error_7 = _h.sent();
                        wx.showToast({ title: getErrorMessage(error_7, '更新角色失败'), icon: 'none' });
                        return [3 /*break*/, 5];
                    case 4:
                        this.setData({ updatingUserId: null });
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    },
    confirmDeleteUser: function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var id, name, confirm, error_8;
            var _a, _b, _c, _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        id = Number((_c = (_b = (_a = event.currentTarget) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b.id) !== null && _c !== void 0 ? _c : 0);
                        name = (_f = (_e = (_d = event.currentTarget) === null || _d === void 0 ? void 0 : _d.dataset) === null || _e === void 0 ? void 0 : _e.name) !== null && _f !== void 0 ? _f : '';
                        if (!id) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, wx.showModal({
                                title: '删除用户',
                                content: "\u786E\u5B9A\u8981\u5220\u9664 ".concat(name || '该用户', " \u5417\uFF1F"),
                                confirmText: '删除',
                                confirmColor: '#d14343',
                            })];
                    case 1:
                        confirm = (_g.sent()).confirm;
                        if (!confirm) {
                            return [2 /*return*/];
                        }
                        _g.label = 2;
                    case 2:
                        _g.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, (0, admin_2.deleteAdminUser)(id)];
                    case 3:
                        _g.sent();
                        wx.showToast({ title: '已删除', icon: 'success' });
                        return [4 /*yield*/, this.loadUsers()];
                    case 4:
                        _g.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_8 = _g.sent();
                        wx.showToast({ title: getErrorMessage(error_8, '删除失败，请稍后重试。'), icon: 'none' });
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    },
    loadMajors: function () {
        return __awaiter(this, void 0, void 0, function () {
            var majors, error_9, message, unauthorized, wasLoaded;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.setData({ 'sectionLoading.majors': true, 'sectionErrors.majors': '' });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, (0, admin_2.fetchMajors)()];
                    case 2:
                        majors = _a.sent();
                        this.setData({
                            majors: majors,
                            'loadedTabs.majors': true,
                        });
                        this.syncCourseFormMajor(majors);
                        return [3 /*break*/, 5];
                    case 3:
                        error_9 = _a.sent();
                        message = getErrorMessage(error_9, '无法加载专业信息。');
                        unauthorized = isUnauthorizedError(error_9);
                        wasLoaded = this.data.loadedTabs.majors;
                        if (!wasLoaded || unauthorized) {
                            this.applyMajorsFallback();
                            if (unauthorized) {
                                this.setData({ globalError: message });
                            }
                            else {
                                wx.showToast({ title: message, icon: 'none' });
                            }
                        }
                        else {
                            this.setData({ 'sectionErrors.majors': message });
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        this.setData({ 'sectionLoading.majors': false });
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    },
    openMajorForm: function () {
        this.setData({ majorFormVisible: true, majorFormError: '' });
    },
    closeMajorForm: function () {
        if (this.data.majorSubmitting) {
            return;
        }
        this.setData({
            majorFormVisible: false,
            majorForm: createMajorForm(),
            majorFormError: '',
        });
    },
    handleMajorInput: function (event) {
        var _a;
        var _b, _c, _d;
        var field = (_c = (_b = event.currentTarget) === null || _b === void 0 ? void 0 : _b.dataset) === null || _c === void 0 ? void 0 : _c.field;
        if (!field) {
            return;
        }
        var value = (_d = event.detail.value) !== null && _d !== void 0 ? _d : '';
        this.setData({
            majorForm: __assign(__assign({}, this.data.majorForm), (_a = {}, _a[field] = value, _a)),
            majorFormError: '',
        });
    },
    submitMajorForm: function () {
        return __awaiter(this, void 0, void 0, function () {
            var form, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.data.majorSubmitting) {
                            return [2 /*return*/];
                        }
                        form = this.data.majorForm;
                        if (!form.name.trim()) {
                            this.setData({ majorFormError: '请输入专业名称。' });
                            return [2 /*return*/];
                        }
                        this.setData({ majorSubmitting: true, majorFormError: '' });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, 5, 6]);
                        return [4 /*yield*/, (0, admin_2.createMajor)({
                                name: form.name.trim(),
                                description: form.description.trim() || undefined,
                            })];
                    case 2:
                        _a.sent();
                        wx.showToast({ title: '已创建', icon: 'success' });
                        this.closeMajorForm();
                        return [4 /*yield*/, this.loadMajors()];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 4:
                        error_10 = _a.sent();
                        this.setData({ majorFormError: getErrorMessage(error_10, '创建专业失败，请稍后重试。') });
                        return [3 /*break*/, 6];
                    case 5:
                        this.setData({ majorSubmitting: false });
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    },
    confirmDeleteMajor: function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var id, name, confirm, error_11;
            var _a, _b, _c, _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        id = Number((_c = (_b = (_a = event.currentTarget) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b.id) !== null && _c !== void 0 ? _c : 0);
                        name = (_f = (_e = (_d = event.currentTarget) === null || _d === void 0 ? void 0 : _d.dataset) === null || _e === void 0 ? void 0 : _e.name) !== null && _f !== void 0 ? _f : '';
                        if (!id) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, wx.showModal({
                                title: '删除专业',
                                content: "\u786E\u5B9A\u8981\u5220\u9664 ".concat(name || '该专业', " \u5417\uFF1F"),
                                confirmText: '删除',
                                confirmColor: '#d14343',
                            })];
                    case 1:
                        confirm = (_g.sent()).confirm;
                        if (!confirm) {
                            return [2 /*return*/];
                        }
                        _g.label = 2;
                    case 2:
                        _g.trys.push([2, 7, , 8]);
                        return [4 /*yield*/, (0, admin_2.deleteMajor)(id)];
                    case 3:
                        _g.sent();
                        wx.showToast({ title: '已删除', icon: 'success' });
                        return [4 /*yield*/, this.loadMajors()];
                    case 4:
                        _g.sent();
                        if (!this.data.loadedTabs.courses) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.loadCourses()];
                    case 5:
                        _g.sent();
                        _g.label = 6;
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        error_11 = _g.sent();
                        wx.showToast({ title: getErrorMessage(error_11, '删除失败，请稍后重试。'), icon: 'none' });
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    },
    syncCourseFormMajor: function (majors) {
        if (!Array.isArray(majors) || majors.length === 0) {
            this.setData({
                majorsForCourses: [],
                courseFormMajorIndex: 0,
                courseForm: __assign(__assign({}, this.data.courseForm), { majorId: '' }),
            });
            return;
        }
        var currentId = this.data.courseForm.majorId;
        var index = majors.findIndex(function (major) { return String(major.id) === currentId; });
        var nextIndex = index >= 0 ? index : 0;
        this.setData({
            majorsForCourses: majors,
            courseFormMajorIndex: nextIndex,
            courseForm: __assign(__assign({}, this.data.courseForm), { majorId: String(majors[nextIndex].id) }),
        });
    },
    loadCourses: function () {
        return __awaiter(this, void 0, void 0, function () {
            var courses, error_12, message, unauthorized, wasLoaded;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.setData({ 'sectionLoading.courses': true, 'sectionErrors.courses': '' });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, 6, 7]);
                        if (!!this.data.loadedTabs.majors) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.loadMajors()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [4 /*yield*/, (0, admin_2.fetchCourses)()];
                    case 4:
                        courses = _a.sent();
                        this.setData({
                            courses: courses,
                            coursesForMaterials: courses,
                            'loadedTabs.courses': true,
                        });
                        this.syncMaterialFormCourse(courses);
                        return [3 /*break*/, 7];
                    case 5:
                        error_12 = _a.sent();
                        message = getErrorMessage(error_12, '无法加载课程列表。');
                        unauthorized = isUnauthorizedError(error_12);
                        wasLoaded = this.data.loadedTabs.courses;
                        if (!wasLoaded || unauthorized) {
                            if (!this.data.loadedTabs.majors) {
                                this.applyMajorsFallback();
                            }
                            this.applyCoursesFallback();
                            if (unauthorized) {
                                this.setData({ globalError: message });
                            }
                            else {
                                wx.showToast({ title: message, icon: 'none' });
                            }
                        }
                        else {
                            this.setData({ 'sectionErrors.courses': message });
                        }
                        return [3 /*break*/, 7];
                    case 6:
                        this.setData({ 'sectionLoading.courses': false });
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        });
    },
    openCourseForm: function () {
        var majors = this.data.majorsForCourses;
        var nextForm = createCourseForm(majors);
        var index = majors.findIndex(function (major) { return String(major.id) === nextForm.majorId; });
        this.setData({
            courseFormVisible: true,
            courseFormError: '',
            courseForm: nextForm,
            courseFormMajorIndex: index >= 0 ? index : 0,
        });
    },
    closeCourseForm: function () {
        if (this.data.courseSubmitting) {
            return;
        }
        var majors = this.data.majorsForCourses;
        var nextForm = createCourseForm(majors);
        var index = majors.findIndex(function (major) { return String(major.id) === nextForm.majorId; });
        this.setData({
            courseFormVisible: false,
            courseFormError: '',
            courseForm: nextForm,
            courseFormMajorIndex: index >= 0 ? index : 0,
        });
    },
    handleCourseInput: function (event) {
        var _a;
        var _b, _c, _d;
        var field = (_c = (_b = event.currentTarget) === null || _b === void 0 ? void 0 : _b.dataset) === null || _c === void 0 ? void 0 : _c.field;
        if (!field) {
            return;
        }
        var value = (_d = event.detail.value) !== null && _d !== void 0 ? _d : '';
        this.setData({
            courseForm: __assign(__assign({}, this.data.courseForm), (_a = {}, _a[field] = value, _a)),
            courseFormError: '',
        });
    },
    handleCourseMajorChange: function (event) {
        var _a;
        var index = Number((_a = event.detail.value) !== null && _a !== void 0 ? _a : 0);
        var major = this.data.majorsForCourses[index];
        this.setData({
            courseFormMajorIndex: index,
            courseForm: __assign(__assign({}, this.data.courseForm), { majorId: major ? String(major.id) : '' }),
            courseFormError: '',
        });
    },
    submitCourseForm: function () {
        return __awaiter(this, void 0, void 0, function () {
            var form, creditValue, majorIdNumber, error_13;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.data.courseSubmitting) {
                            return [2 /*return*/];
                        }
                        form = this.data.courseForm;
                        if (!form.title.trim()) {
                            this.setData({ courseFormError: '请输入课程名称。' });
                            return [2 /*return*/];
                        }
                        if (!form.majorId) {
                            this.setData({ courseFormError: '请选择所属专业。' });
                            return [2 /*return*/];
                        }
                        if (form.credit.trim() && Number.isNaN(Number(form.credit))) {
                            this.setData({ courseFormError: '学分请输入数字。' });
                            return [2 /*return*/];
                        }
                        creditValue = form.credit.trim() ? Number(form.credit) : undefined;
                        this.setData({ courseSubmitting: true, courseFormError: '' });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, 5, 6]);
                        majorIdNumber = Number(form.majorId);
                        return [4 /*yield*/, (0, admin_2.createCourse)({
                                title: form.title.trim(),
                                teacher: form.teacher.trim() || undefined,
                                credit: creditValue,
                                description: form.description.trim() || undefined,
                                majorId: Number.isNaN(majorIdNumber) ? undefined : majorIdNumber,
                            })];
                    case 2:
                        _a.sent();
                        wx.showToast({ title: '已创建', icon: 'success' });
                        this.closeCourseForm();
                        return [4 /*yield*/, this.loadCourses()];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 4:
                        error_13 = _a.sent();
                        this.setData({ courseFormError: getErrorMessage(error_13, '创建课程失败，请稍后重试。') });
                        return [3 /*break*/, 6];
                    case 5:
                        this.setData({ courseSubmitting: false });
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    },
    confirmDeleteCourse: function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var id, title, confirm, error_14;
            var _a, _b, _c, _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        id = Number((_c = (_b = (_a = event.currentTarget) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b.id) !== null && _c !== void 0 ? _c : 0);
                        title = (_f = (_e = (_d = event.currentTarget) === null || _d === void 0 ? void 0 : _d.dataset) === null || _e === void 0 ? void 0 : _e.name) !== null && _f !== void 0 ? _f : '';
                        if (!id) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, wx.showModal({
                                title: '删除课程',
                                content: "\u786E\u5B9A\u8981\u5220\u9664 ".concat(title || '该课程', " \u5417\uFF1F"),
                                confirmText: '删除',
                                confirmColor: '#d14343',
                            })];
                    case 1:
                        confirm = (_g.sent()).confirm;
                        if (!confirm) {
                            return [2 /*return*/];
                        }
                        _g.label = 2;
                    case 2:
                        _g.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, (0, admin_2.deleteCourse)(id)];
                    case 3:
                        _g.sent();
                        wx.showToast({ title: '已删除', icon: 'success' });
                        return [4 /*yield*/, this.loadCourses()];
                    case 4:
                        _g.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_14 = _g.sent();
                        wx.showToast({ title: getErrorMessage(error_14, '删除失败，请稍后重试。'), icon: 'none' });
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    },
    syncMaterialFormCourse: function (courses) {
        if (!Array.isArray(courses) || courses.length === 0) {
            this.setData({
                coursesForMaterials: [],
                materialFormCourseIndex: 0,
                materialForm: __assign(__assign({}, this.data.materialForm), { courseId: '' }),
            });
            return;
        }
        var currentId = this.data.materialForm.courseId;
        var index = courses.findIndex(function (course) { return String(course.id) === currentId; });
        var nextIndex = index >= 0 ? index : 0;
        this.setData({
            coursesForMaterials: courses,
            materialFormCourseIndex: nextIndex,
            materialForm: __assign(__assign({}, this.data.materialForm), { courseId: String(courses[nextIndex].id) }),
        });
    },
    loadMaterials: function () {
        return __awaiter(this, void 0, void 0, function () {
            var materials, error_15, message, unauthorized, wasLoaded;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.setData({ 'sectionLoading.materials': true, 'sectionErrors.materials': '' });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, 6, 7]);
                        if (!!this.data.loadedTabs.courses) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.loadCourses()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [4 /*yield*/, (0, admin_2.fetchMaterials)()];
                    case 4:
                        materials = _a.sent();
                        this.setData({
                            materials: materials,
                            'loadedTabs.materials': true,
                        });
                        return [3 /*break*/, 7];
                    case 5:
                        error_15 = _a.sent();
                        message = getErrorMessage(error_15, '无法加载资料列表。');
                        unauthorized = isUnauthorizedError(error_15);
                        wasLoaded = this.data.loadedTabs.materials;
                        if (!wasLoaded || unauthorized) {
                            if (!this.data.loadedTabs.courses) {
                                this.applyCoursesFallback();
                            }
                            this.applyMaterialsFallback();
                            if (unauthorized) {
                                this.setData({ globalError: message });
                            }
                            else {
                                wx.showToast({ title: message, icon: 'none' });
                            }
                        }
                        else {
                            this.setData({ 'sectionErrors.materials': message });
                        }
                        return [3 /*break*/, 7];
                    case 6:
                        this.setData({ 'sectionLoading.materials': false });
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        });
    },
    openMaterialForm: function () {
        var courses = this.data.coursesForMaterials;
        var nextForm = createMaterialForm(courses);
        var index = courses.findIndex(function (course) { return String(course.id) === nextForm.courseId; });
        this.setData({
            materialFormVisible: true,
            materialFormError: '',
            materialForm: nextForm,
            materialFormCourseIndex: index >= 0 ? index : 0,
        });
    },
    closeMaterialForm: function () {
        if (this.data.materialSubmitting) {
            return;
        }
        var courses = this.data.coursesForMaterials;
        var nextForm = createMaterialForm(courses);
        var index = courses.findIndex(function (course) { return String(course.id) === nextForm.courseId; });
        this.setData({
            materialFormVisible: false,
            materialFormError: '',
            materialForm: nextForm,
            materialFormCourseIndex: index >= 0 ? index : 0,
        });
    },
    handleMaterialInput: function (event) {
        var _a;
        var _b, _c, _d;
        var field = (_c = (_b = event.currentTarget) === null || _b === void 0 ? void 0 : _b.dataset) === null || _c === void 0 ? void 0 : _c.field;
        if (!field) {
            return;
        }
        var value = (_d = event.detail.value) !== null && _d !== void 0 ? _d : '';
        this.setData({
            materialForm: __assign(__assign({}, this.data.materialForm), (_a = {}, _a[field] = value, _a)),
            materialFormError: '',
        });
    },
    handleMaterialCourseChange: function (event) {
        var _a;
        var index = Number((_a = event.detail.value) !== null && _a !== void 0 ? _a : 0);
        var course = this.data.coursesForMaterials[index];
        this.setData({
            materialFormCourseIndex: index,
            materialForm: __assign(__assign({}, this.data.materialForm), { courseId: course ? String(course.id) : '' }),
            materialFormError: '',
        });
    },
    submitMaterialForm: function () {
        return __awaiter(this, void 0, void 0, function () {
            var form, courseIdNumber, error_16;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.data.materialSubmitting) {
                            return [2 /*return*/];
                        }
                        form = this.data.materialForm;
                        if (!form.title.trim()) {
                            this.setData({ materialFormError: '请输入资料标题。' });
                            return [2 /*return*/];
                        }
                        this.setData({ materialSubmitting: true, materialFormError: '' });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, 5, 6]);
                        courseIdNumber = form.courseId ? Number(form.courseId) : undefined;
                        return [4 /*yield*/, (0, admin_2.createMaterial)({
                                title: form.title.trim(),
                                description: form.description.trim() || undefined,
                                fileUrl: form.fileUrl.trim() || undefined,
                                courseId: courseIdNumber !== undefined && !Number.isNaN(courseIdNumber) ? courseIdNumber : undefined,
                            })];
                    case 2:
                        _a.sent();
                        wx.showToast({ title: '已创建', icon: 'success' });
                        this.closeMaterialForm();
                        return [4 /*yield*/, this.loadMaterials()];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 4:
                        error_16 = _a.sent();
                        this.setData({ materialFormError: getErrorMessage(error_16, '创建资料失败，请稍后重试。') });
                        return [3 /*break*/, 6];
                    case 5:
                        this.setData({ materialSubmitting: false });
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    },
    confirmDeleteMaterial: function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var id, title, confirm, error_17;
            var _a, _b, _c, _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        id = Number((_c = (_b = (_a = event.currentTarget) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b.id) !== null && _c !== void 0 ? _c : 0);
                        title = (_f = (_e = (_d = event.currentTarget) === null || _d === void 0 ? void 0 : _d.dataset) === null || _e === void 0 ? void 0 : _e.name) !== null && _f !== void 0 ? _f : '';
                        if (!id) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, wx.showModal({
                                title: '删除资料',
                                content: "\u786E\u5B9A\u8981\u5220\u9664 ".concat(title || '该资料', " \u5417\uFF1F"),
                                confirmText: '删除',
                                confirmColor: '#d14343',
                            })];
                    case 1:
                        confirm = (_g.sent()).confirm;
                        if (!confirm) {
                            return [2 /*return*/];
                        }
                        _g.label = 2;
                    case 2:
                        _g.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, (0, admin_2.deleteMaterial)(id)];
                    case 3:
                        _g.sent();
                        wx.showToast({ title: '已删除', icon: 'success' });
                        return [4 /*yield*/, this.loadMaterials()];
                    case 4:
                        _g.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_17 = _g.sent();
                        wx.showToast({ title: getErrorMessage(error_17, '删除失败，请稍后重试。'), icon: 'none' });
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    },
    loadForum: function () {
        return __awaiter(this, void 0, void 0, function () {
            var topics, selectedTopicId_1, error_18, message, unauthorized, wasLoaded;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.setData({ 'sectionLoading.forum': true, 'sectionErrors.forum': '', forumPostsError: '' });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, 6, 7]);
                        return [4 /*yield*/, (0, admin_2.fetchForumTopics)()];
                    case 2:
                        topics = _a.sent();
                        selectedTopicId_1 = this.data.selectedTopicId;
                        if (!selectedTopicId_1 && topics.length > 0) {
                            selectedTopicId_1 = String(topics[0].id);
                        }
                        else if (selectedTopicId_1 && topics.every(function (topic) { return String(topic.id) !== selectedTopicId_1; })) {
                            selectedTopicId_1 = topics.length > 0 ? String(topics[0].id) : '';
                        }
                        this.setData({
                            forumTopics: topics,
                            selectedTopicId: selectedTopicId_1,
                            forumPosts: [],
                            'loadedTabs.forum': true,
                        });
                        if (!selectedTopicId_1) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.loadForumPosts(selectedTopicId_1)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [3 /*break*/, 7];
                    case 5:
                        error_18 = _a.sent();
                        message = getErrorMessage(error_18, '无法加载论坛数据。');
                        unauthorized = isUnauthorizedError(error_18);
                        wasLoaded = this.data.loadedTabs.forum;
                        if (!wasLoaded || unauthorized) {
                            this.applyForumFallback();
                            if (unauthorized) {
                                this.setData({ globalError: message });
                            }
                            else {
                                wx.showToast({ title: message, icon: 'none' });
                            }
                        }
                        else {
                            this.setData({ 'sectionErrors.forum': message });
                        }
                        return [3 /*break*/, 7];
                    case 6:
                        this.setData({ 'sectionLoading.forum': false });
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        });
    },
    loadForumPosts: function (topicId) {
        return __awaiter(this, void 0, void 0, function () {
            var posts, error_19, message, unauthorized, hadPosts;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!topicId) {
                            this.setData({ forumPosts: [], forumPostsLoading: false });
                            return [2 /*return*/];
                        }
                        this.setData({ forumPostsLoading: true, forumPostsError: '' });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, (0, admin_2.fetchForumPosts)(topicId)];
                    case 2:
                        posts = _a.sent();
                        this.setData({ forumPosts: posts });
                        return [3 /*break*/, 5];
                    case 3:
                        error_19 = _a.sent();
                        message = getErrorMessage(error_19, '无法加载帖子列表。');
                        unauthorized = isUnauthorizedError(error_19);
                        hadPosts = (this.data.forumPosts || []).length > 0;
                        if (!hadPosts || unauthorized) {
                            this.applyForumPostsFallback(topicId);
                            if (unauthorized) {
                                this.setData({ globalError: message, forumPostsError: '' });
                            }
                            else {
                                wx.showToast({ title: message, icon: 'none' });
                            }
                        }
                        else {
                            this.setData({ forumPostsError: message });
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        this.setData({ forumPostsLoading: false });
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    },
    handleSelectTopic: function (event) {
        var _a, _b;
        var topicId = (_b = (_a = event.currentTarget) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b.id;
        if (!topicId || topicId === this.data.selectedTopicId) {
            return;
        }
        this.setData({ selectedTopicId: topicId, forumPostsError: '' });
        void this.loadForumPosts(topicId);
    },
    confirmDeleteTopic: function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var topicId, title, confirm, error_20;
            var _a, _b, _c, _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        topicId = Number((_c = (_b = (_a = event.currentTarget) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b.id) !== null && _c !== void 0 ? _c : 0);
                        title = (_f = (_e = (_d = event.currentTarget) === null || _d === void 0 ? void 0 : _d.dataset) === null || _e === void 0 ? void 0 : _e.name) !== null && _f !== void 0 ? _f : '';
                        if (!topicId) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, wx.showModal({
                                title: '删除话题',
                                content: "\u786E\u5B9A\u8981\u5220\u9664 ".concat(title || '该话题', " \u5417\uFF1F"),
                                confirmText: '删除',
                                confirmColor: '#d14343',
                            })];
                    case 1:
                        confirm = (_g.sent()).confirm;
                        if (!confirm) {
                            return [2 /*return*/];
                        }
                        _g.label = 2;
                    case 2:
                        _g.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, (0, admin_2.deleteForumTopic)(topicId)];
                    case 3:
                        _g.sent();
                        wx.showToast({ title: '已删除', icon: 'success' });
                        return [4 /*yield*/, this.loadForum()];
                    case 4:
                        _g.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_20 = _g.sent();
                        wx.showToast({ title: getErrorMessage(error_20, '删除失败，请稍后重试。'), icon: 'none' });
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    },
    confirmDeletePost: function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var postId, topicId, confirm, error_21;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        postId = Number((_c = (_b = (_a = event.currentTarget) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b.id) !== null && _c !== void 0 ? _c : 0);
                        topicId = this.data.selectedTopicId;
                        if (!postId || !topicId) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, wx.showModal({
                                title: '删除回复',
                                content: '确定要删除这条回复吗？',
                                confirmText: '删除',
                                confirmColor: '#d14343',
                            })];
                    case 1:
                        confirm = (_d.sent()).confirm;
                        if (!confirm) {
                            return [2 /*return*/];
                        }
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 6, , 7]);
                        return [4 /*yield*/, (0, admin_2.deleteForumPost)(postId)];
                    case 3:
                        _d.sent();
                        wx.showToast({ title: '已删除', icon: 'success' });
                        return [4 /*yield*/, this.loadForumPosts(topicId)];
                    case 4:
                        _d.sent();
                        return [4 /*yield*/, this.loadForum()];
                    case 5:
                        _d.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        error_21 = _d.sent();
                        wx.showToast({ title: getErrorMessage(error_21, '删除失败，请稍后重试。'), icon: 'none' });
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    },
    loadMobileToolkit: function () {
        return __awaiter(this, void 0, void 0, function () {
            var storedNotes, storageValue;
            return __generator(this, function (_a) {
                this.setData({ 'sectionLoading.mobileToolkit': true, 'sectionErrors.mobileToolkit': '' });
                try {
                    storedNotes = [];
                    try {
                        storageValue = wx.getStorageSync(FIELD_NOTES_STORAGE_KEY);
                        storedNotes = normalizeStoredFieldNotes(storageValue);
                    }
                    catch (storageError) {
                        console.warn('读取巡课速记缓存失败', storageError);
                    }
                    this.setData({
                        mobileFieldNotes: storedNotes,
                        fieldNoteForm: createFieldNoteForm(),
                        'loadedTabs.mobileToolkit': true,
                    });
                    this.refreshMobileToolkitInsights(storedNotes);
                }
                catch (error) {
                    console.warn('加载掌上工具数据失败', error);
                    this.setData({ 'sectionErrors.mobileToolkit': '无法加载掌上工具数据，请稍后重试。' });
                }
                finally {
                    this.setData({ 'sectionLoading.mobileToolkit': false });
                }
                return [2 /*return*/];
            });
        });
    },
    refreshMobileToolkitInsights: function (fieldNotes) {
        if (fieldNotes === void 0) { fieldNotes = this.data.mobileFieldNotes || []; }
        var insights = buildToolkitInsights(this.data.metricsCards || [], fieldNotes);
        this.setData({ mobileToolkitInsights: insights });
    },
    openFieldNoteForm: function () {
        this.setData({
            fieldNoteFormVisible: true,
            fieldNoteFormError: '',
            fieldNoteForm: createFieldNoteForm(),
        });
    },
    closeFieldNoteForm: function () {
        if (this.data.fieldNoteSubmitting) {
            return;
        }
        this.setData({
            fieldNoteFormVisible: false,
            fieldNoteForm: createFieldNoteForm(),
            fieldNoteFormError: '',
            fieldNoteSubmitting: false,
            fieldNoteLocationLoading: false,
        });
    },
    handleFieldNoteInput: function (event) {
        var _a;
        var _b, _c, _d, _e;
        var field = (_c = (_b = event.currentTarget) === null || _b === void 0 ? void 0 : _b.dataset) === null || _c === void 0 ? void 0 : _c.field;
        if (!field) {
            return;
        }
        var value = (_e = (_d = event.detail) === null || _d === void 0 ? void 0 : _d.value) !== null && _e !== void 0 ? _e : '';
        this.setData({
            fieldNoteForm: __assign(__assign({}, this.data.fieldNoteForm), (_a = {}, _a[field] = value, _a)),
            fieldNoteFormError: '',
        });
    },
    chooseFieldNoteImages: function () {
        return __awaiter(this, void 0, void 0, function () {
            var currentPhotos, maxPhotos, result, tempFilePaths, savedPaths, photos, error_22;
            var _this = this;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.data.fieldNoteSubmitting) {
                            return [2 /*return*/];
                        }
                        currentPhotos = (_a = this.data.fieldNoteForm.photos) !== null && _a !== void 0 ? _a : [];
                        maxPhotos = 6;
                        if (currentPhotos.length >= maxPhotos) {
                            wx.showToast({ title: '最多可添加 6 张图片', icon: 'none' });
                            return [2 /*return*/];
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, wx.chooseImage({
                                count: maxPhotos - currentPhotos.length,
                                sizeType: ['compressed'],
                                sourceType: ['camera', 'album'],
                            })];
                    case 2:
                        result = _b.sent();
                        tempFilePaths = Array.isArray(result.tempFilePaths) ? result.tempFilePaths : [];
                        if (tempFilePaths.length === 0) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, Promise.all(tempFilePaths.map(function (tempPath) { return __awaiter(_this, void 0, void 0, function () {
                                var res, error_23;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            _a.trys.push([0, 2, , 3]);
                                            return [4 /*yield*/, wx.saveFile({ tempFilePath: tempPath })];
                                        case 1:
                                            res = _a.sent();
                                            return [2 /*return*/, res.savedFilePath || tempPath];
                                        case 2:
                                            error_23 = _a.sent();
                                            console.warn('保存图片失败', error_23);
                                            return [2 /*return*/, tempPath];
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            }); }))];
                    case 3:
                        savedPaths = _b.sent();
                        photos = __spreadArray(__spreadArray([], currentPhotos, true), savedPaths, true).slice(0, maxPhotos);
                        this.setData({
                            fieldNoteForm: __assign(__assign({}, this.data.fieldNoteForm), { photos: photos }),
                            fieldNoteFormError: '',
                        });
                        return [3 /*break*/, 5];
                    case 4:
                        error_22 = _b.sent();
                        console.warn('选择图片失败', error_22);
                        wx.showToast({ title: '无法选择图片', icon: 'none' });
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    },
    removeFieldNotePhoto: function (event) {
        var _a, _b, _c, _d;
        var index = Number((_c = (_b = (_a = event.currentTarget) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b.index) !== null && _c !== void 0 ? _c : -1);
        if (index < 0) {
            return;
        }
        var nextPhotos = __spreadArray([], ((_d = this.data.fieldNoteForm.photos) !== null && _d !== void 0 ? _d : []), true);
        nextPhotos.splice(index, 1);
        this.setData({
            fieldNoteForm: __assign(__assign({}, this.data.fieldNoteForm), { photos: nextPhotos }),
        });
    },
    captureFieldNoteLocation: function () {
        return __awaiter(this, void 0, void 0, function () {
            var location_1, error_24;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.data.fieldNoteLocationLoading) {
                            return [2 /*return*/];
                        }
                        this.setData({ fieldNoteLocationLoading: true, fieldNoteFormError: '' });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, wx.chooseLocation({})];
                    case 2:
                        location_1 = _a.sent();
                        if (!location_1) {
                            return [2 /*return*/];
                        }
                        this.setData({
                            fieldNoteForm: __assign(__assign({}, this.data.fieldNoteForm), { locationName: location_1.name || location_1.address || '位置已记录', latitude: typeof location_1.latitude === 'number' ? location_1.latitude : null, longitude: typeof location_1.longitude === 'number' ? location_1.longitude : null }),
                        });
                        return [3 /*break*/, 5];
                    case 3:
                        error_24 = _a.sent();
                        console.warn('选择位置失败', error_24);
                        wx.showToast({ title: '获取位置失败，请稍后重试', icon: 'none' });
                        return [3 /*break*/, 5];
                    case 4:
                        this.setData({ fieldNoteLocationLoading: false });
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    },
    submitFieldNote: function () {
        return __awaiter(this, void 0, void 0, function () {
            var title, note, nextNotes, error_25;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.data.fieldNoteSubmitting) {
                            return [2 /*return*/];
                        }
                        title = (this.data.fieldNoteForm.title || '').trim();
                        if (!title) {
                            this.setData({ fieldNoteFormError: '请填写巡课主题。' });
                            return [2 /*return*/];
                        }
                        this.setData({ fieldNoteSubmitting: true, fieldNoteFormError: '' });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        note = buildFieldNoteFromForm(this.data.fieldNoteForm);
                        nextNotes = __spreadArray([note], this.data.mobileFieldNotes, true);
                        this.setData({
                            mobileFieldNotes: nextNotes,
                            fieldNoteFormVisible: false,
                            fieldNoteForm: createFieldNoteForm(),
                        });
                        this.refreshMobileToolkitInsights(nextNotes);
                        return [4 /*yield*/, this.persistFieldNotes(nextNotes)];
                    case 2:
                        _a.sent();
                        wx.showToast({ title: '已保存', icon: 'success' });
                        return [3 /*break*/, 5];
                    case 3:
                        error_25 = _a.sent();
                        console.warn('保存巡课速记失败', error_25);
                        this.setData({ fieldNoteFormError: '保存失败，请稍后重试。' });
                        return [3 /*break*/, 5];
                    case 4:
                        this.setData({ fieldNoteSubmitting: false });
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    },
    toggleFieldNoteResolved: function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var noteId, nextNotes, updatedNote;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        noteId = (_b = (_a = event.currentTarget) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b.id;
                        if (!noteId) {
                            return [2 /*return*/];
                        }
                        nextNotes = this.data.mobileFieldNotes.map(function (note) {
                            return note.id === noteId ? __assign(__assign({}, note), { resolved: !note.resolved }) : note;
                        });
                        this.setData({ mobileFieldNotes: nextNotes });
                        this.refreshMobileToolkitInsights(nextNotes);
                        return [4 /*yield*/, this.persistFieldNotes(nextNotes)];
                    case 1:
                        _c.sent();
                        updatedNote = nextNotes.find(function (note) { return note.id === noteId; });
                        wx.showToast({ title: (updatedNote === null || updatedNote === void 0 ? void 0 : updatedNote.resolved) ? '已标记完成' : '已设为待跟进', icon: 'success' });
                        return [2 /*return*/];
                }
            });
        });
    },
    deleteFieldNote: function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var noteId, confirm_1, nextNotes, error_26;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        noteId = (_b = (_a = event.currentTarget) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b.id;
                        if (!noteId) {
                            return [2 /*return*/];
                        }
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, wx.showModal({
                                title: '删除巡课速记',
                                content: '删除后将无法恢复，确定继续吗？',
                                confirmText: '删除',
                                confirmColor: '#d14343',
                            })];
                    case 2:
                        confirm_1 = (_c.sent()).confirm;
                        if (!confirm_1) {
                            return [2 /*return*/];
                        }
                        nextNotes = this.data.mobileFieldNotes.filter(function (note) { return note.id !== noteId; });
                        this.setData({ mobileFieldNotes: nextNotes });
                        this.refreshMobileToolkitInsights(nextNotes);
                        return [4 /*yield*/, this.persistFieldNotes(nextNotes)];
                    case 3:
                        _c.sent();
                        wx.showToast({ title: '已删除', icon: 'success' });
                        return [3 /*break*/, 5];
                    case 4:
                        error_26 = _c.sent();
                        console.warn('删除巡课速记失败', error_26);
                        wx.showToast({ title: '删除失败，请稍后重试', icon: 'none' });
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    },
    previewFieldNotePhoto: function (event) {
        var _a, _b, _c, _d, _e, _f, _g;
        var noteId = (_b = (_a = event.currentTarget) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b.noteId;
        var index = Number((_e = (_d = (_c = event.currentTarget) === null || _c === void 0 ? void 0 : _c.dataset) === null || _d === void 0 ? void 0 : _d.photoIndex) !== null && _e !== void 0 ? _e : 0);
        var photos = [];
        if (noteId) {
            var note = this.data.mobileFieldNotes.find(function (item) { return item.id === noteId; });
            photos = (_f = note === null || note === void 0 ? void 0 : note.photos) !== null && _f !== void 0 ? _f : [];
        }
        else {
            photos = (_g = this.data.fieldNoteForm.photos) !== null && _g !== void 0 ? _g : [];
        }
        if (!photos || photos.length === 0) {
            return;
        }
        var current = photos[index] || photos[0];
        wx.previewImage({ current: current, urls: photos });
    },
    persistFieldNotes: function (fieldNotes) {
        return __awaiter(this, void 0, void 0, function () {
            var error_27;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, wx.setStorage({ key: FIELD_NOTES_STORAGE_KEY, data: fieldNotes })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_27 = _a.sent();
                        console.warn('缓存巡课速记失败', error_27);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    loadStatistics: function () {
        return __awaiter(this, void 0, void 0, function () {
            var statistics, error_28, message, unauthorized, wasLoaded;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.setData({ 'sectionLoading.statistics': true, 'sectionErrors.statistics': '' });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, (0, admin_2.fetchAdminStatistics)()];
                    case 2:
                        statistics = _a.sent();
                        this.setData({ statistics: statistics, 'loadedTabs.statistics': true });
                        return [3 /*break*/, 5];
                    case 3:
                        error_28 = _a.sent();
                        message = getErrorMessage(error_28, '无法加载统计信息。');
                        unauthorized = isUnauthorizedError(error_28);
                        wasLoaded = this.data.loadedTabs.statistics;
                        if (!wasLoaded || unauthorized) {
                            this.applyStatisticsFallback();
                            if (unauthorized) {
                                this.setData({ globalError: message });
                            }
                            else {
                                wx.showToast({ title: message, icon: 'none' });
                            }
                        }
                        else {
                            this.setData({ 'sectionErrors.statistics': message });
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        this.setData({ 'sectionLoading.statistics': false });
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    },
    handleStatisticsKeywordInput: function (event) {
        var _a, _b;
        var value = (_b = (_a = event.detail) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : '';
        this.setData({ statisticsSearchKeyword: value, statisticsSearchError: '' });
    },
    clearStatisticsSearch: function () {
        if (this.data.statisticsSearchLoading) {
            return;
        }
        this.setData({
            statisticsSearchKeyword: '',
            statisticsSearchResult: null,
            statisticsSearchError: '',
        });
    },
    submitStatisticsSearch: function () {
        return __awaiter(this, void 0, void 0, function () {
            var keyword, result, error_29;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.data.statisticsSearchLoading) {
                            return [2 /*return*/];
                        }
                        keyword = this.data.statisticsSearchKeyword.trim();
                        if (!keyword) {
                            this.setData({ statisticsSearchResult: null, statisticsSearchError: '请输入要查询的关键词。' });
                            return [2 /*return*/];
                        }
                        this.setData({ statisticsSearchLoading: true, statisticsSearchError: '' });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, (0, admin_2.searchAdminData)(keyword)];
                    case 2:
                        result = _a.sent();
                        this.setData({ statisticsSearchResult: result });
                        return [3 /*break*/, 5];
                    case 3:
                        error_29 = _a.sent();
                        this.setData({
                            statisticsSearchError: getErrorMessage(error_29, '查询失败，请稍后再试。'),
                            statisticsSearchResult: null,
                        });
                        return [3 /*break*/, 5];
                    case 4:
                        this.setData({ statisticsSearchLoading: false });
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    },
    retrySection: function (event) {
        var _a, _b;
        var tab = (_b = (_a = event.currentTarget) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b.tab;
        if (!tab) {
            return;
        }
        void this.loadTab(tab);
    },
    copyLink: function (event) {
        var _a, _b;
        var url = (_b = (_a = event.currentTarget) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b.url;
        if (!url) {
            return;
        }
        wx.setClipboardData({ data: url })
            .then(function () {
            wx.showToast({ title: '链接已复制', icon: 'success' });
        })
            .catch(function (error) {
            console.warn('复制失败', error);
            wx.showToast({ title: '复制失败，请手动复制', icon: 'none' });
        });
    },
});
