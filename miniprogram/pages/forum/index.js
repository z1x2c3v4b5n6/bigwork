const { apiRequest } = require('../../utils/api.js');
const { ensureSession } = require('../../utils/session.js');

const createTopicForm = () => ({
  title: '',
  description: '',
  tags: '',
});

const createReplyForm = () => ({
  content: '',
});

const mapTopic = (topic = {}) => {
  const record = topic || {};
  const rawTags = Array.isArray(record.tags) ? record.tags : [];
  const likedFlag = record.likedByMe != null ? record.likedByMe : record.likedByUser;
  const replySource =
    record.replies != null ? record.replies : record.replyCount != null ? record.replyCount : 0;
  return {
    id: record.id != null ? String(record.id) : '',
    title:
      typeof record.title === 'string' && record.title.trim()
        ? record.title
        : '未命名话题',
    description:
      typeof record.description === 'string' && record.description.trim()
        ? record.description
        : '暂无补充说明',
    likes: Number(record.likes != null ? record.likes : 0),
    likedByUser: Boolean(likedFlag),
    author:
      typeof record.author === 'string' && record.author.trim()
        ? record.author
        : '匿名用户',
    createdAt: (typeof record.createdAt === 'string' && record.createdAt) || null,
    tags: rawTags
      .map((tag) => String(tag).trim())
      .filter((value) => value.length > 0),
    replyCount: Number(replySource),
  };
};

const mapPost = (post = {}) => ({
  id: post.id != null ? String(post.id) : '',
  author:
    typeof post.author === 'string' && post.author.trim() ? post.author : '匿名用户',
  content: typeof post.content === 'string' ? post.content : '',
  createdAt: (typeof post.createdAt === 'string' && post.createdAt) || null,
  canDelete: Boolean(post.canDelete),
  isAuthor: Boolean(post.isAuthor),
});

