export interface CourseProgress {
  id: string;
  title: string;
  category: '公共课' | '专业课';
  teacher: string;
  progress: number;
  nextTask: string;
}

export interface PracticeSet {
  id: string;
  name: string;
  questions: number;
  accuracy: number;
  lastAttempt: string;
}

export interface ScheduleItem {
  id: string;
  title: string;
  type: '直播课' | '自习' | '模拟考试';
  start: string;
  end: string;
  location?: string;
}

export type DashboardStatId = 'studyTime' | 'questionDrill' | 'courseFocus' | 'mockRank';

export interface DashboardStat {
  id: DashboardStatId;
  title: string;
  value: string;
  helperText: string;
  accent: string;
}

export interface DashboardFallbackData {
  userName: string;
  stats: DashboardStat[];
  courses: CourseProgress[];
  practiceSets: PracticeSet[];
  schedule: ScheduleItem[];
  recommendation: string;
}

export const courseProgressData: CourseProgress[] = [
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

export const practiceSets: PracticeSet[] = [
  {
    id: 'ps1',
    name: '数学一选择题强化',
    questions: 60,
    accuracy: 0.74,
    lastAttempt: '2024-03-08',
  },
  {
    id: 'ps2',
    name: '政治主观题热点预测',
    questions: 20,
    accuracy: 0.6,
    lastAttempt: '2024-03-07',
  },
  {
    id: 'ps3',
    name: '英语翻译与写作',
    questions: 10,
    accuracy: 0.82,
    lastAttempt: '2024-03-05',
  },
];

export const schedule: ScheduleItem[] = [
  {
    id: 'sc1',
    title: '数学一刷题营直播',
    type: '直播课',
    start: '2024-03-10T19:00:00',
    end: '2024-03-10T21:00:00',
    location: '腾讯会议 938-102-xxx',
  },
  {
    id: 'sc2',
    title: '公共课晨读打卡',
    type: '自习',
    start: '2024-03-11T06:50:00',
    end: '2024-03-11T07:30:00',
  },
  {
    id: 'sc3',
    title: '英语一模拟考',
    type: '模拟考试',
    start: '2024-03-16T13:30:00',
    end: '2024-03-16T17:30:00',
  },
];

export const dashboardStats: DashboardStat[] = [
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

export const dashboardFallback: DashboardFallbackData = {
  userName: '张同学',
  stats: dashboardStats,
  courses: courseProgressData,
  practiceSets,
  schedule,
  recommendation:
    '结合你的练习记录，建议本周重点回顾线性代数特征值章节，并安排一次政治时事热点速记。周末尝试进行一次 3 小时完整模拟，提前适应考试节奏。',
};
