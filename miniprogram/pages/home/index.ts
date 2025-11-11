import {
  dashboardSnapshotSeed,
  dashboardStatsSeed,
  courseProgressSeed,
  practiceSetSeed,
  scheduleSeed,
  type DashboardSnapshot,
  type PracticeSetPreview,
  type ScheduleItem,
} from '../../data/dashboard';
import { apiRequest, type ApiError } from '../../utils/api';
import { ensureSession } from '../../utils/session';
import { loadFromStorage, saveToStorage } from '../../utils/storage';

const DASHBOARD_STORAGE_KEY = 'dashboardSnapshot';

type DashboardViewModel = DashboardSnapshot & {
  practiceSets: (PracticeSetPreview & { accuracyText: string; focusText: string })[];
  schedule: ScheduleItem[];
};

const clampNumber = (value: unknown, min: number, max: number) => {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return min;
  }
  return Math.min(max, Math.max(min, numeric));
};

const pad = (value: number) => (value < 10 ? `0${value}` : `${value}`);

const toTimestamp = (value: string | undefined | null) => {
  if (!value) {
    return Date.now();
  }
  const candidate = value.includes('T') ? value : value.replace(' ', 'T');
  const parsed = new Date(candidate);
  return Number.isNaN(parsed.getTime()) ? Date.now() : parsed.getTime();
};

const formatDisplayTime = (value: string | undefined | null) => {
  const timestamp = toTimestamp(value);
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
};

const normalizeDashboard = (snapshot: DashboardSnapshot): DashboardViewModel => {
  const normalizeCourses = (snapshot.courses ?? []).map((course) => ({
    ...course,
    progress: clampNumber(course.progress, 0, 100),
  }));

  const normalizePractice = (snapshot.practiceSets ?? []).map((set) => {
    const accuracy = clampNumber(set.accuracy, 0, 1);
    const accuracyText = `${Math.round(accuracy * 100)}%`;
    const focusText = set.focus && set.focus.trim() ? set.focus : '请在刷题页补充';
    return { ...set, accuracy, accuracyText, focusText };
  });

  const normalizeSchedule = (snapshot.schedule ?? [])
    .map((item) => ({
      ...item,
      start: formatDisplayTime(item.start),
      end: formatDisplayTime(item.end),
      tags: Array.isArray(item.tags) ? item.tags : [],
      _timestamp: toTimestamp(item.start),
    }))
    .sort((a, b) => a._timestamp - b._timestamp)
    .map(({ _timestamp, ...rest }) => rest as ScheduleItem);

  return {
    userName: snapshot.userName || dashboardSnapshotSeed.userName,
    stats: snapshot.stats && snapshot.stats.length > 0 ? snapshot.stats : dashboardStatsSeed,
    courses: normalizeCourses.length > 0 ? normalizeCourses : courseProgressSeed,
    practiceSets:
      normalizePractice.length > 0
        ? normalizePractice
        : practiceSetSeed.map((set) => ({
            ...set,
            accuracyText: `${Math.round((set.accuracy ?? 0) * 100)}%`,
            focusText: set.focus && set.focus.trim() ? set.focus : '请在刷题页补充',
          })),
    schedule:
      normalizeSchedule.length > 0
        ? normalizeSchedule
        : scheduleSeed.map((item) => ({
            ...item,
            start: formatDisplayTime(item.start),
            end: formatDisplayTime(item.end),
            tags: Array.isArray(item.tags) ? item.tags : [],
          })),
    recommendation: snapshot.recommendation || dashboardSnapshotSeed.recommendation,
  };
};

Page({
  data: {
    snapshot: normalizeDashboard(
      loadFromStorage<DashboardSnapshot>(DASHBOARD_STORAGE_KEY, dashboardSnapshotSeed),
    ),
    loading: false,
    errorMessage: '',
  },

  onShow() {
    void this.loadDashboard();
  },

  async loadDashboard() {
    this.setData({ loading: true, errorMessage: '' });

    try {
      await ensureSession();
    } catch (error) {
      const apiError = error as ApiError;
      const message =
        apiError?.statusCode === 401
          ? '请先在个人中心使用账号密码登录后，再刷新学习看板。'
          : apiError?.message || '无法校验登录状态，请稍后重试。';
      this.setData({ loading: false, errorMessage: message });
      return;
    }

    try {
      const snapshot = await apiRequest<DashboardSnapshot>({ path: '/learning/dashboard' });
      const normalized = normalizeDashboard(snapshot);
      this.setData({ snapshot: normalized });
      saveToStorage(DASHBOARD_STORAGE_KEY, snapshot);
    } catch (error) {
      const apiError = error as ApiError;
      const message = apiError?.message || '加载学习看板失败，请稍后重试。';
      this.setData({ errorMessage: message });
    } finally {
      this.setData({ loading: false });
    }
  },

  navigateToPage(event: WechatMiniprogram.BaseEvent) {
    const page = event.currentTarget?.dataset?.page;
    if (!page) {
      return;
    }
    wx.navigateTo({ url: `/pages/${page}/index` }).catch((error) => {
      console.warn('导航失败', error);
    });
  },
});
