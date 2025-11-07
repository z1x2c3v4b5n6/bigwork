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
