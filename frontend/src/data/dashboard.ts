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
  focus?: string;
  difficulty?: '基础' | '进阶' | '冲刺';
  duration?: number;
  source?: string;
  latestScore?: number | null;
  latestSummary?: string;
}

export interface ScheduleItem {
  id: string;
  title: string;
  type: '直播课' | '自习' | '模拟考试' | '教练辅导';
  start: string;
  end: string;
  location?: string;
  focus?: string;
  tags?: string[];
  createdAt?: string;
}

export type DashboardStatId = 'studyTime' | 'questionDrill' | 'courseFocus' | 'mockRank';

export interface DashboardStat {
  id: DashboardStatId;
  title: string;
  value: string;
  helperText: string;
  accent: string;
}

export interface DashboardPushMessage {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  type?: string;
  action?: { label: string; url: string } | null;
}

export interface InstitutionHistoryRecord {
  year: number;
  enrollment: number | null;
  scoreLine: number | null;
  note?: string;
}

export interface InstitutionBrochurePreview {
  id: string;
  title: string;
  summary: string;
  publishedAt: string;
  link?: string;
}

export interface FollowedInstitution {
  id: string;
  name: string;
  shortName: string;
  location: string;
  tags: string[];
  officialWebsite: string;
  focus: string;
  followerCount: number;
  historicalData: InstitutionHistoryRecord[];
  latestBrochure: InstitutionBrochurePreview | null;
  brochures: InstitutionBrochurePreview[];
  lastUpdatedAt?: string | null;
}

export interface SubjectHighlight {
  combination: string;
  recommendedMajors: string[];
  suggestion: string;
}

export interface DashboardFallbackData {
  userName: string;
  stats: DashboardStat[];
  courses: CourseProgress[];
  practiceSets: PracticeSet[];
  schedule: ScheduleItem[];
  recommendation: string;
  pushMessages: DashboardPushMessage[];
  followedInstitutions: FollowedInstitution[];
  subjectHighlights: SubjectHighlight[];
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

export const schedule: ScheduleItem[] = [
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
  pushMessages: [
    {
      id: 'push-thu-brochure',
      title: '清华大学发布 2024 年招生简章',
      content: '新增“人工智能交叉培养计划”，复试强化科研项目展示，可提前预约线上宣讲。',
      createdAt: '2024-03-15T09:00:00.000Z',
      action: { label: '查看详情', url: 'https://yz.tsinghua.edu.cn/info/1179/1515.htm' },
    },
    {
      id: 'push-fdu-update',
      title: '复旦大学金融学复试要求更新',
      content: '新增英文案例问答环节，请准备 3 分钟英文陈述与量化实务案例。',
      createdAt: '2024-03-10T05:00:00.000Z',
    },
  ],
  followedInstitutions: [
    {
      id: 'thu-cs',
      name: '清华大学研究生院',
      shortName: '清华大学',
      location: '北京 · 海淀区',
      tags: ['985', '计算机', '科研导向'],
      officialWebsite: 'https://yz.tsinghua.edu.cn',
      focus: '计算机、自动化等理工类专业，强调科研与交叉学科背景。',
      followerCount: 1820,
      historicalData: [
        { year: 2023, enrollment: 128, scoreLine: 412, note: '复试注重科研潜力与英文能力。' },
        { year: 2022, enrollment: 120, scoreLine: 408, note: '408 专业课要求深入，复试实践题占比高。' },
      ],
      latestBrochure: {
        id: 'thu-2024',
        title: '2024 年硕士研究生招生简章',
        summary: '公布招生计划、复试政策与奖学金方案。',
        publishedAt: '2024-03-15T08:00:00.000Z',
        link: 'https://yz.tsinghua.edu.cn/info/1179/1515.htm',
      },
      brochures: [
        {
          id: 'thu-2024',
          title: '2024 年硕士研究生招生简章',
          summary: '公布招生计划、复试政策与奖学金方案。',
          publishedAt: '2024-03-15T08:00:00.000Z',
          link: 'https://yz.tsinghua.edu.cn/info/1179/1515.htm',
        },
        {
          id: 'thu-qa',
          title: '计算机系复试安排与常见问题',
          summary: '说明复试考核方式、机试安排与面试问题参考。',
          publishedAt: '2023-12-18T05:00:00.000Z',
          link: 'https://www.cs.tsinghua.edu.cn/info/1095/4925.htm',
        },
      ],
      lastUpdatedAt: '2024-03-15T08:00:00.000Z',
    },
    {
      id: 'fdu-fin',
      name: '复旦大学经济学院',
      shortName: '复旦大学',
      location: '上海 · 杨浦区',
      tags: ['985', '金融', '双语复试'],
      officialWebsite: 'https://www.econ.fudan.edu.cn',
      focus: '金融、应用经济类专业，强调数理基础与国际化能力。',
      followerCount: 1314,
      historicalData: [
        { year: 2023, enrollment: 150, scoreLine: 401, note: '新增金融科技方向，复试包含案例分析。' },
        { year: 2022, enrollment: 138, scoreLine: 398, note: '英文问答比例提升，关注实习经历。' },
      ],
      latestBrochure: {
        id: 'fdu-2024',
        title: '2024 年金融硕士招生指南',
        summary: '介绍招生规模、奖学金政策以及复试口语环节注意事项。',
        publishedAt: '2024-03-05T02:30:00.000Z',
        link: 'https://www.econ.fudan.edu.cn/18024/list.htm',
      },
      brochures: [
        {
          id: 'fdu-2024',
          title: '2024 年金融硕士招生指南',
          summary: '介绍招生规模、奖学金政策以及复试口语环节注意事项。',
          publishedAt: '2024-03-05T02:30:00.000Z',
          link: 'https://www.econ.fudan.edu.cn/18024/list.htm',
        },
        {
          id: 'fdu-data',
          title: '金融大数据方向导师团招新',
          summary: '披露导师研究方向与项目计划，欢迎具备数据分析背景的学生。',
          publishedAt: '2023-11-01T06:00:00.000Z',
          link: 'https://www.econ.fudan.edu.cn/17632/list.htm',
        },
      ],
      lastUpdatedAt: '2024-03-05T02:30:00.000Z',
    },
  ],
  subjectHighlights: [
    {
      combination: '数学一 + 英语一',
      recommendedMajors: ['计算机科学与技术', '人工智能', '电子信息工程'],
      suggestion: '适合冲刺数理与英语要求高的专业，建议准备算法项目与英文口语展示。',
    },
    {
      combination: '数学三 + 英语二',
      recommendedMajors: ['金融学', '应用统计', '会计硕士'],
      suggestion: '经管方向复试关注财经热点案例，可提前整理英文陈述稿。',
    },
  ],
};
