const defaultMajors = [
  { id: 'cs408', name: '计算机科学与技术（408）' },
  { id: 'finance', name: '金融专硕' },
  { id: 'education', name: '教育学' },
  { id: 'mechanical', name: '机械工程' },
  { id: 'law', name: '法律（非法学）' },
];

const boutiqueWorkshops = [
  {
    id: 'math_sprint',
    title: '数学一-真题串讲营',
    description: '12 次直播串讲 + 高频题型训练，附带讲义与总结笔记',
    highlight: '限额 60 人',
  },
  {
    id: 'politics_focus',
    title: '政治-冲刺押题班',
    description: '核心考点提炼 + 模拟卷讲解 + 高频题背诵清单',
    highlight: '赠预测资料包',
  },
  {
    id: 'english_writing',
    title: '英语一-写作突破课',
    description: '模板搭建 + 高频话题素材库 + 批改反馈',
    highlight: '含作文批改',
  },
];

const seedCourseTemplates = [
  {
    id: 'english',
    title: '英语一真题精讲营',
    teacher: '王老师',
    category: '公共课',
    progress: 68,
    nextTask: '完成 2018 年阅读理解 B 讲义',
    description: '拆解 2010-2023 真题写作与阅读理解，梳理高频词汇。',
  },
  {
    id: 'politics',
    title: '肖秀荣政治冲刺课',
    teacher: '肖老师',
    category: '公共课',
    progress: 42,
    nextTask: '背诵时政 50 题（第三章）',
    description: '梳理核心考点与思维导图，附送时政速记手册。',
  },
  {
    id: 'major',
    title: '计算机 408 高频考点训练营',
    teacher: '张老师',
    category: '专业课',
    progress: 55,
    nextTask: '完成 栈与队列 章节刷题',
    description: '覆盖数据结构、操作系统、计组与网络四大模块。',
  },
];

const toCourseProgress = (templates) =>
  templates.map((template) => ({
    id: template.id,
    title: template.title,
    category: template.category,
    teacher: template.teacher,
    progress: template.progress,
    nextTask: template.nextTask,
  }));

module.exports = {
  defaultMajors,
  boutiqueWorkshops,
  seedCourseTemplates,
  toCourseProgress,
};
