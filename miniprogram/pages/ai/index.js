const { apiRequest } = require('../../utils/api.js');
const { ensureSession } = require('../../utils/session.js');

const createMessage = (role, content) => ({
  id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  role,
  content,
  createdAt: new Date().toISOString(),
});

Page({
  data: {
    inputValue: '',
    loading: false,
    errorMessage: '',
    messages: [],
  },

  onShow() {
    this.setData({ errorMessage: '' });
  },

  handleInput(event) {
    this.setData({ inputValue: event.detail.value || '' });
  },

  async sendMessage() {
    const question = this.data.inputValue.trim();
    if (!question || this.data.loading) {
      return;
    }

    const userMessage = createMessage('user', question);
    const nextMessages = [...this.data.messages, userMessage];
    this.setData({
      loading: true,
      inputValue: '',
      errorMessage: '',
      messages: nextMessages,
    });

    try {
      await ensureSession();
    } catch (error) {
      const message =
        error?.statusCode === 401
          ? '登录后可使用 AI 助手，可在“我的”页登录后重试。'
          : error?.message || '登录状态校验失败，请稍后再试。';
      this.setData({ loading: false, errorMessage: message });
      return;
    }

    try {
      const response = await apiRequest({
        path: '/ai/ask',
        method: 'POST',
        data: { question },
      });
      const answerText = response?.answer || '暂未获取到答案，请稍后再试。';
      const assistantMessage = createMessage('assistant', answerText);
      this.setData({ messages: [...nextMessages, assistantMessage], loading: false });
    } catch (error) {
      const message = error?.message || 'AI 助手暂时不可用，请稍后再试。';
      this.setData({ loading: false, errorMessage: message });
    }
  },

  resend(event) {
    const question = event?.currentTarget?.dataset?.question;
    if (!question) {
      return;
    }
    this.setData({ inputValue: question });
    this.sendMessage();
  },
});
