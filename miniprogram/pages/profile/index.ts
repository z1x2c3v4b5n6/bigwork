import { type UserProfile } from '../../data/profile';
import { apiRequest, type ApiError } from '../../utils/api';
import { ensureSession, login as loginRequest, logout as logoutRequest, type SessionUser } from '../../utils/session';

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

    if (app?.globalData?.sessionUser) {
      this.setData({ sessionUser: app.globalData.sessionUser });
    }

    let session: SessionUser | null = null;

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
      errorMessage: '',
      successMessage: '',
    });
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
      this.setData({ sessionUser: session, loginForm: createLoginForm(), successMessage: '登录成功。' });
      await this.loadProfile();
    } catch (error) {
      const apiError = error as ApiError;
      this.setData({ errorMessage: apiError?.message || '登录失败，请稍后重试。' });
    } finally {
      this.setData({ loggingIn: false });
    }
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
});
