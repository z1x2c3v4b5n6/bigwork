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
