export interface SubjectMastery {
  name: string;
  mastery: number;
  trend: string;
  focus: string;
}

export const subjectMasterySeed: SubjectMastery[] = [
  { name: '数学一', mastery: 0.72, trend: '+6.4%', focus: '线性代数、概率统计' },
  { name: '政治', mastery: 0.58, trend: '+3.1%', focus: '毛中特第二章、时政题' },
  { name: '英语一', mastery: 0.81, trend: '+4.8%', focus: '阅读理解、写作素材积累' },
  { name: '计算机 408', mastery: 0.66, trend: '+5.5%', focus: '数据结构-图、操作系统-进程管理' },
];

export const analyticsHighlights = [
  {
    id: 'mockTrend',
    title: '模考趋势',
    description: '最近 3 次模考成绩：358 → 368 → 379，已连续两周保持上升趋势。',
  },
  {
    id: 'timeDistribution',
    title: '时间分配',
    description: '工作日平均每日学习 4.5 小时，周末 7 小时。建议将政治复习时间提升 30%。',
  },
  {
    id: 'studyBehavior',
    title: '学习行为',
    description: '上周平均专注时长 42min/番茄钟，错题回顾完成率 86%，夜间复盘坚持 5/7 天。',
  },
];

export const knowledgeGraphSeed = [
  {
    id: 'linear-algebra',
    topic: '线性代数 · 特征值与特征向量',
    errorRate: '32%',
    action: '回看第 5-6 讲并完成配套训练营',
  },
  {
    id: 'politics-philosophy',
    topic: '政治 · 马原哲学部分',
    errorRate: '28%',
    action: '整理错题思维导图，参加周五直播答疑',
  },
  {
    id: 'english-sentence',
    topic: '英语 · 长难句理解',
    errorRate: '25%',
    action: '每日精读一篇外刊，积累结构',
  },
  {
    id: 'os-cache',
    topic: '计组 · Cache 一致性协议',
    errorRate: '24%',
    action: '完成专项题单并观看讲解视频',
  },
  {
    id: 'graph-traversal',
    topic: '数据结构 · 图的遍历',
    errorRate: '21%',
    action: '整理 DFS/BFS 思维流程图，强化练习',
  },
];
