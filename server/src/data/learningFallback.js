const formatDateOnly = (value) => {
  if (!value) {
    return null;
  }

  const base = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  if (Number.isNaN(base.getTime())) {
    return null;
  }

  base.setHours(0, 0, 0, 0);
  const year = base.getFullYear();
  const month = `${base.getMonth() + 1}`.padStart(2, '0');
  const day = `${base.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const dailyTaskTemplates = [
  {
    id: 'fallback-english',
    title: '英语晨读 + 范文精听',
    description: '精读 2 篇高分范文，圈画高频句型并朗读跟读，巩固语感。',
    targetText: '完成 2 篇英语作文精读',
    estimatedMinutes: 45,
  },
  {
    id: 'fallback-algorithm',
    title: '408 算法专项刷题',
    description: '围绕图论和动态规划完成真题演练，记录易错点。',
    targetText: '刷完 20 道算法题',
    estimatedMinutes: 60,
  },
  {
    id: 'fallback-politics',
    title: '时政要点速记',
    description: '梳理近两周重大时政并总结答题金句，完善政治素材库。',
    targetText: '整理 5 个热点案例',
    estimatedMinutes: 35,
  },
  {
    id: 'fallback-math',
    title: '数学真题限时训练',
    description: '选做线代与概率论各 1 套真题，训练解题速度与准确率。',
    targetText: '完成 2 套真题套题',
    estimatedMinutes: 70,
  },
  {
    id: 'fallback-interview',
    title: '复试结构化模拟',
    description: '准备 3 个常见复试问题的回答，录音复盘语言表达与逻辑结构。',
    targetText: '输出 3 个复试答案',
    estimatedMinutes: 40,
  },
];

const fallbackLeaderboardGlobal = [
  {
    id: 'fallback-leader-01',
    name: '程琳',
    university: '华中科技大学',
    progress: 96,
    hours: 52,
  },
  {
    id: 'fallback-leader-02',
    name: '李越',
    university: '北京邮电大学',
    progress: 91,
    hours: 49,
  },
  {
    id: 'fallback-leader-03',
    name: '王琪',
    university: '电子科技大学',
    progress: 88,
    hours: 46,
  },
  {
    id: 'fallback-leader-04',
    name: '周楠',
    university: '东南大学',
    progress: 86,
    hours: 44,
  },
  {
    id: 'fallback-leader-05',
    name: '黄思',
    university: '中山大学',
    progress: 84,
    hours: 41,
  },
];

const campusLeaderboardGroups = [
  {
    keywords: ['华中科技', 'HUST'],
    entries: [
      { id: 'fallback-campus-hust-01', name: '你', university: '华中科技大学', progress: 82, hours: 28 },
      { id: 'fallback-campus-hust-02', name: '同学 A', university: '华中科技大学', progress: 78, hours: 26 },
      { id: 'fallback-campus-hust-03', name: '同学 B', university: '华中科技大学', progress: 75, hours: 24 },
    ],
  },
  {
    keywords: ['北京邮电', '北邮'],
    entries: [
      { id: 'fallback-campus-bupt-01', name: '你', university: '北京邮电大学', progress: 83, hours: 27 },
      { id: 'fallback-campus-bupt-02', name: '研友 1', university: '北京邮电大学', progress: 80, hours: 26 },
      { id: 'fallback-campus-bupt-03', name: '研友 2', university: '北京邮电大学', progress: 76, hours: 24 },
    ],
  },
];

const defaultCampusEntries = [
  { id: 'fallback-campus-default-01', name: '校友 A', university: '同校研友', progress: 81, hours: 25 },
  { id: 'fallback-campus-default-02', name: '校友 B', university: '同校研友', progress: 77, hours: 23 },
  { id: 'fallback-campus-default-03', name: '校友 C', university: '同校研友', progress: 74, hours: 21 },
];

const fallbackCompletionStore = new Map();

const getTemplateForDate = (dateString) => {
  if (!dailyTaskTemplates.length) {
    return null;
  }
  const indexSeed = dateString
    .split('-')
    .map((fragment) => Number.parseInt(fragment, 10))
    .filter((value) => Number.isFinite(value))
    .reduce((accumulator, value) => accumulator + value, 0);
  const index = Math.abs(indexSeed) % dailyTaskTemplates.length;
  return dailyTaskTemplates[index];
};

const getFallbackTaskForDate = (value) => {
  const date = formatDateOnly(value) || formatDateOnly(new Date());
  if (!date) {
    return null;
  }
  const template = getTemplateForDate(date) || dailyTaskTemplates[0];
  return {
    id: `${template.id}-${date}`,
    title: template.title,
    description: template.description,
    targetText: template.targetText,
    estimatedMinutes: template.estimatedMinutes,
    date,
  };
};

const recordFallbackCompletion = (userId, date) => {
  if (!userId) {
    return;
  }
  const normalizedDate = formatDateOnly(date);
  if (!normalizedDate) {
    return;
  }
  const existing = fallbackCompletionStore.get(userId) || new Set();
  existing.add(normalizedDate);
  fallbackCompletionStore.set(userId, existing);
};

const getFallbackCompletionDates = (userId) => {
  if (!userId) {
    return [];
  }
  const store = fallbackCompletionStore.get(userId);
  return store ? Array.from(store.values()) : [];
};

const getFallbackLeaderboard = (scope = 'global', sessionUser = null) => {
  if (scope === 'campus') {
    const campusText =
      (sessionUser?.organization || sessionUser?.university || sessionUser?.school || '')
        .toString()
        .trim();
    if (campusText) {
      const matchedGroup = campusLeaderboardGroups.find((group) =>
        group.keywords.some((keyword) => campusText.includes(keyword)),
      );
      if (matchedGroup) {
        return matchedGroup.entries;
      }
    }
    return defaultCampusEntries;
  }

  return fallbackLeaderboardGlobal;
};

module.exports = {
  getFallbackTaskForDate,
  recordFallbackCompletion,
  getFallbackCompletionDates,
  getFallbackLeaderboard,
  formatDateOnly,
  __resetLearningFallbackState: () => {
    fallbackCompletionStore.clear();
  },
};
