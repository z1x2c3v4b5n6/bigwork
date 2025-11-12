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
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchAdminData = exports.fetchAdminStatistics = exports.deleteForumPost = exports.deleteForumTopic = exports.fetchForumPosts = exports.fetchForumTopics = exports.deleteMaterial = exports.createMaterial = exports.fetchMaterials = exports.deleteCourse = exports.createCourse = exports.fetchCourses = exports.deleteMajor = exports.createMajor = exports.fetchMajors = exports.deleteAdminUser = exports.updateAdminUser = exports.createAdminUser = exports.fetchAdminUsers = exports.updateAdminSettings = exports.fetchAdminSettings = exports.fetchAdminDashboard = void 0;
var api_1 = require("../utils/api");
var toNumber = function (value) {
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : 0;
    }
    if (typeof value === 'string' && value.trim()) {
        var parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
};
var toNullableNumber = function (value) {
    if (value === null || value === undefined) {
        return null;
    }
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : null;
    }
    if (typeof value === 'string' && value.trim()) {
        var parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
};
var toStringSafe = function (value) {
    if (typeof value === 'string') {
        return value;
    }
    if (value === null || value === undefined) {
        return '';
    }
    return String(value);
};
var toNullableString = function (value) {
    var str = toStringSafe(value).trim();
    return str ? str : null;
};
var fetchAdminDashboard = function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, metricsSource, metrics, studentProgress, auditLogs, administrators;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, (0, api_1.apiRequest)({ path: '/admin/dashboard' })];
            case 1:
                response = _b.sent();
                metricsSource = ((_a = response === null || response === void 0 ? void 0 : response.metrics) !== null && _a !== void 0 ? _a : {});
                metrics = {
                    activeStudents: toNumber(metricsSource.activeStudents),
                    tasksCompletedToday: toNumber(metricsSource.tasksCompletedToday),
                    followUpsPending: toNumber(metricsSource.followUpsPending),
                    systemAlerts: toNumber(metricsSource.systemAlerts),
                };
                studentProgress = Array.isArray(response === null || response === void 0 ? void 0 : response.studentProgress)
                    ? response.studentProgress.map(function (item) {
                        var _a, _b;
                        return ({
                            id: Number(item.id) || 0,
                            name: toStringSafe(item.name || item.displayName || ''),
                            university: toStringSafe(item.university || item.targetUniversity || ''),
                            studyHours: toNumber((_a = item.studyHours) !== null && _a !== void 0 ? _a : item.weeklyStudyHours),
                            completion: toNumber((_b = item.completion) !== null && _b !== void 0 ? _b : item.completionRate),
                        });
                    })
                    : [];
                auditLogs = Array.isArray(response === null || response === void 0 ? void 0 : response.auditLogs)
                    ? response.auditLogs.map(function (item) { return ({
                        id: Number(item.id) || 0,
                        title: toStringSafe(item.title || item.action || ''),
                        description: toStringSafe(item.description || item.detail || ''),
                        actor: toNullableString(item.actor || item.actor_name) || undefined,
                        created_at: toNullableString(item.created_at || item.createdAt) || null,
                    }); })
                    : [];
                administrators = Array.isArray(response === null || response === void 0 ? void 0 : response.administrators)
                    ? response.administrators
                        .map(function (name) { return toStringSafe(name).trim(); })
                        .filter(function (name) { return Boolean(name); })
                    : [];
                return [2 /*return*/, {
                        metrics: metrics,
                        studentProgress: studentProgress,
                        auditLogs: auditLogs,
                        administrators: administrators,
                        securityNote: toNullableString(response === null || response === void 0 ? void 0 : response.securityNote) || undefined,
                    }];
        }
    });
}); };
exports.fetchAdminDashboard = fetchAdminDashboard;
var fetchAdminSettings = function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, settings, result;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, (0, api_1.apiRequest)({ path: '/admin/settings' })];
            case 1:
                response = _b.sent();
                settings = (_a = response === null || response === void 0 ? void 0 : response.settings) !== null && _a !== void 0 ? _a : {};
                result = {};
                Object.keys(settings).forEach(function (key) {
                    var value = settings[key];
                    if (value !== undefined && value !== null) {
                        result[key] = toStringSafe(value);
                    }
                });
                return [2 /*return*/, result];
        }
    });
}); };
exports.fetchAdminSettings = fetchAdminSettings;
var updateAdminSettings = function (settings) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, api_1.apiRequest)({ path: '/admin/settings', method: 'PUT', data: { settings: settings } })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.updateAdminSettings = updateAdminSettings;
var fetchAdminUsers = function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, rows;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, api_1.apiRequest)({ path: '/admin/users' })];
            case 1:
                response = _a.sent();
                rows = Array.isArray(response === null || response === void 0 ? void 0 : response.users) ? response.users : [];
                return [2 /*return*/, rows.map(function (row) { return ({
                        id: Number(row.id) || 0,
                        username: toStringSafe(row.username),
                        displayName: toStringSafe(row.displayName || row.display_name || row.username),
                        role: toStringSafe(row.role || row.user_role || 'student'),
                        email: toNullableString(row.email),
                        created_at: toNullableString(row.created_at || row.createdAt) || null,
                        updated_at: toNullableString(row.updated_at || row.updatedAt) || null,
                    }); })];
        }
    });
}); };
exports.fetchAdminUsers = fetchAdminUsers;
var createAdminUser = function (payload) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, api_1.apiRequest)({ path: '/admin/users', method: 'POST', data: payload })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.createAdminUser = createAdminUser;
var updateAdminUser = function (id, payload) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, api_1.apiRequest)({ path: "/admin/users/".concat(id), method: 'PUT', data: payload })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.updateAdminUser = updateAdminUser;
var deleteAdminUser = function (id) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, api_1.apiRequest)({ path: "/admin/users/".concat(id), method: 'DELETE' })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.deleteAdminUser = deleteAdminUser;
var fetchMajors = function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, rows;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, api_1.apiRequest)({ path: '/admin/majors' })];
            case 1:
                response = _a.sent();
                rows = Array.isArray(response === null || response === void 0 ? void 0 : response.majors) ? response.majors : [];
                return [2 /*return*/, rows.map(function (row) { return ({
                        id: Number(row.id) || 0,
                        name: toStringSafe(row.name || row.title || '未命名专业'),
                        description: toNullableString(row.description || row.detail || row.intro),
                    }); })];
        }
    });
}); };
exports.fetchMajors = fetchMajors;
var createMajor = function (payload) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, api_1.apiRequest)({ path: '/admin/majors', method: 'POST', data: payload })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.createMajor = createMajor;
var deleteMajor = function (id) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, api_1.apiRequest)({ path: "/admin/majors/".concat(id), method: 'DELETE' })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.deleteMajor = deleteMajor;
var fetchCourses = function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, rows;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, api_1.apiRequest)({ path: '/admin/courses' })];
            case 1:
                response = _a.sent();
                rows = Array.isArray(response === null || response === void 0 ? void 0 : response.courses) ? response.courses : [];
                return [2 /*return*/, rows.map(function (row) { return ({
                        id: Number(row.id) || 0,
                        title: toStringSafe(row.title || row.name || '未命名课程'),
                        description: toNullableString(row.description || row.detail || row.intro),
                        teacher: toNullableString(row.teacher || row.instructor) || null,
                        credit: toNullableNumber(row.credit),
                        majorId: toNullableNumber(row.majorId || row.major_id),
                        majorName: toNullableString(row.majorName || row.major_name),
                    }); })];
        }
    });
}); };
exports.fetchCourses = fetchCourses;
var createCourse = function (payload) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, api_1.apiRequest)({ path: '/admin/courses', method: 'POST', data: payload })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.createCourse = createCourse;
var deleteCourse = function (id) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, api_1.apiRequest)({ path: "/admin/courses/".concat(id), method: 'DELETE' })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.deleteCourse = deleteCourse;
var fetchMaterials = function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, rows;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, api_1.apiRequest)({ path: '/admin/materials' })];
            case 1:
                response = _a.sent();
                rows = Array.isArray(response === null || response === void 0 ? void 0 : response.materials) ? response.materials : [];
                return [2 /*return*/, rows.map(function (row) { return ({
                        id: Number(row.id) || 0,
                        title: toStringSafe(row.title || row.name || '未命名资料'),
                        description: toNullableString(row.description || row.detail || row.intro),
                        fileUrl: toNullableString(row.fileUrl || row.file_url || row.url),
                        courseId: toNullableNumber(row.courseId || row.course_id),
                        courseTitle: toNullableString(row.courseTitle || row.course_title),
                    }); })];
        }
    });
}); };
exports.fetchMaterials = fetchMaterials;
var createMaterial = function (payload) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, api_1.apiRequest)({ path: '/admin/materials', method: 'POST', data: payload })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.createMaterial = createMaterial;
var deleteMaterial = function (id) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, api_1.apiRequest)({ path: "/admin/materials/".concat(id), method: 'DELETE' })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.deleteMaterial = deleteMaterial;
var fetchForumTopics = function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, rows;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, api_1.apiRequest)({ path: '/admin/forum/topics' })];
            case 1:
                response = _a.sent();
                rows = Array.isArray(response === null || response === void 0 ? void 0 : response.topics) ? response.topics : [];
                return [2 /*return*/, rows.map(function (row) { return ({
                        id: Number(row.id) || 0,
                        title: toStringSafe(row.title || row.name || '未命名话题'),
                        description: toNullableString(row.description || row.detail),
                        created_at: toNullableString(row.created_at || row.createdAt) || null,
                        updated_at: toNullableString(row.updated_at || row.updatedAt) || null,
                    }); })];
        }
    });
}); };
exports.fetchForumTopics = fetchForumTopics;
var fetchForumPosts = function (topicId) { return __awaiter(void 0, void 0, void 0, function () {
    var response, rows;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, api_1.apiRequest)({
                    path: "/admin/forum/topics/".concat(topicId, "/posts"),
                })];
            case 1:
                response = _a.sent();
                rows = Array.isArray(response === null || response === void 0 ? void 0 : response.posts) ? response.posts : [];
                return [2 /*return*/, rows.map(function (row) { return ({
                        id: Number(row.id) || 0,
                        content: toStringSafe(row.content || row.body || ''),
                        author: toNullableString(row.author || row.author_name) || undefined,
                        created_at: toNullableString(row.created_at || row.createdAt) || null,
                        updated_at: toNullableString(row.updated_at || row.updatedAt) || null,
                    }); })];
        }
    });
}); };
exports.fetchForumPosts = fetchForumPosts;
var deleteForumTopic = function (topicId) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, api_1.apiRequest)({ path: "/admin/forum/topics/".concat(topicId), method: 'DELETE' })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.deleteForumTopic = deleteForumTopic;
var deleteForumPost = function (postId) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, api_1.apiRequest)({ path: "/admin/forum/posts/".concat(postId), method: 'DELETE' })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.deleteForumPost = deleteForumPost;
var fetchAdminStatistics = function () { return __awaiter(void 0, void 0, void 0, function () {
    var response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, api_1.apiRequest)({ path: '/admin/statistics/overview' })];
            case 1:
                response = _a.sent();
                return [2 /*return*/, {
                        totalUsers: toNumber(response === null || response === void 0 ? void 0 : response.totalUsers),
                        totalMajors: toNumber(response === null || response === void 0 ? void 0 : response.totalMajors),
                        totalCourses: toNumber(response === null || response === void 0 ? void 0 : response.totalCourses),
                        totalMaterials: toNumber(response === null || response === void 0 ? void 0 : response.totalMaterials),
                        totalPracticeSets: toNumber(response === null || response === void 0 ? void 0 : response.totalPracticeSets),
                        totalForumPosts: toNumber(response === null || response === void 0 ? void 0 : response.totalForumPosts),
                        lastUpdatedAt: toNullableString(response === null || response === void 0 ? void 0 : response.lastUpdatedAt) || null,
                    }];
        }
    });
}); };
exports.fetchAdminStatistics = fetchAdminStatistics;
var searchAdminData = function (keyword) { return __awaiter(void 0, void 0, void 0, function () {
    var response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, api_1.apiRequest)({
                    path: '/admin/statistics/search',
                    data: { keyword: keyword },
                })];
            case 1:
                response = _a.sent();
                return [2 /*return*/, {
                        users: Array.isArray(response === null || response === void 0 ? void 0 : response.users)
                            ? response.users.map(function (user) { return ({
                                id: Number(user.id) || 0,
                                username: toStringSafe(user.username),
                                displayName: toStringSafe(user.displayName || user.display_name || user.username),
                                role: toStringSafe(user.role || 'student'),
                                email: toNullableString(user.email),
                                created_at: toNullableString(user.created_at || user.createdAt) || null,
                                updated_at: toNullableString(user.updated_at || user.updatedAt) || null,
                            }); })
                            : [],
                        majors: Array.isArray(response === null || response === void 0 ? void 0 : response.majors)
                            ? response.majors.map(function (major) { return ({
                                id: Number(major.id) || 0,
                                name: toStringSafe(major.name || major.title || '未命名专业'),
                                description: toNullableString(major.description || major.detail || major.intro),
                            }); })
                            : [],
                        courses: Array.isArray(response === null || response === void 0 ? void 0 : response.courses)
                            ? response.courses.map(function (course) { return ({
                                id: Number(course.id) || 0,
                                title: toStringSafe(course.title || course.name || '未命名课程'),
                                description: toNullableString(course.description || course.detail || course.intro),
                                teacher: toNullableString(course.teacher || course.instructor) || null,
                                credit: toNullableNumber(course.credit),
                                majorId: toNullableNumber(course.majorId || course.major_id),
                                majorName: toNullableString(course.majorName || course.major_name),
                            }); })
                            : [],
                        materials: Array.isArray(response === null || response === void 0 ? void 0 : response.materials)
                            ? response.materials.map(function (material) { return ({
                                id: Number(material.id) || 0,
                                title: toStringSafe(material.title || material.name || '未命名资料'),
                                description: toNullableString(material.description || material.detail || material.intro),
                                fileUrl: toNullableString(material.fileUrl || material.file_url || material.url),
                                courseId: toNullableNumber(material.courseId || material.course_id),
                                courseTitle: toNullableString(material.courseTitle || material.course_title),
                            }); })
                            : [],
                        forumTopics: Array.isArray(response === null || response === void 0 ? void 0 : response.forumTopics)
                            ? response.forumTopics.map(function (topic) { return ({
                                id: Number(topic.id) || 0,
                                title: toStringSafe(topic.title || topic.name || '未命名话题'),
                                description: toNullableString(topic.description || topic.detail),
                            }); })
                            : [],
                    }];
        }
    });
}); };
exports.searchAdminData = searchAdminData;
