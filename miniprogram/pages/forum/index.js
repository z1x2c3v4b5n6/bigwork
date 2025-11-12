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
var createTopicForm = function () { return ({
    title: '',
    description: '',
    tags: '',
}); };
var createReplyForm = function () { return ({
    content: '',
}); };
var mapTopic = function (topic) {
    var _a, _b, _c, _d, _e;
    return ({
        id: topic.id != null ? String(topic.id) : '',
        title: typeof topic.title === 'string' && topic.title.trim() ? topic.title : '未命名话题',
        description: typeof topic.description === 'string' && topic.description.trim()
            ? topic.description
            : '暂无补充说明',
        likes: Number((_a = topic.likes) !== null && _a !== void 0 ? _a : 0),
        likedByUser: Boolean((_c = (_b = topic.likedByMe) !== null && _b !== void 0 ? _b : topic.likedByUser) !== null && _c !== void 0 ? _c : false),
        author: typeof topic.author === 'string' && topic.author.trim() ? topic.author : '匿名用户',
        createdAt: (typeof topic.createdAt === 'string' && topic.createdAt) || null,
        tags: Array.isArray(topic.tags)
            ? topic.tags
                .map(function (tag) { return String(tag).trim(); })
                .filter(function (value) { return value.length > 0; })
            : [],
        replyCount: Number((_e = (_d = topic.replies) !== null && _d !== void 0 ? _d : topic.replyCount) !== null && _e !== void 0 ? _e : 0),
    });
};
var mapPost = function (post) { return ({
    id: post.id != null ? String(post.id) : '',
    author: typeof post.author === 'string' && post.author.trim() ? post.author : '匿名用户',
    content: typeof post.content === 'string' ? post.content : '',
    createdAt: (typeof post.createdAt === 'string' && post.createdAt) || null,
    canDelete: Boolean(post.canDelete),
    isAuthor: Boolean(post.isAuthor),
}); };
var resolveLikeButtonText = function (topic) { return ((topic === null || topic === void 0 ? void 0 : topic.likedByUser) ? '取消点赞' : '点赞'); };
Page({
    data: {
        topics: [],
        selectedTopicId: '',
        activeTopic: null,
        posts: [],
        likeButtonText: '点赞',
        likeCount: 0,
        topicForm: createTopicForm(),
        replyForm: createReplyForm(),
        errorMessage: '',
        successMessage: '',
        loadingTopics: false,
        loadingPosts: false,
        submittingTopic: false,
        submittingReply: false,
        liking: false,
        topicFormVisible: false,
        replyFormVisible: false,
        topicFormErrorMessage: '',
        replyFormErrorMessage: '',
    },
    onShow: function () {
        void this.loadTopics();
    },
    loadTopics: function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, topics, selectedTopicId_1, activeTopic, error_1, apiError;
            var _this = this;
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        this.setData({
                            loadingTopics: true,
                            errorMessage: '',
                            successMessage: '',
                            topicFormErrorMessage: '',
                            replyFormErrorMessage: '',
                        });
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 6, 7, 8]);
                        return [4 /*yield*/, (0, api_1.apiRequest)({ path: '/forum/topics' })];
                    case 2:
                        response = _e.sent();
                        topics = (response.topics || [])
                            .map(function (topic) { return mapTopic(topic); })
                            .filter(function (topic) { return topic.id; });
                        selectedTopicId_1 = topics.some(function (topic) { return topic.id === _this.data.selectedTopicId; })
                            ? this.data.selectedTopicId
                            : (_b = (_a = topics[0]) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : '';
                        activeTopic = (_c = topics.find(function (topic) { return topic.id === selectedTopicId_1; })) !== null && _c !== void 0 ? _c : null;
                        this.setData({
                            topics: topics,
                            selectedTopicId: selectedTopicId_1,
                            activeTopic: activeTopic,
                            likeButtonText: resolveLikeButtonText(activeTopic),
                            likeCount: (_d = activeTopic === null || activeTopic === void 0 ? void 0 : activeTopic.likes) !== null && _d !== void 0 ? _d : 0,
                            replyFormVisible: false,
                            replyFormErrorMessage: '',
                        });
                        if (!selectedTopicId_1) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.loadPosts(selectedTopicId_1)];
                    case 3:
                        _e.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        this.setData({ posts: [] });
                        _e.label = 5;
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        error_1 = _e.sent();
                        apiError = error_1;
                        this.setData({ errorMessage: (apiError === null || apiError === void 0 ? void 0 : apiError.message) || '加载考研论坛失败，请稍后重试。' });
                        return [3 /*break*/, 8];
                    case 7:
                        this.setData({ loadingTopics: false });
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        });
    },
    loadPosts: function (topicId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, posts, error_2, apiError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.setData({ loadingPosts: true, errorMessage: '', successMessage: '', replyFormErrorMessage: '' });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, (0, api_1.apiRequest)({
                                path: "/forum/topics/".concat(topicId, "/posts"),
                            })];
                    case 2:
                        response = _a.sent();
                        posts = (response.posts || [])
                            .map(function (post) { return mapPost(post); })
                            .filter(function (post) { return post.id; });
                        this.setData({ posts: posts, loadingPosts: false, hasReplies: posts.length > 0 });
                        return [3 /*break*/, 5];
                    case 3:
                        error_2 = _a.sent();
                        apiError = error_2;
                        this.setData({ errorMessage: (apiError === null || apiError === void 0 ? void 0 : apiError.message) || '加载回复失败，请稍后重试。', posts: [] });
                        return [3 /*break*/, 5];
                    case 4:
                        this.setData({ loadingPosts: false, replyFormErrorMessage: '' });
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    },
    selectTopic: function (event) {
        var _a, _b, _c, _d;
        var id = (_b = (_a = event.currentTarget) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b.id;
        if (!id || id === this.data.selectedTopicId) {
            return;
        }
        var activeTopic = (_c = this.data.topics.find(function (topic) { return topic.id === id; })) !== null && _c !== void 0 ? _c : null;
        this.setData({
            selectedTopicId: id,
            activeTopic: activeTopic,
            likeButtonText: resolveLikeButtonText(activeTopic),
            likeCount: (_d = activeTopic === null || activeTopic === void 0 ? void 0 : activeTopic.likes) !== null && _d !== void 0 ? _d : 0,
            replyForm: createReplyForm(),
            successMessage: '',
            errorMessage: '',
            replyFormVisible: false,
            replyFormErrorMessage: '',
        });
        void this.loadPosts(id);
    },
    toggleTopicForm: function () {
        var nextVisible = !this.data.topicFormVisible;
        if (!nextVisible && this.data.submittingTopic) {
            return;
        }
        if (nextVisible) {
            this.setData({ topicFormVisible: true, topicFormErrorMessage: '', successMessage: '' });
            return;
        }
        this.setData({
            topicFormVisible: false,
            topicForm: createTopicForm(),
            topicFormErrorMessage: '',
        });
    },
    cancelTopicForm: function () {
        if (this.data.submittingTopic) {
            return;
        }
        this.setData({
            topicFormVisible: false,
            topicForm: createTopicForm(),
            topicFormErrorMessage: '',
            successMessage: '',
        });
    },
    toggleReplyForm: function () {
        if (!this.data.selectedTopicId) {
            this.setData({ replyFormErrorMessage: '请先选择话题' });
            return;
        }
        var nextVisible = !this.data.replyFormVisible;
        if (!nextVisible && this.data.submittingReply) {
            return;
        }
        if (nextVisible) {
            this.setData({ replyFormVisible: true, replyFormErrorMessage: '', successMessage: '' });
            return;
        }
        this.setData({
            replyFormVisible: false,
            replyForm: createReplyForm(),
            replyFormErrorMessage: '',
        });
    },
    cancelReplyForm: function () {
        if (this.data.submittingReply) {
            return;
        }
        this.setData({
            replyFormVisible: false,
            replyForm: createReplyForm(),
            replyFormErrorMessage: '',
            successMessage: '',
        });
    },
    handleTopicInput: function (event) {
        var _a;
        var _b, _c, _d;
        var field = (_c = (_b = event.currentTarget) === null || _b === void 0 ? void 0 : _b.dataset) === null || _c === void 0 ? void 0 : _c.field;
        if (!field) {
            return;
        }
        var value = (_d = event.detail.value) !== null && _d !== void 0 ? _d : '';
        this.setData({
            topicForm: __assign(__assign({}, this.data.topicForm), (_a = {}, _a[field] = value, _a)),
            errorMessage: '',
            successMessage: '',
            topicFormErrorMessage: '',
        });
    },
    handleReplyInput: function (event) {
        var _a;
        var value = (_a = event.detail.value) !== null && _a !== void 0 ? _a : '';
        this.setData({
            replyForm: __assign(__assign({}, this.data.replyForm), { content: value }),
            errorMessage: '',
            successMessage: '',
            replyFormErrorMessage: '',
        });
    },
    createTopic: function () {
        return __awaiter(this, void 0, void 0, function () {
            var form, tags, error_3, apiError, message;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        form = this.data.topicForm;
                        if (!form.title || !form.title.trim()) {
                            this.setData({ topicFormErrorMessage: '请输入话题标题' });
                            return [2 /*return*/];
                        }
                        tags = form.tags
                            .split(/[,，\s]+/)
                            .map(function (tag) { return tag.trim(); })
                            .filter(Boolean);
                        this.setData({
                            submittingTopic: true,
                            errorMessage: '',
                            successMessage: '',
                            topicFormErrorMessage: '',
                        });
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 5, 6, 7]);
                        return [4 /*yield*/, (0, session_1.ensureSession)()];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, (0, api_1.apiRequest)({
                                path: '/forum/topics',
                                method: 'POST',
                                data: {
                                    title: form.title.trim(),
                                    description: ((_a = form.description) === null || _a === void 0 ? void 0 : _a.trim()) || null,
                                    tags: tags,
                                },
                            })];
                    case 3:
                        _b.sent();
                        this.setData({
                            topicForm: createTopicForm(),
                            successMessage: '话题发布成功。',
                            topicFormVisible: false,
                            topicFormErrorMessage: '',
                        });
                        return [4 /*yield*/, this.loadTopics()];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 5:
                        error_3 = _b.sent();
                        apiError = error_3;
                        message = (apiError === null || apiError === void 0 ? void 0 : apiError.statusCode) === 401
                            ? '请先登录后再发帖，可在个人中心输入账号密码。'
                            : (apiError === null || apiError === void 0 ? void 0 : apiError.message) || '发布话题失败，请稍后重试。';
                        this.setData({ errorMessage: message, topicFormErrorMessage: message });
                        return [3 /*break*/, 7];
                    case 6:
                        this.setData({ submittingTopic: false });
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        });
    },
    createReply: function () {
        return __awaiter(this, void 0, void 0, function () {
            var content, topicId, error_4, apiError, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        content = this.data.replyForm.content;
                        topicId = this.data.selectedTopicId;
                        if (!topicId) {
                            this.setData({ replyFormErrorMessage: '请先选择话题' });
                            return [2 /*return*/];
                        }
                        if (!content || !content.trim()) {
                            this.setData({ replyFormErrorMessage: '请输入回复内容' });
                            return [2 /*return*/];
                        }
                        this.setData({
                            submittingReply: true,
                            errorMessage: '',
                            successMessage: '',
                            replyFormErrorMessage: '',
                        });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, 6, 7]);
                        return [4 /*yield*/, (0, session_1.ensureSession)()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, (0, api_1.apiRequest)({
                                path: "/forum/topics/".concat(topicId, "/posts"),
                                method: 'POST',
                                data: {
                                    content: content.trim(),
                                },
                            })];
                    case 3:
                        _a.sent();
                        this.setData({
                            replyForm: createReplyForm(),
                            successMessage: '回复已发送。',
                            replyFormVisible: false,
                            replyFormErrorMessage: '',
                        });
                        return [4 /*yield*/, this.loadPosts(topicId)];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 5:
                        error_4 = _a.sent();
                        apiError = error_4;
                        message = (apiError === null || apiError === void 0 ? void 0 : apiError.statusCode) === 401
                            ? '请先登录后再回复，可在个人中心输入账号密码。'
                            : (apiError === null || apiError === void 0 ? void 0 : apiError.message) || '回复失败，请稍后重试。';
                        this.setData({ errorMessage: message, replyFormErrorMessage: message });
                        return [3 /*break*/, 7];
                    case 6:
                        this.setData({ submittingReply: false });
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        });
    },
    toggleLike: function () {
        return __awaiter(this, void 0, void 0, function () {
            var topicId, response_1, topics, activeTopic, error_5, apiError, message;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        topicId = this.data.selectedTopicId;
                        if (!topicId || this.data.liking) {
                            return [2 /*return*/];
                        }
                        this.setData({ liking: true, successMessage: '', errorMessage: '' });
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, 5, 6]);
                        return [4 /*yield*/, (0, session_1.ensureSession)()];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, (0, api_1.apiRequest)({
                                path: "/forum/topics/".concat(topicId, "/likes"),
                                method: 'POST',
                            })];
                    case 3:
                        response_1 = _b.sent();
                        topics = this.data.topics.map(function (topic) {
                            return topic.id === topicId
                                ? __assign(__assign({}, topic), { likes: response_1.likes, likedByUser: response_1.liked }) : topic;
                        });
                        activeTopic = (_a = topics.find(function (topic) { return topic.id === topicId; })) !== null && _a !== void 0 ? _a : null;
                        this.setData({
                            topics: topics,
                            activeTopic: activeTopic,
                            likeButtonText: resolveLikeButtonText(activeTopic),
                            likeCount: response_1.likes,
                            successMessage: response_1.liked ? '已点赞' : '已取消点赞',
                        });
                        return [3 /*break*/, 6];
                    case 4:
                        error_5 = _b.sent();
                        apiError = error_5;
                        message = (apiError === null || apiError === void 0 ? void 0 : apiError.statusCode) === 401
                            ? '请先登录后再点赞，可在个人中心输入账号密码。'
                            : (apiError === null || apiError === void 0 ? void 0 : apiError.message) || '操作失败，请稍后重试。';
                        this.setData({ errorMessage: message });
                        return [3 /*break*/, 6];
                    case 5:
                        this.setData({ liking: false });
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    },
});
