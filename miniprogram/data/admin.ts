export interface AdminReferenceSite {
  name: string;
  url: string;
  description: string;
}

export interface AdminMetricCard {
  id: string;
  label: string;
  value: number;
}

export interface AdminTaskItem {
  id: string;
  title: string;
  assignee: string;
  status: '待处理' | '进行中' | '已完成';
  updatedAt: string;
}

export interface AdminStudentProgressSeed {
  id: number;
  name: string;
  university: string;
  studyHours: number;
  completion: number;
}

export interface AdminAuditLogSeed {
  id: number;
  title: string;
  description: string;
  actor: string;
  createdAt: string;
}

export interface AdminSettingsSeed {
  platform_name: string;
  support_email: string;
  security_note: string;
}

export interface AdminUserSeed {
  id: number;
  username: string;
  displayName: string;
  email: string;
  role: 'admin' | 'student';
  createdAt: string;
}

export interface AdminMajorSeed {
  id: number;
  name: string;
  description: string;
}

export interface AdminCourseSeed {
  id: number;
  title: string;
  description: string;
  teacher: string;
  credit: number;
  majorId: number;
  majorName: string;
}

export interface AdminMaterialSeed {
  id: number;
  title: string;
  description: string;
  fileUrl: string;
  courseId: number;
  courseTitle: string;
}

