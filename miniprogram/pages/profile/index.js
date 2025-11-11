const { apiRequest } = require('../../utils/api.js');
const {
  ensureSession,
  getStoredSession,
  login: loginRequest,
  logout: logoutRequest,
} = require('../../utils/session.js');

const createEmptyProfile = () => ({
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
});

const createLoginForm = () => ({
  username: '',
  password: '',
});

const demoAccounts = [
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

const resolveMajorName = (majorId, majors) => {
  const found = (majors || []).find((major) => major.id === majorId);
  return found ? found.name : '请选择';
};

const mapProfile = (profile) => ({
  id: profile && profile.id != null ? String(profile.id) : '',
  role: profile && profile.role === 'admin' ? 'admin' : 'student',
  name: profile && typeof profile.name === 'string' ? profile.name : '未命名用户',
  email: profile && typeof profile.email === 'string' ? profile.email : '',
  phone: profile && typeof profile.phone === 'string' ? profile.phone : '',
  organization: profile && typeof profile.organization === 'string' ? profile.organization : '',
  goal: profile && typeof profile.goal === 'string' ? profile.goal : '',
  majorId: profile && profile.majorId != null ? String(profile.majorId) : '',
  bio: profile && typeof profile.bio === 'string' ? profile.bio : '',
  avatar: profile && typeof profile.avatar === 'string' ? profile.avatar : '',
});

Page({
  data: {
    profile: createEmptyProfile(),
    majors: [],
    selectedMajorName: '请选择',
    sessionUser: null,
    loginForm: createLoginForm(),
    demoAccounts,
    selectedDemoKey: '',
    errorMessage: '',
    successMessage: '',
    loading: false,
    saving: false,
    loggingIn: false,
  },

  onShow() {
    this.loadProfile();
  },

  async loadProfile() {
    this.setData({ loading: true, errorMessage: '', successMessage: '' });

    const app = getApp();

    let session = app && app.globalData ? app.globalData.sessionUser : null;

    if (!session) {
      session = getStoredSession();
      if (session && app && typeof app.setSessionUser === 'function') {
        app.setSessionUser(session);
      }
    }

    if (!session) {
      this.setData({ loading: false, sessionUser: null });
      return;
    }

    this.setData({ sessionUser: session });

    try {
      session = await ensureSession();
      if (app && typeof app.setSessionUser === 'function') {
        app.setSessionUser(session);
      }
      this.setData({ sessionUser: session });
    } catch (error) {
      if (error && error.statusCode === 401) {
        this.setData({ loading: false, sessionUser: null });
        return;
      }
      this.setData({ loading: false, errorMessage: (error && error.message) || '无法校验登录状态，请稍后重试。' });
      return;
    }

    try {
      const [majors, profile] = await Promise.all([
        this.fetchMajors(),
        this.fetchProfile(session.id),
      ]);
      this.setData({
        majors,
        profile,
        selectedMajorName: resolveMajorName(profile.majorId, majors),
      });
    } catch (error) {
      this.setData({ errorMessage: (error && error.message) || '加载个人资料失败，请稍后重试。' });
    } finally {
      this.setData({ loading: false });
    }
  },

  async fetchMajors() {
    try {
      const majors = await apiRequest({ path: '/majors' });
      return (majors || [])
        .map((major) => ({
          id: major && major.id != null ? String(major.id) : '',
          name: (major && major.name) || '未命名专业',
          description: major ? major.description ?? null : null,
        }))
        .filter((major) => major.id);
    } catch (error) {
      console.warn('加载专业列表失败', error);
      return [];
    }
  },

  async fetchProfile(userId) {
    const response = await apiRequest({ path: `/users/${userId}` });
    return mapProfile(response || {});
  },

  handleInput(event) {
    const dataset = (event && event.currentTarget && event.currentTarget.dataset) || {};
    const field = dataset.field;
    if (!field) {
      return;
    }
    const value = (event && event.detail && event.detail.value) || '';
    this.setData({
      profile: Object.assign({}, this.data.profile, { [field]: value }),
      errorMessage: '',
      successMessage: '',
    });
  },

  handleMajorChange(event) {
    const value = (event && event.detail && event.detail.value) || 0;
    const index = Number(value);
    const majors = this.data.majors || [];
    const major = majors[index] || { id: '' };
    const majorId = major.id || '';
    this.setData({
      profile: Object.assign({}, this.data.profile, { majorId }),
      selectedMajorName: resolveMajorName(majorId, majors),
      errorMessage: '',
      successMessage: '',
    });
  },

  handleLoginInput(event) {
    const dataset = (event && event.currentTarget && event.currentTarget.dataset) || {};
    const field = dataset.field;
    if (!field) {
      return;
    }
    const value = (event && event.detail && event.detail.value) || '';
    this.setData({
      loginForm: Object.assign({}, this.data.loginForm, { [field]: value }),
      selectedDemoKey: '',
      errorMessage: '',
      successMessage: '',
    });
  },

  useDemoAccount(event) {
    const dataset = (event && event.currentTarget && event.currentTarget.dataset) || {};
    if (!dataset.username || !dataset.password || !dataset.key) {
      return;
    }
    this.setData({
      loginForm: { username: dataset.username, password: dataset.password },
      selectedDemoKey: dataset.key,
      errorMessage: '',
      successMessage: '',
    });
    wx.showToast({ title: '已填充体验账号', icon: 'none' });
  },

  async submitLogin() {
    const username = (this.data.loginForm && this.data.loginForm.username) || '';
    const password = (this.data.loginForm && this.data.loginForm.password) || '';

    if (!username || !password) {
      this.setData({ errorMessage: '请输入用户名和密码' });
      return;
    }

    this.setData({ loggingIn: true, errorMessage: '', successMessage: '' });

    try {
      const session = await loginRequest(String(username).trim(), password);
      const app = getApp();
      if (app && typeof app.setSessionUser === 'function') {
        app.setSessionUser(session);
      }
      this.setData({ sessionUser: session, loginForm: createLoginForm(), selectedDemoKey: '' });
      await this.loadProfile();
      this.setData({ successMessage: '登录成功。' });
      wx.showToast({ title: '登录成功', icon: 'success' });
    } catch (error) {
      this.setData({ errorMessage: (error && error.message) || '登录失败，请稍后重试。' });
    } finally {
      this.setData({ loggingIn: false });
    }
  },

  handleRegisterTap() {
    wx.navigateTo({ url: '/pages/intro/index' });
  },

  async logoutUser() {
    this.setData({ loading: true, errorMessage: '', successMessage: '' });
    try {
      await logoutRequest();
      const app = getApp();
      if (app && typeof app.setSessionUser === 'function') {
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
    } catch (error) {
      this.setData({ errorMessage: (error && error.message) || '退出登录失败，请稍后重试。' });
    } finally {
      this.setData({ loading: false });
    }
  },

  async saveProfile() {
    const profile = this.data.profile || {};

    if (!profile.name || !String(profile.name).trim()) {
      this.setData({ errorMessage: '请填写姓名' });
      return;
    }

    const payload = {
      name: String(profile.name).trim(),
      email: profile.email ? String(profile.email).trim() : null,
      phone: profile.phone ? String(profile.phone).trim() : null,
      organization: profile.organization ? String(profile.organization).trim() : null,
      goal: profile.goal ? String(profile.goal).trim() : null,
      bio: profile.bio ? String(profile.bio).trim() : null,
      majorId: profile.majorId || null,
    };

    this.setData({ saving: true, errorMessage: '', successMessage: '' });

    try {
      await ensureSession();
      await apiRequest({
        path: `/users/${profile.id}`,
        method: 'PATCH',
        data: payload,
      });
      const updated = await this.fetchProfile(profile.id);
      const majors = this.data.majors || [];
      this.setData({
        profile: updated,
        selectedMajorName: resolveMajorName(updated.majorId, majors),
        successMessage: '资料已更新。',
      });
    } catch (error) {
      const statusCode = error && error.statusCode;
      const message =
        statusCode === 401
          ? '请先登录后再保存资料。'
          : (error && error.message) || '保存资料失败，请稍后重试。';
      this.setData({ errorMessage: message });
    } finally {
      this.setData({ saving: false });
    }
  },
});
