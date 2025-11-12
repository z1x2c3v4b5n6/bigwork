const {
  dashboardSnapshotSeed,
  dashboardStatsSeed,
  courseProgressSeed,
  practiceSetSeed,
  scheduleSeed,
} = require('../../data/dashboard.js');
const { loadFromStorage, saveToStorage } = require('../../utils/storage.js');

const DASHBOARD_STORAGE_KEY = 'dashboardSnapshot';

const clampNumber = (value, min, max) => {
  const num = Number(value);
  if (Number.isNaN(num)) {
    return min;
  }
  return Math.min(max, Math.max(min, num));
};

const pad = (value) => (value < 10 ? `0${value}` : `${value}`);

const toTimestamp = (value) => {
  if (!value) {
    return Date.now();
  }
  const candidate = String(value).includes('T') ? value : String(value).replace(' ', 'T');
  const date = new Date(candidate);
  return Number.isNaN(date.getTime()) ? Date.now() : date.getTime();
};

const formatDisplayTime = (value) => {
  const timestamp = toTimestamp(value);
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const normalizeDashboard = (snapshot) => {
  const normalizeCourses = (snapshot.courses || []).map((course) => ({
    id: course.id,
    title: course.title,
    category: course.category,
    teacher: course.teacher,
    progress: clampNumber(course.progress, 0, 100),
    nextTask: course.nextTask,
  }));

  const normalizePractice = (snapshot.practiceSets || []).map((set) => {
    const accuracy = clampNumber(set.accuracy, 0, 1);
    const focusText = set.focus && String(set.focus).trim() ? set.focus : '请在刷题页补充';
    return Object.assign({}, set, {
      accuracy,
      accuracyText: `${Math.round(accuracy * 100)}%`,
      focusText,
    });
  });

  const normalizeSchedule = (snapshot.schedule || [])
    .map((item) => ({
      id: item.id || `schedule_${Date.now()}`,
      title: item.title || '学习任务',
      type: item.type || '自习',
      start: formatDisplayTime(item.start),
      end: formatDisplayTime(item.end),
      location: item.location,
      focus: item.focus,
      tags: Array.isArray(item.tags) ? item.tags : [],
      _timestamp: toTimestamp(item.start),
    }))
    .sort((a, b) => a._timestamp - b._timestamp)
    .map((item) => {
      const clone = Object.assign({}, item);
      delete clone._timestamp;
      return clone;
    });

  return {
    userName: snapshot.userName || dashboardSnapshotSeed.userName,
    stats: snapshot.stats && snapshot.stats.length ? snapshot.stats : dashboardStatsSeed,
    courses: normalizeCourses.length ? normalizeCourses : courseProgressSeed,
    practiceSets: normalizePractice.length
      ? normalizePractice
      : practiceSetSeed.map((set) =>
          Object.assign({}, set, {
            accuracyText: `${Math.round((set.accuracy || 0) * 100)}%`,
            focusText: set.focus && String(set.focus).trim() ? set.focus : '请在刷题页补充',
          })
        ),
    schedule: normalizeSchedule.length
      ? normalizeSchedule
      : scheduleSeed.map((item) => ({
          id: item.id,
          title: item.title,
          type: item.type,
          start: formatDisplayTime(item.start),
          end: formatDisplayTime(item.end),
          location: item.location,
          focus: item.focus,
          tags: Array.isArray(item.tags) ? item.tags : [],
        })),
    recommendation: snapshot.recommendation || dashboardSnapshotSeed.recommendation,
  };
};

const quickLinkEntries = [
  { id: 'advisor', label: '院校推荐', caption: '智能匹配', icon: '🎯', page: 'advisor' },
  { id: 'analytics', label: '学习分析', caption: '数据看板', icon: '📊', page: 'analytics' },
  { id: 'forum', label: '考研论坛', caption: '交流讨论', icon: '💬', page: 'forum' },
  { id: 'admin', label: '后台管理', caption: '运营任务', icon: '🛠️', page: 'admin' },
  { id: 'checkin', label: '今日打卡', caption: '完成计划', icon: '✅', page: 'checkin', variant: 'accent' },
  { id: 'ai', label: 'AI 助手', caption: '随问随答', icon: '🤖', page: 'ai', variant: 'accent' },
];

Page({
  data: {
    quickLinks: quickLinkEntries,
    snapshot: normalizeDashboard(loadFromStorage(DASHBOARD_STORAGE_KEY, dashboardSnapshotSeed)),
  },

  onShow() {
    const snapshot = loadFromStorage(DASHBOARD_STORAGE_KEY, dashboardSnapshotSeed);
    const normalized = normalizeDashboard(snapshot);
    this.setData({ snapshot: normalized });
    saveToStorage(DASHBOARD_STORAGE_KEY, normalized);
  },

  navigateToPage(event) {
    const dataset = (event && event.currentTarget && event.currentTarget.dataset) || {};
    const page = dataset.page;
    const openType = dataset.openType || 'navigate';
    if (!page) {
      return;
    }
    const url = `/pages/${page}/index`;
    if (openType === 'switchTab') {
      wx
        .switchTab({ url })
        .catch((error) => {
          console.warn('切换 Tab 失败', error);
        });
      return;
    }
    wx
      .navigateTo({ url })
      .catch((error) => {
        console.warn('导航失败', error);
      });
  },
});
