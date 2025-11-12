import { type UserProfile } from '../../data/profile';
import { apiRequest, type ApiError } from '../../utils/api';
import {
  ensureSession,
  getStoredSession,
  login as loginRequest,
  logout as logoutRequest,
  type SessionUser,
} from '../../utils/session';

interface MajorOption {
  id: string;
  name: string;
  description?: string | null;
}

const createEmptyProfile = (): UserProfile => ({
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

interface DemoAccount {
  key: string;
  label: string;
  username: string;
  password: string;
  description: string;
}

const demoAccounts: DemoAccount[] = [
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

const resolveMajorName = (majorId: string, majors: MajorOption[]) =>
  majors.find((major) => major.id === majorId)?.name ?? '请选择';

const mapProfile = (profile: Record<string, unknown>): UserProfile => ({
  id: profile.id != null ? String(profile.id) : '',
  role: (profile.role === 'admin' ? 'admin' : 'student') as UserProfile['role'],
  name: typeof profile.name === 'string' ? profile.name : '未命名用户',
  email: (typeof profile.email === 'string' && profile.email) || '',
  phone: (typeof profile.phone === 'string' && profile.phone) || '',
  organization: (typeof profile.organization === 'string' && profile.organization) || '',
  goal: (typeof profile.goal === 'string' && profile.goal) || '',
  majorId: profile.majorId != null ? String(profile.majorId) : '',
  bio: (typeof profile.bio === 'string' && profile.bio) || '',
  avatar: (typeof profile.avatar === 'string' && profile.avatar) || '',
});

Page({
  data: {
    profile: createEmptyProfile(),
    majors: [] as MajorOption[],
    selectedMajorName: '请选择',
    sessionUser: null as SessionUser | null,
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
    void this.loadProfile();
  },

  async loadProfile() {
    this.setData({ loading: true, errorMessage: '', successMessage: '' });

    const app = getApp<{
      globalData: { sessionUser: SessionUser | null };
      setSessionUser?: (user: SessionUser | null) => void;
    }>();

    let session: SessionUser | null = app?.globalData?.sessionUser ?? null;

    if (!session) {
      session = getStoredSession();
      if (session && app?.setSessionUser) {
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
      if (app?.setSessionUser) {
        app.setSessionUser(session);
      }
      this.setData({ sessionUser: session });
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError?.statusCode === 401) {
        this.setData({ loading: false, sessionUser: null });
        return;
      }
      this.setData({ loading: false, errorMessage: apiError?.message || '无法校验登录状态，请稍后重试。' });
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
      const apiError = error as ApiError;
      this.setData({ errorMessage: apiError?.message || '加载个人资料失败，请稍后重试。' });
    } finally {
      this.setData({ loading: false });
    }
  },

  async fetchMajors(): Promise<MajorOption[]> {
    try {
      const majors = await apiRequest<MajorOption[]>({ path: '/majors' });
      return majors
        .map((major) => ({
          id: major.id != null ? String(major.id) : '',
          name: major.name || '未命名专业',
          description: major.description ?? null,
        }))
        .filter((major) => major.id);
    } catch (error) {
      console.warn('加载专业列表失败', error);
      return [];
    }
  },

  async fetchProfile(userId: string): Promise<UserProfile> {
    const response = await apiRequest<Record<string, unknown>>({ path: `/users/${userId}` });
    return mapProfile(response);
  },

  handleInput(event: WechatMiniprogram.Input) {
    const field = event.currentTarget?.dataset?.field as keyof UserProfile | undefined;
    if (!field) {
      return;
    }
    const value = event.detail.value ?? '';
    this.setData({
      profile: { ...this.data.profile, [field]: value },
      errorMessage: '',
      successMessage: '',
    });
  },

  handleMajorChange(event: WechatMiniprogram.PickerChange) {
    const index = Number(event.detail.value ?? 0);
    const majorId = this.data.majors[index]?.id ?? '';
    this.setData({
      profile: { ...this.data.profile, majorId },
      selectedMajorName: resolveMajorName(majorId, this.data.majors),
      errorMessage: '',
      successMessage: '',
    });
  },

  handleLoginInput(event: WechatMiniprogram.Input) {
    const field = event.currentTarget?.dataset?.field as keyof ReturnType<typeof createLoginForm> | undefined;
    if (!field) {
      return;
    }
    const value = event.detail.value ?? '';
    this.setData({
      loginForm: { ...this.data.loginForm, [field]: value },
      selectedDemoKey: '',
      errorMessage: '',
      successMessage: '',
    });
  },

  useDemoAccount(event: WechatMiniprogram.BaseEvent) {
    const dataset = event.currentTarget?.dataset as
      | (Record<string, unknown> & { key?: string; username?: string; password?: string })
      | undefined;
    const username = typeof dataset?.username === 'string' ? dataset.username : '';
    const password = typeof dataset?.password === 'string' ? dataset.password : '';
    const key = typeof dataset?.key === 'string' ? dataset.key : '';

    if (!username || !password || !key) {
      return;
    }
    this.setData({
      loginForm: { username, password },
      selectedDemoKey: key,
      errorMessage: '',
      successMessage: '',
    });
    wx.showToast({ title: '已填充体验账号', icon: 'none' });
  },

  async submitLogin() {
    const { username, password } = this.data.loginForm;

    if (!username || !password) {
      this.setData({ errorMessage: '请输入用户名和密码' });
      return;
    }

    this.setData({ loggingIn: true, errorMessage: '', successMessage: '' });

    try {
      const session = await loginRequest(username.trim(), password);
      const app = getApp<{ setSessionUser?: (user: SessionUser | null) => void }>();
      if (app?.setSessionUser) {
        app.setSessionUser(session);
      }
      this.setData({ sessionUser: session, loginForm: createLoginForm(), selectedDemoKey: '' });
      await this.loadProfile();
      this.setData({ successMessage: '登录成功。' });
      wx.showToast({ title: '登录成功', icon: 'success' });
    } catch (error) {
      const apiError = error as ApiError;
      this.setData({ errorMessage: apiError?.message || '登录失败，请稍后重试。' });
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
      const app = getApp<{ setSessionUser?: (user: SessionUser | null) => void }>();
      if (app?.setSessionUser) {
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
      const apiError = error as ApiError;
      this.setData({ errorMessage: apiError?.message || '退出登录失败，请稍后重试。' });
    } finally {
      this.setData({ loading: false });
    }
  },

  async saveProfile() {
    const profile = this.data.profile;

    if (!profile.name || !profile.name.trim()) {
      this.setData({ errorMessage: '请填写姓名' });
      return;
    }

    const payload = {
      name: profile.name.trim(),
      email: profile.email?.trim() || null,
      phone: profile.phone?.trim() || null,
      organization: profile.organization?.trim() || null,
      goal: profile.goal?.trim() || null,
      bio: profile.bio?.trim() || null,
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
      this.setData({
        profile: updated,
        selectedMajorName: resolveMajorName(updated.majorId, this.data.majors),
        successMessage: '资料已更新。',
      });
    } catch (error) {
      const apiError = error as ApiError;
      const message =
        apiError?.statusCode === 401
          ? '请先登录后再保存资料。'
          : apiError?.message || '保存资料失败，请稍后重试。';
      this.setData({ errorMessage: message });
    } finally {
      this.setData({ saving: false });
    }
  },

  navigateToAdmin() {
    wx.navigateTo({ url: '/pages/admin/index' }).catch((error) => {
      console.warn('进入后台管理失败', error);
      wx.showToast({ title: '无法打开后台管理', icon: 'none' });
    });
  },
});
