"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var forum_1 = require("../../data/forum");
var formatDateTime = function (value) {
    if (!value) {
        return '刚刚';
    }
    var date = new Date(value);
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
var createTopicForm = function () { return ({
    title: '',
    description: '',
    tags: '',
}); };
var createReplyForm = function () { return ({ content: '' }); };
var normalizeReply = function (reply) { return ({
    id: reply.id || "reply_".concat(Date.now()),
    author: reply.author || '匿名用户',
    content: reply.content || '',
    createdAt: formatDateTime(reply.createdAt),
}); };
var parseSeedTopics = function () {
    var postsMap = Object.create(null);
    var topics = forum_1.forumSeed.map(function (item) {
        var replies = Array.isArray(item.replies) ? item.replies.map(normalizeReply) : [];
        postsMap[item.id] = replies;
        return {
            id: item.id,
            title: item.title,
            description: item.description,
            likes: Number(item.likes || 0),
            likedByUser: Boolean(item.likedByUser),
            author: item.author || '官方示例',
            createdAt: formatDateTime(item.createdAt),
            tags: Array.isArray(item.tags) ? item.tags : [],
            replyCount: replies.length,
        };
    });
    return { topics: topics, postsMap: postsMap };
};
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
    onLoad: function () {
        this.initialize();
    },
    initialize: function () {
        var _a = parseSeedTopics(), topics = _a.topics, postsMap = _a.postsMap;
        this.postsByTopic = postsMap;
        var selectedTopicId = topics[0] ? topics[0].id : '';
        var activeTopic = selectedTopicId ? topics.find(function (topic) { return topic.id === selectedTopicId; }) || null : null;
        var posts = selectedTopicId ? postsMap[selectedTopicId] || [] : [];
        this.setData({
            topics: topics,
            selectedTopicId: selectedTopicId,
            activeTopic: activeTopic,
            posts: posts,
            likeButtonText: activeTopic && activeTopic.likedByUser ? '取消点赞' : '点赞',
            likeCount: activeTopic ? activeTopic.likes : 0,
            successMessage: '',
            errorMessage: '',
        });
    },
    selectTopic: function (event) {
        var _a, _b;
        var id = ((_a = event.currentTarget) === null || _a === void 0 ? void 0 : _a.dataset) ? (_b = event.currentTarget.dataset).id : undefined;
        if (!id || id === this.data.selectedTopicId) {
            return;
        }
        var activeTopic = this.data.topics.find(function (topic) { return topic.id === id; }) || null;
        this.setData({
            selectedTopicId: id,
            activeTopic: activeTopic,
            posts: this.postsByTopic[id] || [],
            likeButtonText: activeTopic && activeTopic.likedByUser ? '取消点赞' : '点赞',
            likeCount: activeTopic ? activeTopic.likes : 0,
            replyForm: createReplyForm(),
            replyFormVisible: false,
            replyFormErrorMessage: '',
            successMessage: '',
            errorMessage: '',
        });
    },
    toggleTopicForm: function () {
        if (this.data.submittingTopic) {
            return;
        }
        var visible = !this.data.topicFormVisible;
        this.setData({
            topicFormVisible: visible,
            topicFormErrorMessage: '',
            successMessage: visible ? '' : this.data.successMessage,
        });
        if (!visible) {
            this.setData({ topicForm: createTopicForm() });
        }
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
        if (this.data.submittingReply) {
            return;
        }
        var visible = !this.data.replyFormVisible;
        this.setData({
            replyFormVisible: visible,
            replyFormErrorMessage: '',
            successMessage: visible ? '' : this.data.successMessage,
        });
        if (!visible) {
            this.setData({ replyForm: createReplyForm() });
        }
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
        var _a, _b, _c;
        var field = (_b = (_a = event.currentTarget) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b.field;
        if (!field) {
            return;
        }
        var value = ((_c = event.detail) === null || _c === void 0 ? void 0 : _c.value) || '';
        this.setData({
            topicForm: Object.assign(Object.assign({}, this.data.topicForm), (_d = {}, _d[field] = value, _d)),
            topicFormErrorMessage: '',
            errorMessage: '',
            successMessage: '',
        });
        var _d;
    },
    handleReplyInput: function (event) {
        var _a;
        var value = ((_a = event.detail) === null || _a === void 0 ? void 0 : _a.value) || '';
        this.setData({
            replyForm: Object.assign(Object.assign({}, this.data.replyForm), { content: value }),
            replyFormErrorMessage: '',
            errorMessage: '',
            successMessage: '',
        });
    },
    createTopic: function () {
        var form = this.data.topicForm;
        if (!form.title || !form.title.trim()) {
            this.setData({ topicFormErrorMessage: '请输入话题标题' });
            return;
        }
        var tags = form.tags
            .split(/[,，\s]+/)
            .map(function (tag) { return tag.trim(); })
            .filter(function (tag) { return tag.length > 0; });
        var now = Date.now();
        var newTopic = {
            id: "topic_".concat(now),
            title: form.title.trim(),
            description: (form.description || '').trim() || '暂无补充说明',
            likes: 0,
            likedByUser: false,
            author: '我',
            createdAt: formatDateTime(now),
            tags: tags,
            replyCount: 0,
        };
        this.postsByTopic[newTopic.id] = [];
        var topics = [newTopic].concat(this.data.topics);
        this.setData({
            topics: topics,
            selectedTopicId: newTopic.id,
            activeTopic: newTopic,
            posts: [],
            likeButtonText: '点赞',
            likeCount: 0,
            topicFormVisible: false,
            topicForm: createTopicForm(),
            topicFormErrorMessage: '',
            successMessage: '话题发布成功。',
            errorMessage: '',
        });
    },
    createReply: function () {
        var content = this.data.replyForm.content;
        var topicId = this.data.selectedTopicId;
        if (!topicId) {
            this.setData({ replyFormErrorMessage: '请先选择话题' });
            return;
        }
        if (!content || !content.trim()) {
            this.setData({ replyFormErrorMessage: '请输入回复内容' });
            return;
        }
        var reply = normalizeReply({
            id: "reply_".concat(Date.now()),
            author: '我',
            content: content.trim(),
            createdAt: new Date().toISOString(),
        });
        var posts = (this.postsByTopic[topicId] || []).concat([reply]);
        this.postsByTopic[topicId] = posts;
        var topics = this.data.topics.map(function (topic) {
            return topic.id === topicId
                ? Object.assign(Object.assign({}, topic), { replyCount: posts.length })
                : topic;
        });
        this.setData({
            topics: topics,
            posts: posts,
            replyForm: createReplyForm(),
            replyFormVisible: false,
            replyFormErrorMessage: '',
            successMessage: '回复已发送。',
            errorMessage: '',
        });
    },
    toggleLike: function () {
        var topicId = this.data.selectedTopicId;
        if (!topicId) {
            return;
        }
        var topics = this.data.topics.map(function (topic) {
            if (topic.id !== topicId) {
                return topic;
            }
            var liked = !topic.likedByUser;
            return Object.assign(Object.assign({}, topic), { likedByUser: liked, likes: liked ? topic.likes + 1 : Math.max(0, topic.likes - 1) });
        });
        var activeTopic = topics.find(function (topic) { return topic.id === topicId; }) || null;
        this.setData({
            topics: topics,
            activeTopic: activeTopic,
            likeButtonText: activeTopic && activeTopic.likedByUser ? '取消点赞' : '点赞',
            likeCount: activeTopic ? activeTopic.likes : 0,
            successMessage: activeTopic && activeTopic.likedByUser ? '已点赞' : '已取消点赞',
        });
    },
    postsByTopic: Object.create(null),
});
