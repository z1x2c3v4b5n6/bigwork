const { apiRequest } = require('../../utils/api.js');
const {
  getWrongBookItems,
  removeWrongQuestion,
  syncWrongBook,
  upsertWrongQuestion,
} = require('../../utils/wrongBook.js');
const { ensureSession } = require('../../utils/session.js');

const createForm = () => ({
  question: '',
  answer: '',
  analysis: '',
});

const formatDateTime = (value) => {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
};

const decorateItems = (items) =>
  items.map((item) => Object.assign({}, item, { displayTime: formatDateTime(item.updatedAt) }));

Page({
  data: {
    items: decorateItems(getWrongBookItems()),
    pendingCount: getWrongBookItems().filter((item) => !item.synced).length,
    syncing: false,
    errorMessage: '',
    successMessage: '',
    formVisible: false,
    form: createForm(),
  },

  onShow() {
    this.refreshLocal();
    this.syncWithServer();
  },

  refreshLocal() {
    const items = getWrongBookItems();
    this.setData({
      items: decorateItems(items),
      pendingCount: items.filter((item) => !item.synced).length,
    });
  },

  async syncWithServer() {
    if (this.data.syncing) {
      return;
    }
    this.setData({ syncing: true, errorMessage: '', successMessage: '' });

    try {
      await ensureSession();
    } catch (error) {
      const message =
        error?.statusCode === 401
          ? '登录后可同步错题，当前展示为本地缓存。'
          : error?.message || '登录状态校验失败，请稍后再试。';
      this.setData({ syncing: false, errorMessage: message });
      return;
    }

    try {
      const result = await syncWrongBook();
      const pendingCount = result.pendingSync.filter((item) => !item.synced).length;
      this.setData({
        items: decorateItems(result.items),
        pendingCount,
        successMessage: pendingCount === 0 ? '错题本已与云端同步。' : '存在离线修改，待网络恢复自动同步。',
      });
    } catch (error) {
      const message = error?.message || '同步错题失败，请稍后再试。';
      this.setData({ errorMessage: message });
    } finally {
      this.setData({ syncing: false });
    }
  },

  toggleForm() {
    this.setData({
      formVisible: !this.data.formVisible,
      form: !this.data.formVisible ? this.data.form : createForm(),
      successMessage: '',
      errorMessage: '',
    });
  },

  handleFormInput(event) {
    const field = event?.currentTarget?.dataset?.field;
    if (!field) {
      return;
    }
    const value = event.detail.value || '';
    this.setData({ form: Object.assign({}, this.data.form, { [field]: value }) });
  },

  submitForm() {
    const { question, answer, analysis } = this.data.form;
    if (!question.trim() || !answer.trim()) {
      this.setData({ errorMessage: '题干和参考答案不能为空。' });
      return;
    }

    const entry = {
      id: `local-${Date.now()}`,
      question: question.trim(),
      answer: answer.trim(),
      analysis: analysis.trim(),
      updatedAt: new Date().toISOString(),
      synced: false,
    };
    upsertWrongQuestion(entry);
    this.setData({ form: createForm(), formVisible: false });
    this.refreshLocal();
    wx.showToast({ title: '已保存', icon: 'success' });
    this.syncWithServer();
  },

  async removeEntry(event) {
    const id = event?.currentTarget?.dataset?.id;
    if (!id) {
      return;
    }
    removeWrongQuestion(id);
    this.refreshLocal();

    try {
      await ensureSession();
      await apiRequest({ path: `/practice/wrong-questions/${id}`, method: 'DELETE' });
      wx.showToast({ title: '已删除', icon: 'none' });
      this.syncWithServer();
    } catch (error) {
      console.warn('[wrongbook] 删除云端记录失败', error?.message || error);
    }
  },

  handleManualSync() {
    this.syncWithServer();
  },
});