export interface AdminForumTopicSeed {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminForumPostSeed {
  id: number;
  content: string;
  author: string;
  createdAt: string;
}

export interface AdminStatisticsSeed {
  totalUsers: number;
  totalMajors: number;
  totalCourses: number;
  totalMaterials: number;
  totalPracticeSets: number;
  totalForumPosts: number;
  lastUpdatedAt: string;
}

export const adminReferenceSites: AdminReferenceSite[] = [
  {
    name: '研招网复试与调剂公告',
    url: 'https://yz.chsi.com.cn/kyzx/zt/kyzt2024fs/',
    description: '官方发布复试安排、调剂系统开放时间等权威通知。',
  },
  {
    name: '研招网调剂服务系统',
    url: 'https://yz.chsi.com.cn/yztj/',
    description: '国家线发布后填写调剂志愿的唯一官方入口。',
  },
  {
    name: '中国教育在线考研频道',
    url: 'https://kaoyan.eol.cn/',
    description: '汇总政策解析、院校访谈与复试经验，便于及时转发给学员。',
  },
  {
    name: '中公考研院校库',
    url: 'https://souky.eoffcn.com/',
    description: '按地区/专业快速检索院校信息与历年分数线数据。',
  },
];

export const adminMetricsSeed: AdminMetricCard[] = [
  { id: 'activeStudents', label: '活跃学员', value: 128 },
  { id: 'tasksCompletedToday', label: '今日完成任务', value: 42 },
  { id: 'followUpsPending', label: '跟进提醒', value: 7 },
  { id: 'systemAlerts', label: '系统告警', value: 0 },
];

export const adminTasksSeed: AdminTaskItem[] = [
  {
    id: 'task_001',
    title: '审核《计算机网络冲刺班》课程大纲',
    assignee: '张老师',
    status: '待处理',
    updatedAt: '2024-04-10T10:00:00.000Z',
  },
  {
    id: 'task_002',
    title: '整理 2024 调剂意向问卷反馈',
    assignee: '运营组',
    status: '进行中',
    updatedAt: '2024-04-09T17:30:00.000Z',
  },
  {
    id: 'task_003',
    title: '更新复试资料库下载链接',
    assignee: '资料管理员',
    status: '已完成',
    updatedAt: '2024-04-08T09:20:00.000Z',
  },
];

export const adminStudentProgressSeed: AdminStudentProgressSeed[] = [
  {
    id: 1001,
    name: '李晨',
    university: '北京大学软件工程',
    studyHours: 18,
    completion: 82,
  },
  {
    id: 1002,
    name: '王晓',
    university: '复旦大学金融专硕',
    studyHours: 15,
    completion: 76,
  },
  {
    id: 1003,
    name: '周敏',
    university: '中国人民大学新闻传播',
    studyHours: 12,
    completion: 68,
  },
];

export const adminAuditLogSeed: AdminAuditLogSeed[] = [
  {
    id: 2001,
    title: '示例 · 批量导入学员',
    description: '成功导入 38 名调剂学员，并同步到进度追踪表。',
    actor: '示例管理员',
    createdAt: '2024-03-12 09:30',
  },
  {
    id: 2002,
    title: '示例 · 更新资料库',
    description: '上传《408 重点真题精讲》并推送至目标课程。',
    actor: '示例管理员',
    createdAt: '2024-03-11 19:20',
  },
];

export const adminAdministratorsSeed = ['示例管理员（文案组）', '示例管理员（教研组）'];

export const adminDashboardNote =
  '当前展示为示例数据，待接入真实数据库后即可查看实时后台指标。';

export const adminSettingsSeed: AdminSettingsSeed = {
  platform_name: '研途备考管理后台（示例）',
  support_email: 'support@example.com',
  security_note: '示例提示：请在正式环境中配置双因素认证与访问控制策略。',
};

export const adminUsersSeed: AdminUserSeed[] = [
  {
    id: 3001,
    username: 'demo_admin',
    displayName: '示例管理员',
    email: 'admin@example.com',
    role: 'admin',
    createdAt: '2024-03-10 08:00',
  },
  {
    id: 3002,
    username: 'demo_student',
    displayName: '示例学员',
    email: 'student@example.com',
    role: 'student',
    createdAt: '2024-03-09 10:15',
  },
];

export const adminMajorsSeed: AdminMajorSeed[] = [
  {
    id: 4001,
    name: '计算机科学与技术（示例）',
    description: '覆盖数据结构、408 真题整理、复试项目指导等内容。',
  },
  {
    id: 4002,
    name: '新闻与传播（示例）',
    description: '包含新闻写作、面试热点梳理与院校案例拆解。',
  },
];

export const adminCoursesSeed: AdminCourseSeed[] = [
  {
    id: 5001,
    title: '示例 · 408 高频考点串讲',
    description: '围绕数据结构、操作系统、计算机组成原理展开的 8 次直播课。',
    teacher: '陈老师',
    credit: 2,
    majorId: 4001,
    majorName: '计算机科学与技术（示例）',
  },
  {
    id: 5002,
    title: '示例 · 复试面试真题工作坊',
    description: '针对新闻传播院校复试面试的即兴评述与热点分析。',
    teacher: '赵老师',
    credit: 1,
    majorId: 4002,
    majorName: '新闻与传播（示例）',
  },
];

export const adminMaterialsSeed: AdminMaterialSeed[] = [
  {
    id: 6001,
    title: '示例 · 计组易错题精编',
    description: '覆盖缓存一致性、流水线与性能优化等高频错题。',
    fileUrl: 'https://example.com/materials/cpu.pdf',
    courseId: 5001,
    courseTitle: '示例 · 408 高频考点串讲',
  },
  {
    id: 6002,
    title: '示例 · 新闻热点速览',
    description: '按照时事模块整理的试热点解读与口述模板。',
    fileUrl: 'https://example.com/materials/news.pdf',
    courseId: 5002,
    courseTitle: '示例 · 复试面试真题工作坊',
  },
];

export const adminForumTopicsSeed: AdminForumTopicSeed[] = [
  {
    id: 7001,
    title: '示例 · 调剂经验互助',
    description: '分享调剂系统开放后的时间安排与材料准备注意事项。',
    createdAt: '2024-03-08 14:00',
    updatedAt: '2024-03-08 16:45',
  },
  {
    id: 7002,
    title: '示例 · 复试面试打卡',
    description: '每日更新面试自我介绍练习与老师反馈要点。',
    createdAt: '2024-03-07 09:20',
    updatedAt: '2024-03-09 12:10',
  },
];

export const adminForumPostsSeed: Record<number, AdminForumPostSeed[]> = {
  7001: [
    {
      id: 7101,
      content: '【示例】提交调剂志愿前记得确认联系电话畅通，方便院校回访。',
      author: '示例管理员',
      createdAt: '2024-03-08 14:30',
    },
    {
      id: 7102,
      content: '【示例】附上材料清单模板，建议调剂生提前备齐纸质版本。',
      author: '示例管理员',
      createdAt: '2024-03-08 16:10',
    },
  ],
  7002: [
    {
      id: 7201,
      content: '【示例】今天练习的面试题：请结合新闻热点谈谈人工智能监管。',
      author: '示例管理员',
      createdAt: '2024-03-07 09:40',
    },
  ],
};

export const adminStatisticsSeed: AdminStatisticsSeed = {
  totalUsers: 256,
  totalMajors: 12,
  totalCourses: 48,
  totalMaterials: 136,
  totalPracticeSets: 64,
  totalForumPosts: 320,
  lastUpdatedAt: '2024-03-12 09:30',
};
