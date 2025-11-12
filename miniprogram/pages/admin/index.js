"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var admin_1 = require("../../data/admin");
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
var roleOptions = [
    { value: 'student', label: '学员' },
    { value: 'admin', label: '管理员' },
];
var sectionKeys = tabs.map(function (item) { return item.id; });
var createSectionState = function (initialValue) {
    var state = {};
    sectionKeys.forEach(function (key) {
        state[key] = initialValue;
    });
    return state;
};
var createUserForm = function () { return ({
    username: '',
    password: '',
    displayName: '',
    email: '',
}); };
var createMajorForm = function () { return ({ name: '', description: '' }); };
var createCourseForm = function (majors) {
    if (majors === void 0) { majors = []; }
    return {
        title: '',
        teacher: '',
        credit: '',
        description: '',
        majorId: majors[0] ? String(majors[0].id) : '',
    };
};
var createMaterialForm = function (courses) {
    if (courses === void 0) { courses = []; }
    return {
        title: '',
        description: '',
        fileUrl: '',
        courseId: courses[0] ? String(courses[0].id) : '',
    };
};
var createFieldNoteForm = function () { return ({
    title: '',
    description: '',
    photos: [],
    locationName: '',
    latitude: null,
    longitude: null,
}); };
var createSettingsForm = function (settings) {
    if (settings === void 0) { settings = {}; }
    return {
        platform_name: settings.platform_name || '',
        support_email: settings.support_email || '',
        security_note: settings.security_note || '',
    };
};
var formatDateTime = function (value) {
    var date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '刚刚';
    }
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, '0');
    var day = String(date.getDate()).padStart(2, '0');
    var hour = String(date.getHours()).padStart(2, '0');
    var minute = String(date.getMinutes()).padStart(2, '0');
    return "".concat(year, "-").concat(month, "-").concat(day, " ").concat(hour, ":").concat(minute);
};
var cloneMetrics = function () { return admin_1.adminMetricsSeed.map(function (item) { return ({
    id: String(item.id),
    label: item.label,
    value: item.value,
}); }); };
var cloneStudentProgress = function () { return admin_1.adminStudentProgressSeed.map(function (item) { return ({
    id: String(item.id),
    name: item.name,
    university: item.university,
    studyHours: item.studyHours,
    completion: item.completion,
}); }); };
var cloneAuditLogs = function () { return admin_1.adminAuditLogSeed.map(function (item) { return ({
    id: String(item.id),
    title: item.title,
    description: item.description,
    actor: item.actor,
    created_at: item.createdAt,
}); }); };
var cloneAdministrators = function () { return admin_1.adminAdministratorsSeed.slice(); };
var cloneUsers = function () { return admin_1.adminUsersSeed.map(function (user) { return ({
    id: String(user.id),
    username: user.username,
    displayName: user.displayName,
    email: user.email,
    role: user.role === 'admin' ? 'admin' : 'student',
    created_at: user.createdAt || '刚刚',
}); }); };
var cloneMajors = function () { return admin_1.adminMajorsSeed.map(function (major) { return ({
    id: String(major.id),
    name: major.name,
    description: major.description,
}); }); };
var cloneCourses = function (majors) {
    if (majors === void 0) { majors = []; }
    var majorMap = {};
    majors.forEach(function (major) {
        majorMap[String(major.id)] = major.name;
    });
    return admin_1.adminCoursesSeed.map(function (course) {
        var majorId = String(course.majorId || '');
        return {
            id: String(course.id),
            title: course.title,
            description: course.description,
            teacher: course.teacher || '',
            credit: course.credit != null ? String(course.credit) : '',
            majorId: majorId,
            majorName: majorMap[majorId] || course.majorName || '未关联',
        };
    });
};
var cloneMaterials = function (courses) {
    if (courses === void 0) { courses = []; }
    var courseMap = {};
    courses.forEach(function (course) {
        courseMap[String(course.id)] = course.title;
    });
    return admin_1.adminMaterialsSeed.map(function (material) {
        var courseId = String(material.courseId || '');
        return {
            id: String(material.id),
            title: material.title,
            description: material.description,
            fileUrl: material.fileUrl || '',
            courseId: courseId,
            courseTitle: courseMap[courseId] || material.courseTitle || '未关联',
        };
    });
};
var cloneForumData = function () {
    var postsMap = Object.create(null);
    var topics = admin_1.adminForumTopicsSeed.map(function (topic) {
        var id = String(topic.id);
        var posts = Array.isArray(admin_1.adminForumPostsSeed[topic.id]) ? admin_1.adminForumPostsSeed[topic.id] : [];
        postsMap[id] = posts.map(function (post) { return ({
            id: String(post.id),
            content: post.content,
            author: post.author || '示例管理员',
            created_at: post.createdAt || '刚刚',
            updated_at: post.updatedAt || '',
        }); });
        return {
            id: id,
            title: topic.title,
            description: topic.description || '暂无描述',
            created_at: topic.createdAt || '刚刚',
            updated_at: topic.updatedAt || '',
        };
    });
    var selectedId = topics[0] ? topics[0].id : '';
    return { topics: topics, postsMap: postsMap, selectedId: selectedId, posts: selectedId ? postsMap[selectedId] || [] : [] };
};
var buildToolkitInsights = function (metrics, notes) {
    if (metrics === void 0) { metrics = []; }
    if (notes === void 0) { notes = []; }
    var unresolved = notes.filter(function (note) { return !note.resolved; }).length;
    var latest = notes[0] ? notes[0].createdText : '暂无巡课记录';
    return [
        {
            id: 'students',
            title: '学员概况',
            description: metrics.length ? "当前活跃学员 " + metrics[0].value + " 人" : '正在收集数据…',
        },
        {
            id: 'fieldNotes',
            title: '巡课速记',
            description: unresolved > 0 ? "待处理记录 " + unresolved + " 条" : '所有巡课记录均已处理。',
        },
        {
            id: 'latest',
            title: '最近动态',
            description: "最近更新：".concat(latest),
        },
    ];
};
var keywordMatch = function (keyword, text) {
    if (!keyword) {
        return false;
    }
    if (!text) {
        return false;
    }
    return String(text).toLowerCase().includes(keyword.toLowerCase());
};
Page({
    data: {
        tabs: tabs,
        activeTab: 'overview',
        sectionLoading: createSectionState(false),
        sectionErrors: createSectionState(''),
        metricsCards: [],
        studentProgress: [],
        auditLogs: [],
        administrators: [],
        referenceSites: admin_1.adminReferenceSites,
        dashboardNote: admin_1.adminDashboardNote,
        settingsForm: createSettingsForm(admin_1.adminSettingsSeed),
        settingsMessage: '',
        settingsFormError: '',
        settingsSubmitting: false,
        roleOptions: roleOptions,
        users: [],
        userFormVisible: false,
        userForm: createUserForm(),
        userRoleIndex: 0,
        userFormError: '',
        userSubmitting: false,
        majors: [],
        majorFormVisible: false,
        majorForm: createMajorForm(),
        majorFormError: '',
        majorSubmitting: false,
        courses: [],
        courseFormVisible: false,
        courseForm: createCourseForm(),
        courseFormError: '',
        courseSubmitting: false,
        majorsForCourses: [],
        courseFormMajorIndex: 0,
        materials: [],
        materialFormVisible: false,
        materialForm: createMaterialForm(),
        materialFormError: '',
        materialSubmitting: false,
        coursesForMaterials: [],
        materialFormCourseIndex: 0,
        forumTopics: [],
        forumPosts: [],
        forumPostsLoading: false,
        forumPostsError: '',
        selectedTopicId: '',
        statistics: Object.assign({}, admin_1.adminStatisticsSeed),
        statisticsSearchKeyword: '',
        statisticsSearchLoading: false,
        statisticsSearchError: '',
        statisticsSearchResult: null,
        mobileFieldNotes: [],
        fieldNoteFormVisible: false,
        fieldNoteForm: createFieldNoteForm(),
        fieldNoteFormError: '',
        fieldNoteSubmitting: false,
        fieldNoteLocationLoading: false,
        mobileToolkitInsights: [],
    },
    onLoad: function () {
        this.bootstrap();
    },
    bootstrap: function () {
        var metricsCards = cloneMetrics();
        var studentProgress = cloneStudentProgress();
        var auditLogs = cloneAuditLogs();
        var administrators = cloneAdministrators();
        var users = cloneUsers();
        var majors = cloneMajors();
        var courses = cloneCourses(majors);
        var materials = cloneMaterials(courses);
        var forumData = cloneForumData();
        this.forumPostsMap = forumData.postsMap;
        this.setData({
            metricsCards: metricsCards,
            studentProgress: studentProgress,
            auditLogs: auditLogs,
            administrators: administrators,
            users: users,
            majors: majors,
            majorsForCourses: majors,
            courses: courses,
            coursesForMaterials: courses,
            materials: materials,
            forumTopics: forumData.topics,
            forumPosts: forumData.posts,
            selectedTopicId: forumData.selectedId,
            statistics: Object.assign({}, admin_1.adminStatisticsSeed),
            mobileFieldNotes: [],
            mobileToolkitInsights: buildToolkitInsights(metricsCards, []),
            sectionLoading: createSectionState(false),
            sectionErrors: createSectionState(''),
            courseForm: createCourseForm(majors),
            courseFormMajorIndex: 0,
            materialForm: createMaterialForm(courses),
            materialFormCourseIndex: 0,
            userRoleIndex: 0,
        });
        this.recalculateStatistics();
    },
    _getData: function () {
        var _a;
        if (((_a = this.data.sectionLoading) === null || _a === void 0 ? void 0 : _a.overview) && typeof this.loadOverview === 'function') {
            try {
                this.loadOverview();
            }
            catch (error) {
                console.warn('加载后台总览数据失败', error);
            }
        }
        return Promise.resolve({
            metricsCards: this.data.metricsCards,
            studentProgress: this.data.studentProgress,
            auditLogs: this.data.auditLogs,
            administrators: this.data.administrators,
            dashboardNote: this.data.dashboardNote,
        });
    },
    switchTab: function (event) {
        var _a, _b;
        var tab = (_b = (_a = event.currentTarget) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b.tab;
        if (!tab || tab === this.data.activeTab) {
            return;
        }
        this.setData({ activeTab: tab });
        if (tab === 'forum' && this.data.selectedTopicId && !this.forumPostsMap[this.data.selectedTopicId]) {
            this.setData({ forumPosts: [] });
        }
    },
    retrySection: function (event) {
        var _a, _b;
        var tab = (_b = (_a = event.currentTarget) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b.tab;
        if (!tab) {
            return;
        }
        switch (tab) {
            case 'overview':
                this.applyOverviewSeed();
                break;
            case 'settings':
                this.applySettingsSeed();
                break;
            case 'users':
                this.applyUsersSeed();
                break;
            case 'majors':
                this.applyMajorsSeed();
                break;
            case 'courses':
                this.applyCoursesSeed();
                break;
            case 'materials':
                this.applyMaterialsSeed();
                break;
            case 'forum':
                this.applyForumSeed();
                break;
            case 'mobileToolkit':
                this.applyMobileToolkitSeed();
                break;
            case 'statistics':
                this.applyStatisticsSeed();
                break;
            default:
                break;
        }
    },
    applyOverviewSeed: function () {
        var metricsCards = cloneMetrics();
        var studentProgress = cloneStudentProgress();
        var auditLogs = cloneAuditLogs();
        var administrators = cloneAdministrators();
        this.setData({
            metricsCards: metricsCards,
            studentProgress: studentProgress,
            auditLogs: auditLogs,
            administrators: administrators,
            dashboardNote: admin_1.adminDashboardNote,
            mobileToolkitInsights: buildToolkitInsights(metricsCards, this.data.mobileFieldNotes),
            'sectionErrors.overview': '',
        });
    },
    applySettingsSeed: function () {
        this.setData({
            settingsForm: createSettingsForm(admin_1.adminSettingsSeed),
            settingsFormError: '',
            settingsMessage: '',
        });
    },
    applyUsersSeed: function () {
        this.setData({ users: cloneUsers(), userFormError: '', userSubmitting: false });
        this.recalculateStatistics();
    },
    applyMajorsSeed: function () {
        var majors = cloneMajors();
        this.setData({
            majors: majors,
            majorsForCourses: majors,
            majorFormError: '',
            majorSubmitting: false,
            courseForm: createCourseForm(majors),
            courseFormMajorIndex: 0,
        });
    },
    applyCoursesSeed: function () {
        var courses = cloneCourses(this.data.majors);
        this.setData({
            courses: courses,
            coursesForMaterials: courses,
            courseFormError: '',
            courseSubmitting: false,
            courseForm: createCourseForm(this.data.majors),
            courseFormMajorIndex: 0,
        });
        this.recalculateStatistics();
    },
    applyMaterialsSeed: function () {
        var materials = cloneMaterials(this.data.courses);
        this.setData({
            materials: materials,
            materialFormError: '',
            materialSubmitting: false,
            materialForm: createMaterialForm(this.data.courses),
            materialFormCourseIndex: 0,
        });
        this.recalculateStatistics();
    },
    applyForumSeed: function () {
        var forumData = cloneForumData();
        this.forumPostsMap = forumData.postsMap;
        this.setData({
            forumTopics: forumData.topics,
            forumPosts: forumData.posts,
            selectedTopicId: forumData.selectedId,
            forumPostsError: '',
        });
        this.recalculateStatistics();
    },
    applyMobileToolkitSeed: function () {
        this.setData({
            mobileFieldNotes: [],
            fieldNoteForm: createFieldNoteForm(),
            fieldNoteFormError: '',
            fieldNoteSubmitting: false,
            fieldNoteLocationLoading: false,
            mobileToolkitInsights: buildToolkitInsights(this.data.metricsCards, []),
        });
    },
    applyStatisticsSeed: function () {
        this.setData({ statistics: Object.assign({}, admin_1.adminStatisticsSeed), statisticsSearchKeyword: '', statisticsSearchResult: null, statisticsSearchError: '' });
    },
    copyLink: function (event) {
        var _a, _b;
        var url = (_b = (_a = event.currentTarget) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b.url;
        if (!url) {
            return;
        }
        if (typeof wx !== 'undefined' && wx.setClipboardData) {
            wx.setClipboardData({
                data: url,
                success: function () {
                    wx.showToast && wx.showToast({ title: '已复制到剪贴板' });
                },
            });
            return;
        }
        console.log('复制链接：', url);
    },
    handleSettingsInput: function (event) {
        var _a, _b, _c;
        var field = (_b = (_a = event.currentTarget) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b.field;
        if (!field) {
            return;
        }
        var value = ((_c = event.detail) === null || _c === void 0 ? void 0 : _c.value) || '';
        this.setData({
            settingsForm: Object.assign(Object.assign({}, this.data.settingsForm), (_d = {}, _d[field] = value, _d)),
            settingsFormError: '',
            settingsMessage: '',
        });
        var _d;
    },
    submitSettings: function () {
        var form = this.data.settingsForm;
        if (!form.platform_name || !form.platform_name.trim()) {
            this.setData({ settingsFormError: '请填写平台名称' });
            return;
        }
        this.setData({ settingsSubmitting: true, settingsFormError: '' });
        var _this = this;
        setTimeout(function () {
            _this.setData({
                settingsSubmitting: false,
                settingsMessage: '设置已保存（示例环境）',
            });
        }, 300);
    },
    openUserForm: function () {
        this.setData({
            userFormVisible: true,
            userForm: createUserForm(),
            userRoleIndex: 0,
            userFormError: '',
            userSubmitting: false,
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
        });
    },
    handleUserInput: function (event) {
        var _a, _b, _c;
        var field = (_b = (_a = event.currentTarget) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b.field;
        if (!field) {
            return;
        }
        var value = ((_c = event.detail) === null || _c === void 0 ? void 0 : _c.value) || '';
        this.setData({
            userForm: Object.assign(Object.assign({}, this.data.userForm), (_d = {}, _d[field] = value, _d)),
            userFormError: '',
        });
        var _d;
    },
    handleUserRolePicker: function (event) {
        var index = Number((event.detail || {}).value || 0);
        this.setData({ userRoleIndex: index });
    },
    submitUserForm: function () {
        var form = this.data.userForm;
        if (!form.username || !form.username.trim()) {
            this.setData({ userFormError: '请填写用户名' });
            return;
        }
        if (!form.password || !form.password.trim()) {
            this.setData({ userFormError: '请填写密码' });
            return;
        }
        var roleOption = roleOptions[this.data.userRoleIndex] || roleOptions[0];
        var user = {
            id: "user_".concat(Date.now()),
            username: form.username.trim(),
            displayName: form.displayName.trim() || form.username.trim(),
            email: form.email.trim(),
            role: roleOption.value,
            created_at: formatDateTime(new Date()),
        };
        this.setData({
            users: [user].concat(this.data.users),
            userFormVisible: false,
            userForm: createUserForm(),
            userFormError: '',
            userSubmitting: false,
        });
        this.recalculateStatistics();
    },
    handleUserRoleChange: function (event) {
        var _a, _b;
        var id = (_b = (_a = event.currentTarget) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b.id;
        if (!id) {
            return;
        }
        var index = Number((event.detail || {}).value || 0);
        var role = roleOptions[index] ? roleOptions[index].value : 'student';
        var users = this.data.users.map(function (user) {
            return user.id === id ? Object.assign(Object.assign({}, user), { role: role }) : user;
        });
        this.setData({ users: users });
    },
    confirmDeleteUser: function (event) {
        var _this = this;
        var _a, _b, _c;
        var id = (_b = (_a = event.currentTarget) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b.id;
        var name = ((_c = event.currentTarget) === null || _c === void 0 ? void 0 : _c.dataset) ? event.currentTarget.dataset.name : '';
        if (!id) {
            return;
        }
        var remove = function () {
            var users = _this.data.users.filter(function (user) { return user.id !== id; });
            _this.setData({ users: users });
            _this.recalculateStatistics();
        };
        if (typeof wx !== 'undefined' && wx.showModal) {
            wx.showModal({
                title: '删除用户',
                content: name ? "确认删除 ".concat(name, " 吗？") : '确认删除该用户吗？',
                success: function (res) {
                    if (res.confirm) {
                        remove();
                    }
                },
            });
            return;
        }
        remove();
    },
    openMajorForm: function () {
        this.setData({ majorFormVisible: true, majorForm: createMajorForm(), majorFormError: '', majorSubmitting: false });
    },
    closeMajorForm: function () {
        if (this.data.majorSubmitting) {
            return;
        }
        this.setData({ majorFormVisible: false, majorForm: createMajorForm(), majorFormError: '' });
    },
    handleMajorInput: function (event) {
        var _a, _b, _c;
        var field = (_b = (_a = event.currentTarget) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b.field;
        if (!field) {
            return;
        }
        var value = ((_c = event.detail) === null || _c === void 0 ? void 0 : _c.value) || '';
        this.setData({
            majorForm: Object.assign(Object.assign({}, this.data.majorForm), (_d = {}, _d[field] = value, _d)),
            majorFormError: '',
        });
        var _d;
    },
    submitMajorForm: function () {
        var form = this.data.majorForm;
        if (!form.name || !form.name.trim()) {
            this.setData({ majorFormError: '请填写专业名称' });
            return;
        }
        var major = {
            id: "major_".concat(Date.now()),
            name: form.name.trim(),
            description: form.description.trim(),
        };
        var majors = [major].concat(this.data.majors);
        this.setData({
            majors: majors,
            majorsForCourses: majors,
            majorFormVisible: false,
            majorForm: createMajorForm(),
            majorFormError: '',
        });
        this.recalculateStatistics();
    },
    confirmDeleteMajor: function (event) {
        var _this = this;
        var _a, _b, _c;
        var id = (_b = (_a = event.currentTarget) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b.id;
        var name = ((_c = event.currentTarget) === null || _c === void 0 ? void 0 : _c.dataset) ? event.currentTarget.dataset.name : '';
        if (!id) {
            return;
        }
        var remove = function () {
            var majors = _this.data.majors.filter(function (major) { return major.id !== id; });
            var courses = _this.data.courses.map(function (course) {
                if (course.majorId === id) {
                    return Object.assign(Object.assign({}, course), { majorId: '', majorName: '未关联' });
                }
                return course;
            });
            _this.setData({ majors: majors, majorsForCourses: majors, courses: courses });
            _this.recalculateStatistics();
        };
        if (typeof wx !== 'undefined' && wx.showModal) {
            wx.showModal({
                title: '删除专业',
                content: name ? "确认删除 ".concat(name, " 吗？") : '确认删除该专业吗？',
                success: function (res) {
                    if (res.confirm) {
                        remove();
                    }
                },
            });
            return;
        }
        remove();
    },
    openCourseForm: function () {
        this.setData({
            courseFormVisible: true,
            courseForm: createCourseForm(this.data.majorsForCourses),
            courseFormError: '',
            courseSubmitting: false,
            courseFormMajorIndex: 0,
        });
    },
    closeCourseForm: function () {
        if (this.data.courseSubmitting) {
            return;
        }
        this.setData({
            courseFormVisible: false,
            courseForm: createCourseForm(this.data.majorsForCourses),
            courseFormError: '',
        });
    },
    handleCourseInput: function (event) {
        var _a, _b, _c;
        var field = (_b = (_a = event.currentTarget) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b.field;
        if (!field) {
            return;
        }
        var value = ((_c = event.detail) === null || _c === void 0 ? void 0 : _c.value) || '';
        this.setData({
            courseForm: Object.assign(Object.assign({}, this.data.courseForm), (_d = {}, _d[field] = value, _d)),
            courseFormError: '',
        });
        var _d;
    },
    handleCourseMajorChange: function (event) {
        var index = Number((event.detail || {}).value || 0);
        var majors = this.data.majorsForCourses;
        var majorId = majors[index] ? String(majors[index].id) : '';
        this.setData({ courseFormMajorIndex: index, courseForm: Object.assign(Object.assign({}, this.data.courseForm), { majorId: majorId }) });
    },
    submitCourseForm: function () {
        var form = this.data.courseForm;
        if (!form.title || !form.title.trim()) {
            this.setData({ courseFormError: '请填写课程名称' });
            return;
        }
        var majors = this.data.majorsForCourses;
        var index = this.data.courseFormMajorIndex;
        var majorId = majors[index] ? String(majors[index].id) : '';
        var majorName = majors[index] ? majors[index].name : '未关联';
        var course = {
            id: "course_".concat(Date.now()),
            title: form.title.trim(),
            description: form.description.trim(),
            teacher: form.teacher.trim(),
            credit: form.credit,
            majorId: majorId,
            majorName: majorName,
        };
        var courses = [course].concat(this.data.courses);
        this.setData({
            courses: courses,
            coursesForMaterials: courses,
            courseFormVisible: false,
            courseForm: createCourseForm(this.data.majorsForCourses),
            courseFormError: '',
        });
        this.recalculateStatistics();
    },
    confirmDeleteCourse: function (event) {
        var _this = this;
        var _a, _b, _c;
        var id = (_b = (_a = event.currentTarget) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b.id;
        var name = ((_c = event.currentTarget) === null || _c === void 0 ? void 0 : _c.dataset) ? event.currentTarget.dataset.name : '';
        if (!id) {
            return;
        }
        var remove = function () {
            var courses = _this.data.courses.filter(function (course) { return course.id !== id; });
            var materials = _this.data.materials.map(function (material) {
                if (material.courseId === id) {
                    return Object.assign(Object.assign({}, material), { courseId: '', courseTitle: '未关联' });
                }
                return material;
            });
            _this.setData({ courses: courses, coursesForMaterials: courses, materials: materials });
            _this.recalculateStatistics();
        };
        if (typeof wx !== 'undefined' && wx.showModal) {
            wx.showModal({
                title: '删除课程',
                content: name ? "确认删除 ".concat(name, " 吗？") : '确认删除该课程吗？',
                success: function (res) {
                    if (res.confirm) {
                        remove();
                    }
                },
            });
            return;
        }
        remove();
    },
    openMaterialForm: function () {
        this.setData({
            materialFormVisible: true,
            materialForm: createMaterialForm(this.data.coursesForMaterials),
            materialFormError: '',
            materialSubmitting: false,
            materialFormCourseIndex: 0,
        });
    },
    closeMaterialForm: function () {
        if (this.data.materialSubmitting) {
            return;
        }
        this.setData({
            materialFormVisible: false,
            materialForm: createMaterialForm(this.data.coursesForMaterials),
            materialFormError: '',
        });
    },
    handleMaterialInput: function (event) {
        var _a, _b, _c;
        var field = (_b = (_a = event.currentTarget) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b.field;
        if (!field) {
            return;
        }
        var value = ((_c = event.detail) === null || _c === void 0 ? void 0 : _c.value) || '';
        this.setData({
            materialForm: Object.assign(Object.assign({}, this.data.materialForm), (_d = {}, _d[field] = value, _d)),
            materialFormError: '',
        });
        var _d;
    },
    handleMaterialCourseChange: function (event) {
        var index = Number((event.detail || {}).value || 0);
        var courses = this.data.coursesForMaterials;
        var courseId = courses[index] ? String(courses[index].id) : '';
        this.setData({ materialFormCourseIndex: index, materialForm: Object.assign(Object.assign({}, this.data.materialForm), { courseId: courseId }) });
    },
    submitMaterialForm: function () {
        var form = this.data.materialForm;
        if (!form.title || !form.title.trim()) {
            this.setData({ materialFormError: '请填写资料标题' });
            return;
        }
        var courses = this.data.coursesForMaterials;
        var index = this.data.materialFormCourseIndex;
        var courseId = courses[index] ? String(courses[index].id) : '';
        var courseTitle = courses[index] ? courses[index].title : '未关联';
        var material = {
            id: "material_".concat(Date.now()),
            title: form.title.trim(),
            description: form.description.trim(),
            fileUrl: form.fileUrl.trim(),
            courseId: courseId,
            courseTitle: courseTitle,
        };
        var materials = [material].concat(this.data.materials);
        this.setData({
            materials: materials,
            materialFormVisible: false,
            materialForm: createMaterialForm(this.data.coursesForMaterials),
            materialFormError: '',
        });
        this.recalculateStatistics();
    },
    confirmDeleteMaterial: function (event) {
        var _this = this;
        var _a, _b, _c;
        var id = (_b = (_a = event.currentTarget) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b.id;
        var name = ((_c = event.currentTarget) === null || _c === void 0 ? void 0 : _c.dataset) ? event.currentTarget.dataset.name : '';
        if (!id) {
            return;
        }
        var remove = function () {
            var materials = _this.data.materials.filter(function (material) { return material.id !== id; });
            _this.setData({ materials: materials });
            _this.recalculateStatistics();
        };
        if (typeof wx !== 'undefined' && wx.showModal) {
            wx.showModal({
                title: '删除资料',
                content: name ? "确认删除 ".concat(name, " 吗？") : '确认删除该资料吗？',
                success: function (res) {
                    if (res.confirm) {
                        remove();
                    }
                },
            });
            return;
        }
        remove();
    },
    handleSelectTopic: function (event) {
        var _a, _b;
        var id = (_b = (_a = event.currentTarget) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b.id;
        if (!id || id === this.data.selectedTopicId) {
            return;
        }
        this.setData({
            selectedTopicId: id,
            forumPosts: this.forumPostsMap[id] || [],
            forumPostsError: '',
        });
    },
    confirmDeleteTopic: function (event) {
        var _this = this;
        var _a, _b, _c;
        var id = (_b = (_a = event.currentTarget) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b.id;
        var name = ((_c = event.currentTarget) === null || _c === void 0 ? void 0 : _c.dataset) ? event.currentTarget.dataset.name : '';
        if (!id) {
            return;
        }
        var remove = function () {
            var topics = _this.data.forumTopics.filter(function (topic) { return topic.id !== id; });
            delete _this.forumPostsMap[id];
            var selectedTopicId = _this.data.selectedTopicId === id && topics[0] ? topics[0].id : _this.data.selectedTopicId;
            var forumPosts = selectedTopicId ? _this.forumPostsMap[selectedTopicId] || [] : [];
            _this.setData({ forumTopics: topics, selectedTopicId: selectedTopicId || '', forumPosts: forumPosts });
            _this.recalculateStatistics();
        };
        if (typeof wx !== 'undefined' && wx.showModal) {
            wx.showModal({
                title: '删除话题',
                content: name ? "确认删除 ".concat(name, " 吗？") : '确认删除该话题吗？',
                success: function (res) {
                    if (res.confirm) {
                        remove();
                    }
                },
            });
            return;
        }
        remove();
    },
    confirmDeletePost: function (event) {
        var _this = this;
        var _a, _b;
        var id = (_b = (_a = event.currentTarget) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b.id;
        var topicId = this.data.selectedTopicId;
        if (!id || !topicId) {
            return;
        }
        var remove = function () {
            var posts = (_this.forumPostsMap[topicId] || []).filter(function (post) { return post.id !== id; });
            _this.forumPostsMap[topicId] = posts;
            _this.setData({ forumPosts: posts });
            _this.recalculateStatistics();
        };
        if (typeof wx !== 'undefined' && wx.showModal) {
            wx.showModal({
                title: '删除帖子',
                content: '确认删除该帖子吗？',
                success: function (res) {
                    if (res.confirm) {
                        remove();
                    }
                },
            });
            return;
        }
        remove();
    },
    openFieldNoteForm: function () {
        this.setData({
            fieldNoteFormVisible: true,
            fieldNoteForm: createFieldNoteForm(),
            fieldNoteFormError: '',
            fieldNoteSubmitting: false,
            fieldNoteLocationLoading: false,
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
        });
    },
    handleFieldNoteInput: function (event) {
        var _a, _b, _c;
        var field = (_b = (_a = event.currentTarget) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b.field;
        if (!field) {
            return;
        }
        var value = ((_c = event.detail) === null || _c === void 0 ? void 0 : _c.value) || '';
        this.setData({
            fieldNoteForm: Object.assign(Object.assign({}, this.data.fieldNoteForm), (_d = {}, _d[field] = value, _d)),
            fieldNoteFormError: '',
        });
        var _d;
    },
    chooseFieldNoteImages: function () {
        var _this = this;
        if (typeof wx !== 'undefined' && wx.chooseImage) {
            wx.chooseImage({
                count: 3,
                success: function (res) {
                    var nextPhotos = (_this.data.fieldNoteForm.photos || []).concat(res.tempFilePaths || []);
                    _this.setData({ 'fieldNoteForm.photos': nextPhotos.slice(0, 6) });
                },
            });
            return;
        }
        var photos = (this.data.fieldNoteForm.photos || []).concat(["photo_".concat(Date.now())]);
        this.setData({ 'fieldNoteForm.photos': photos.slice(0, 6) });
    },
    removeFieldNotePhoto: function (event) {
        var _a, _b;
        var index = Number(((_b = (_a = event.currentTarget) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b.index) || 0);
        var photos = (this.data.fieldNoteForm.photos || []).slice();
        photos.splice(index, 1);
        this.setData({ 'fieldNoteForm.photos': photos });
    },
    previewFieldNotePhoto: function (event) {
        var _a, _b;
        var url = (_b = (_a = event.currentTarget) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b.url;
        if (!url || !(typeof wx !== 'undefined' && wx.previewImage)) {
            return;
        }
        wx.previewImage({
            current: url,
            urls: this.data.fieldNoteForm.photos || [],
        });
    },
    captureFieldNoteLocation: function () {
        var _this = this;
        this.setData({ fieldNoteLocationLoading: true });
        if (typeof wx !== 'undefined' && wx.chooseLocation) {
            wx.chooseLocation({
                success: function (res) {
                    _this.setData({
                        fieldNoteLocationLoading: false,
                        fieldNoteForm: Object.assign(Object.assign({}, _this.data.fieldNoteForm), { locationName: res.name || '自定义地点', latitude: res.latitude || null, longitude: res.longitude || null }),
                    });
                },
                fail: function () {
                    _this.setData({ fieldNoteLocationLoading: false, fieldNoteFormError: '获取定位失败，请手动填写地点。' });
                },
            });
            return;
        }
        this.setData({
            fieldNoteLocationLoading: false,
            fieldNoteForm: Object.assign(Object.assign({}, this.data.fieldNoteForm), { locationName: '示例校区教学楼', latitude: 0, longitude: 0 }),
        });
    },
    submitFieldNote: function () {
        var form = this.data.fieldNoteForm;
        if (!form.title || !form.title.trim()) {
            this.setData({ fieldNoteFormError: '请填写巡课标题' });
            return;
        }
        var now = new Date();
        var note = {
            id: "note_".concat(now.getTime()),
            title: form.title.trim(),
            description: form.description.trim(),
            photos: (form.photos || []).slice(0, 6),
            createdAt: now.toISOString(),
            createdText: formatDateTime(now),
            locationName: form.locationName || '未填写地点',
            latitude: form.latitude,
            longitude: form.longitude,
            resolved: false,
        };
        var notes = [note].concat(this.data.mobileFieldNotes);
        this.setData({
            mobileFieldNotes: notes,
            fieldNoteFormVisible: false,
            fieldNoteForm: createFieldNoteForm(),
            fieldNoteFormError: '',
        });
        this.refreshMobileToolkitInsights(notes);
    },
    toggleFieldNoteResolved: function (event) {
        var _a, _b;
        var id = (_b = (_a = event.currentTarget) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b.id;
        if (!id) {
            return;
        }
        var notes = this.data.mobileFieldNotes.map(function (note) {
            return note.id === id ? Object.assign(Object.assign({}, note), { resolved: !note.resolved }) : note;
        });
        this.setData({ mobileFieldNotes: notes });
        this.refreshMobileToolkitInsights(notes);
    },
    deleteFieldNote: function (event) {
        var _a, _b;
        var id = (_b = (_a = event.currentTarget) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b.id;
        if (!id) {
            return;
        }
        var notes = this.data.mobileFieldNotes.filter(function (note) { return note.id !== id; });
        this.setData({ mobileFieldNotes: notes });
        this.refreshMobileToolkitInsights(notes);
    },
    refreshMobileToolkitInsights: function (notes) {
        if (notes === void 0) { notes = this.data.mobileFieldNotes; }
        this.setData({ mobileToolkitInsights: buildToolkitInsights(this.data.metricsCards, notes) });
    },
    handleStatisticsKeywordInput: function (event) {
        var _a;
        var value = ((_a = event.detail) === null || _a === void 0 ? void 0 : _a.value) || '';
        this.setData({ statisticsSearchKeyword: value, statisticsSearchError: '' });
    },
    submitStatisticsSearch: function () {
        var keyword = (this.data.statisticsSearchKeyword || '').trim();
        if (!keyword) {
            this.setData({ statisticsSearchError: '请输入关键词进行检索。', statisticsSearchResult: null });
            return;
        }
        this.setData({ statisticsSearchLoading: true, statisticsSearchError: '' });
        var lower = keyword.toLowerCase();
        var users = this.data.users.filter(function (user) { return keywordMatch(lower, user.username) || keywordMatch(lower, user.displayName) || keywordMatch(lower, user.email); });
        var majors = this.data.majors.filter(function (major) { return keywordMatch(lower, major.name) || keywordMatch(lower, major.description); });
        var courses = this.data.courses.filter(function (course) { return keywordMatch(lower, course.title) || keywordMatch(lower, course.description) || keywordMatch(lower, course.teacher); });
        var materials = this.data.materials.filter(function (material) { return keywordMatch(lower, material.title) || keywordMatch(lower, material.description); });
        var forumTopics = this.data.forumTopics.filter(function (topic) { return keywordMatch(lower, topic.title) || keywordMatch(lower, topic.description); });
        var result = {
            users: users,
            majors: majors,
            courses: courses,
            materials: materials,
            forumTopics: forumTopics,
        };
        var _this = this;
        setTimeout(function () {
            _this.setData({ statisticsSearchResult: result, statisticsSearchLoading: false });
        }, 200);
    },
    clearStatisticsSearch: function () {
        this.setData({ statisticsSearchKeyword: '', statisticsSearchResult: null, statisticsSearchError: '' });
    },
    recalculateStatistics: function () {
        var statistics = Object.assign({}, this.data.statistics);
        statistics.totalUsers = this.data.users.length;
        statistics.totalMajors = this.data.majors.length;
        statistics.totalCourses = this.data.courses.length;
        statistics.totalMaterials = this.data.materials.length;
        var forumPostCount = 0;
        if (this.forumPostsMap) {
            Object.keys(this.forumPostsMap).forEach(function (key) {
                forumPostCount += (this.forumPostsMap[key] || []).length;
            }, this);
        }
        statistics.totalForumPosts = forumPostCount;
        statistics.lastUpdatedAt = formatDateTime(new Date());
        this.setData({ statistics: statistics });
    },
    forumPostsMap: Object.create(null),
});