const resolveLikeButtonText = (topic) => (topic && topic.likedByUser ? '取消点赞' : '点赞');

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

  onShow() {
    this.loadTopics();
  },

  async loadTopics() {
    this.setData({
      loadingTopics: true,
      errorMessage: '',
      successMessage: '',
      topicFormErrorMessage: '',
      replyFormErrorMessage: '',
    });

    try {
      const response = await apiRequest({ path: '/forum/topics' });
      const topics = (response.topics || [])
        .map((topic) => mapTopic(topic))
        .filter((topic) => topic.id);

      const selectedTopicId = topics.some((topic) => topic.id === this.data.selectedTopicId)
        ? this.data.selectedTopicId
        : (topics[0] && topics[0].id) || '';
      const activeTopic = topics.find((topic) => topic.id === selectedTopicId) || null;
      const likeCount = activeTopic ? Number(activeTopic.likes || 0) : 0;

      this.setData({
        topics,
        selectedTopicId,
        activeTopic,
        likeButtonText: resolveLikeButtonText(activeTopic),
        likeCount,
        replyFormVisible: false,
        replyFormErrorMessage: '',
      });

      if (selectedTopicId) {
        await this.loadPosts(selectedTopicId);
      } else {
        this.setData({ posts: [] });
      }
    } catch (error) {
      const message = (error && error.message) || '加载考研论坛失败，请稍后重试。';
      this.setData({ errorMessage: message });
    } finally {
      this.setData({ loadingTopics: false });
    }
  },

  async loadPosts(topicId) {
    this.setData({ loadingPosts: true, errorMessage: '', successMessage: '', replyFormErrorMessage: '' });

    try {
      const response = await apiRequest({ path: `/forum/topics/${topicId}/posts` });
      const posts = (response.posts || [])
        .map((post) => mapPost(post))
        .filter((post) => post.id);
      this.setData({ posts, loadingPosts: false, hasReplies: posts.length > 0 });
    } catch (error) {
      const message = (error && error.message) || '加载回复失败，请稍后重试。';
      this.setData({ errorMessage: message, posts: [] });
    } finally {
      this.setData({ loadingPosts: false, replyFormErrorMessage: '' });
    }
  },

  selectTopic(event) {
    const id = event && event.currentTarget && event.currentTarget.dataset && event.currentTarget.dataset.id;
    if (!id || id === this.data.selectedTopicId) {
      return;
    }

    const activeTopic = this.data.topics.find((topic) => topic.id === id) || null;
    this.setData({
      selectedTopicId: id,
      activeTopic,
      likeButtonText: resolveLikeButtonText(activeTopic),
      likeCount: activeTopic ? Number(activeTopic.likes || 0) : 0,
      replyForm: createReplyForm(),
      successMessage: '',
      errorMessage: '',
      replyFormVisible: false,
      replyFormErrorMessage: '',
    });
    this.loadPosts(id);
  },

  toggleTopicForm() {
    const nextVisible = !this.data.topicFormVisible;
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

  cancelTopicForm() {
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

  toggleReplyForm() {
    if (!this.data.selectedTopicId) {
      this.setData({ replyFormErrorMessage: '请先选择话题' });
      return;
    }

    const nextVisible = !this.data.replyFormVisible;
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

  cancelReplyForm() {
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

  handleTopicInput(event) {
    const dataset = event && event.currentTarget && event.currentTarget.dataset;
    const field = dataset && dataset.field;
    if (!field) {
      return;
    }
    const value = (event && event.detail && event.detail.value) || '';
    this.setData({
      topicForm: Object.assign({}, this.data.topicForm, { [field]: value }),
      errorMessage: '',
      successMessage: '',
      topicFormErrorMessage: '',
    });
  },

  handleReplyInput(event) {
    const value = (event && event.detail && event.detail.value) || '';
    this.setData({
      replyForm: Object.assign({}, this.data.replyForm, { content: value }),
      errorMessage: '',
      successMessage: '',
      replyFormErrorMessage: '',
    });
  },

  async createTopic() {
    const form = this.data.topicForm;
    if (!form.title || !form.title.trim()) {
      this.setData({ topicFormErrorMessage: '请输入话题标题' });
      return;
    }

    const tags = form.tags
      .split(/[,，\s]+/)
      .map((tag) => tag.trim())
      .filter(Boolean);

    this.setData({
      submittingTopic: true,
      errorMessage: '',
      successMessage: '',
      topicFormErrorMessage: '',
    });

    try {
      await ensureSession();
      await apiRequest({
        path: '/forum/topics',
        method: 'POST',
        data: {
          title: form.title.trim(),
          description:
            form.description && form.description.trim()
              ? form.description.trim()
              : null,
          tags,
        },
      });

      this.setData({
        topicForm: createTopicForm(),
        successMessage: '话题发布成功。',
        topicFormVisible: false,
        topicFormErrorMessage: '',
      });
      await this.loadTopics();
    } catch (error) {
      const message =
        error && error.statusCode === 401
          ? '请先登录后再发帖，可在个人中心输入账号密码。'
          : (error && error.message) || '发布话题失败，请稍后重试。';
      this.setData({ errorMessage: message, topicFormErrorMessage: message });
    } finally {
      this.setData({ submittingTopic: false });
    }
  },

  async createReply() {
    const content = this.data.replyForm.content;
    const topicId = this.data.selectedTopicId;

    if (!topicId) {
      this.setData({ replyFormErrorMessage: '请先选择话题' });
      return;
    }

    if (!content || !content.trim()) {
      this.setData({ replyFormErrorMessage: '请输入回复内容' });
      return;
    }

    this.setData({
      submittingReply: true,
      errorMessage: '',
      successMessage: '',
      replyFormErrorMessage: '',
    });

    try {
      await ensureSession();
      await apiRequest({
        path: `/forum/topics/${topicId}/posts`,
        method: 'POST',
        data: {
          content: content.trim(),
        },
      });

      this.setData({
        replyForm: createReplyForm(),
        successMessage: '回复已发送。',
        replyFormVisible: false,
        replyFormErrorMessage: '',
      });
      await this.loadPosts(topicId);
    } catch (error) {
      const message =
        error && error.statusCode === 401
          ? '请先登录后再回复，可在个人中心输入账号密码。'
          : (error && error.message) || '回复失败，请稍后重试。';
      this.setData({ errorMessage: message, replyFormErrorMessage: message });
    } finally {
      this.setData({ submittingReply: false });
    }
  },

  async toggleLike() {
    const topicId = this.data.selectedTopicId;
    if (!topicId || this.data.liking) {
      return;
    }

    this.setData({ liking: true, successMessage: '', errorMessage: '' });

    try {
      await ensureSession();
      const response = await apiRequest({
        path: `/forum/topics/${topicId}/likes`,
        method: 'POST',
      });

      const topics = this.data.topics.map((topic) =>
        topic.id === topicId
          ? Object.assign({}, topic, { likes: response.likes, likedByUser: response.liked })
          : topic
      );
      const activeTopic = topics.find((topic) => topic.id === topicId) || null;

      this.setData({
        topics,
        activeTopic,
        likeButtonText: resolveLikeButtonText(activeTopic),
        likeCount: response.likes,
        successMessage: response.liked ? '已点赞' : '已取消点赞',
      });
    } catch (error) {
      const message =
        error && error.statusCode === 401
          ? '请先登录后再点赞，可在个人中心输入账号密码。'
          : (error && error.message) || '操作失败，请稍后重试。';
      this.setData({ errorMessage: message });
    } finally {
      this.setData({ liking: false });
    }
  },
});
