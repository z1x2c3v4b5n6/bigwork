export interface CourseProgress {
  id: string;
  title: string;
  category: '公共课' | '专业课' | string;
  teacher: string;
  progress: number;
  nextTask: string;
}

export interface PracticeSetPreview {
  id: string;
  name: string;
  questions: number;
  accuracy: number;
  lastAttempt: string;
  focus?: string;
  difficulty?: '基础' | '进阶' | '冲刺' | string;
  duration?: number;
  source?: string;
  latestScore?: number | null;
  latestSummary?: string;
}

export interface ScheduleItem {
  id: string;
  title: string;
  type: '直播课' | '自习' | '模拟考试' | '教练辅导' | string;
  start: string;
  end: string;
  location?: string;
  focus?: string;
  tags?: string[];
}

export interface DashboardStat {
  id: string;
  title: string;
  value: string;
  helperText: string;
  accent: string;
}

export interface DashboardSnapshot {
  userName: string;
  stats: DashboardStat[];
  courses: CourseProgress[];
  practiceSets: PracticeSetPreview[];
  schedule: ScheduleItem[];
  recommendation: string;
}

export const courseProgressSeed: CourseProgress[] = [
  {
    id: 'english',
    title: '英语一真题精讲营',
    category: '公共课',
    teacher: '王老师',
    progress: 68,
    nextTask: '完成 2018 年阅读理解 B 讲义',
  },
  {
    id: 'politics',
    title: '肖秀荣政治冲刺课',
    category: '公共课',
    teacher: '肖老师',
    progress: 42,
    nextTask: '背诵时政 50 题（第三章）',
  },
  {
    id: 'major',
    title: '计算机 408 高频考点训练营',
    category: '专业课',
    teacher: '张老师',
    progress: 55,
    nextTask: '完成 栈与队列 章节刷题',
  },
];

export const practiceSetSeed: PracticeSetPreview[] = [
  {
    id: 'practice_001',
    name: '数学一选择题强化',
    questions: 60,
    accuracy: 0.78,
    lastAttempt: '2024-04-10T13:00:00.000Z',
    focus: '线性代数 · 特征值',
    difficulty: '进阶',
    duration: 40,
    source: '系统推荐',
    latestScore: 82,
    latestSummary: '最近一次正确 49/60 题，错题集中在线性代数与概率统计。',
  },
  {
    id: 'practice_002',
    name: '政治主观题热点预测',
    questions: 24,
    accuracy: 0.64,
    lastAttempt: '2024-04-09T10:00:00.000Z',
    focus: '时政热点 · 共同富裕',
    difficulty: '冲刺',
    duration: 35,
    source: '系统推荐',
    latestScore: 76,
    latestSummary: '主观题结构良好，建议补充最新时政案例。',
  },
  {
    id: 'practice_003',
    name: '英语翻译与写作',
    questions: 12,
    accuracy: 0.83,
    lastAttempt: '2024-04-08T08:00:00.000Z',
    focus: '写作逻辑 · 段落衔接',
    difficulty: '基础',
    duration: 30,
    source: '系统推荐',
    latestScore: 88,
    latestSummary: '写作逻辑连贯，关注细节词汇准确性。',
  },
];

export const scheduleSeed: ScheduleItem[] = [
  {
    id: 'schedule_001',
    title: '数学一刷题营直播',
    type: '直播课',
    start: '2024-04-12T19:00:00.000Z',
    end: '2024-04-12T21:00:00.000Z',
    location: '腾讯会议 938-102-xxx',
    focus: '高频错题解析',
    tags: ['直播', '数学'],
  },
  {
    id: 'schedule_002',
    title: '公共课晨读打卡',
    type: '自习',
    start: '2024-04-13T06:50:00.000Z',
    end: '2024-04-13T07:30:00.000Z',
    focus: '英语单词复盘',
    tags: ['晨读', '打卡'],
  },
  {
    id: 'schedule_003',
    title: '英语一模拟考',
    type: '模拟考试',
    start: '2024-04-14T13:30:00.000Z',
    end: '2024-04-14T17:30:00.000Z',
    location: '线下教室 A301',
    focus: '全真模拟',
    tags: ['模考', '英语'],
  },
  {
    id: 'schedule_004',
    title: '晚间错题精炼',
    type: '自习',
    start: '2024-04-12T21:30:00.000Z',
    end: '2024-04-12T22:30:00.000Z',
    focus: '整理数学错题',
    tags: ['错题', '整理'],
  },
];

export const dashboardStatsSeed: DashboardStat[] = [
  {
    id: 'studyTime',
    title: '本周学习时长',
    value: '26.5 小时',
    helperText: '比上周提升 12%',
    accent: 'rgba(25, 118, 210, 0.2)',
  },
  {
    id: 'questionDrill',
    title: '累计刷题',
    value: '860 题',
    helperText: '连续 12 天完成每日计划',
    accent: 'rgba(255, 112, 67, 0.25)',
  },
  {
    id: 'courseFocus',
    title: '重点突破课',
    value: '8 门',
    helperText: '新上线 2 门冲刺小班',
    accent: 'rgba(102, 187, 106, 0.25)',
  },
  {
    id: 'mockRank',
    title: '阶段模考排名',
    value: 'TOP 12%',
    helperText: '保持冲刺节奏，继续巩固弱项',
    accent: 'rgba(255, 213, 79, 0.35)',
  },
];

export const dashboardSnapshotSeed: DashboardSnapshot = {
  userName: '张同学',
  stats: dashboardStatsSeed,
  courses: courseProgressSeed,
  practiceSets: practiceSetSeed,
  schedule: scheduleSeed,
  recommendation:
    '结合你的练习记录，建议本周重点回顾线性代数特征值章节，并安排一次政治时事热点速记。周末尝试进行一次 3 小时完整模拟，提前适应考试节奏。',
};
