import {
  dashboardSnapshotSeed,
  dashboardStatsSeed,
  courseProgressSeed,
  practiceSetSeed,
  scheduleSeed,
  type DashboardSnapshot,
  type PracticeSetPreview,
} from '../../data/dashboard';
import { loadFromStorage, saveToStorage } from '../../utils/storage';

const DASHBOARD_STORAGE_KEY = 'dashboardSnapshot';

type DashboardViewModel = DashboardSnapshot & {
  practiceSets: (PracticeSetPreview & { accuracyText: string; focusText: string })[];
};

const normalizeDashboard = (snapshot: DashboardSnapshot): DashboardViewModel => {
  const normalizeCourses = (snapshot.courses ?? []).map((course) => ({
    ...course,
    progress: Math.min(100, Math.max(0, Number(course.progress ?? 0))),
  }));

  const normalizePractice = (snapshot.practiceSets ?? []).map((set) => {
    const accuracy = Math.max(0, Math.min(1, Number(set.accuracy ?? 0)));
    const accuracyText = `${Math.round(accuracy * 100)}%`;
    const focusText = set.focus && set.focus.trim() ? set.focus : '请在刷题页补充';
    return { ...set, accuracy, accuracyText, focusText };
  });

  const normalizeSchedule = (snapshot.schedule ?? []).map((item) => ({
    ...item,
    tags: Array.isArray(item.tags) ? item.tags : [],
  }));

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
    schedule: normalizeSchedule.length > 0 ? normalizeSchedule : scheduleSeed.map((item) => ({
      ...item,
      tags: Array.isArray(item.tags) ? item.tags : [],
    })),
    recommendation: snapshot.recommendation || dashboardSnapshotSeed.recommendation,
  };
};

Page({
  data: {
    snapshot: normalizeDashboard(dashboardSnapshotSeed),
  },

  onShow() {
    const snapshot = loadFromStorage<DashboardSnapshot>(DASHBOARD_STORAGE_KEY, dashboardSnapshotSeed);
    const normalized = normalizeDashboard(snapshot);

    this.setData({ snapshot: normalized });

    saveToStorage(DASHBOARD_STORAGE_KEY, normalized);
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
