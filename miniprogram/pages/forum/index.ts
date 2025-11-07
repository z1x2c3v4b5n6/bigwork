import { forumSeed, type ForumReply, type ForumTopic } from '../../data/forum';
import { loadFromStorage, saveToStorage } from '../../utils/storage';

const FORUM_STORAGE_KEY = 'forumTopics';

const createTopicForm = () => ({
  title: '',
  description: '',
});

const createReplyForm = () => ({
  content: '',
});

const normalizeTopics = (topics: ForumTopic[]): ForumTopic[] =>
  topics.map((topic) => ({
    ...topic,
    id: topic.id || `topic_${Date.now()}`,
    likes: Number(topic.likes ?? 0),
    likedByUser: Boolean(topic.likedByUser),
    replies: (topic.replies ?? []).map((reply) => ({
      ...reply,
      id: reply.id || `reply_${Date.now()}`,
    })),
  }));

const resolveLikeButtonText = (topic: ForumTopic | null) => (topic?.likedByUser ? '取消点赞' : '点赞');

Page({
  data: {
    topics: forumSeed as ForumTopic[],
    selectedTopicId: forumSeed[0]?.id ?? '',
    activeTopic: forumSeed[0] ?? null,
    likeButtonText: resolveLikeButtonText(forumSeed[0] ?? null),
    likeCount: forumSeed[0]?.likes ?? 0,
    hasReplies: Boolean(forumSeed[0]?.replies?.length),
    topicForm: createTopicForm(),
    replyForm: createReplyForm(),
    errorMessage: '',
    successMessage: '',
  },

  onShow() {
    const storedTopics = loadFromStorage<ForumTopic[]>(FORUM_STORAGE_KEY, forumSeed);
    const topics = normalizeTopics(storedTopics);
    const selectedTopicId = topics.some((topic) => topic.id === this.data.selectedTopicId)
      ? this.data.selectedTopicId
      : topics[0]?.id ?? '';
    const activeTopic = topics.find((topic) => topic.id === selectedTopicId) ?? null;
    this.setData({
      topics,
      selectedTopicId,
      activeTopic,
      likeButtonText: resolveLikeButtonText(activeTopic),
      likeCount: activeTopic?.likes ?? 0,
      hasReplies: Boolean(activeTopic?.replies?.length),
    });
  },

  selectTopic(event: WechatMiniprogram.BaseEvent) {
    const id = event.currentTarget?.dataset?.id;
    if (!id) {
      return;
    }
    const activeTopic = this.data.topics.find((topic) => topic.id === id) ?? null;
    this.setData({
      selectedTopicId: id,
      activeTopic,
      likeButtonText: resolveLikeButtonText(activeTopic),
      likeCount: activeTopic?.likes ?? 0,
      hasReplies: Boolean(activeTopic?.replies?.length),
      replyForm: createReplyForm(),
      errorMessage: '',
      successMessage: '',
    });
  },

  handleTopicInput(event: WechatMiniprogram.Input) {
    const field = event.currentTarget?.dataset?.field;
    if (!field) {
      return;
    }
    const value = event.detail.value ?? '';
    this.setData({
      topicForm: { ...this.data.topicForm, [field]: value },
      errorMessage: '',
      successMessage: '',
    });
  },

  handleReplyInput(event: WechatMiniprogram.Input) {
    const value = event.detail.value ?? '';
    this.setData({
      replyForm: { ...this.data.replyForm, content: value },
      errorMessage: '',
      successMessage: '',
    });
  },

  createTopic() {
    const form = this.data.topicForm;
    if (!form.title || !form.title.trim()) {
      this.setData({ errorMessage: '请输入话题标题' });
      return;
    }

    const topic: ForumTopic = {
      id: `topic_${Date.now()}`,
      title: form.title.trim(),
      description: form.description?.trim() || '暂无补充说明',
      likes: 0,
      likedByUser: false,
      createdAt: new Date().toISOString(),
      replies: [],
    };

    const topics = [topic, ...this.data.topics];
    saveToStorage(FORUM_STORAGE_KEY, topics);

    this.setData({
      topics,
      selectedTopicId: topic.id,
      activeTopic: topic,
      likeButtonText: resolveLikeButtonText(topic),
      likeCount: topic.likes,
      hasReplies: Boolean(topic.replies?.length),
      topicForm: createTopicForm(),
      successMessage: '话题发布成功。',
      errorMessage: '',
    });
  },

  createReply() {
    const content = this.data.replyForm.content;
    const topicId = this.data.selectedTopicId;

    if (!topicId) {
      this.setData({ errorMessage: '请先选择话题' });
      return;
    }

    if (!content || !content.trim()) {
      this.setData({ errorMessage: '请输入回复内容' });
      return;
    }

    const reply: ForumReply = {
      id: `reply_${Date.now()}`,
      author: '我',
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    const topics = this.data.topics.map((topic) =>
      topic.id === topicId
        ? { ...topic, replies: [reply, ...topic.replies] }
        : topic,
    );

    saveToStorage(FORUM_STORAGE_KEY, topics);

    const activeTopic = topics.find((topic) => topic.id === topicId) ?? null;
    this.setData({
      topics,
      activeTopic,
      likeButtonText: resolveLikeButtonText(activeTopic),
      likeCount: activeTopic?.likes ?? 0,
      hasReplies: Boolean(activeTopic?.replies?.length),
      replyForm: createReplyForm(),
      successMessage: '回复已发送。',
      errorMessage: '',
    });
  },

  toggleLike() {
    const topicId = this.data.selectedTopicId;
    if (!topicId) {
      return;
    }

    let likedByUserFlag = false;
    const topics = this.data.topics.map((topic) => {
      if (topic.id !== topicId) {
        return topic;
      }
      const likedByUser = !topic.likedByUser;
      likedByUserFlag = likedByUser;
      const likes = likedByUser ? topic.likes + 1 : Math.max(0, topic.likes - 1);
      return { ...topic, likedByUser, likes };
    });

    saveToStorage(FORUM_STORAGE_KEY, topics);

    const activeTopic = topics.find((topic) => topic.id === topicId) ?? null;
    this.setData({
      topics,
      activeTopic,
      likeButtonText: resolveLikeButtonText(activeTopic),
      likeCount: activeTopic?.likes ?? 0,
      hasReplies: Boolean(activeTopic?.replies?.length),
      successMessage: likedByUserFlag ? '已点赞' : '已取消点赞',
    });
  },
});
