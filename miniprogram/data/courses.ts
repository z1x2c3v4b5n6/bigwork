import type { CourseProgress, CourseSuitability } from './dashboard';

export interface MajorOption {
  id: string;
  name: string;
}

export interface CourseTemplate {
  id: string;
  title: string;
  teacher: string;
  category: string;
  progress: number;
  nextTask: string;
  description?: string;
  intensity?: '基础' | '强化' | '冲刺' | string;
  tags?: string[];
  highlight?: string;
  suitability?: CourseSuitability;
}

export const defaultMajors: MajorOption[] = [
  { id: 'cs408', name: '计算机科学与技术（408）' },
  { id: 'finance', name: '金融专硕' },
  { id: 'education', name: '教育学' },
  { id: 'mechanical', name: '机械工程' },
  { id: 'law', name: '法律（非法学）' },
];

export const boutiqueWorkshops = [
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

export const seedCourseTemplates: CourseTemplate[] = [
  {
    id: 'english',
    title: '英语一真题精讲营',
    teacher: '王老师',
    category: '公共课',
    progress: 68,
    nextTask: '完成 2018 年阅读理解 B 讲义',
    description: '拆解 2010-2023 真题写作与阅读理解，梳理高频词汇。',
    intensity: '强化',
    tags: ['英语一', '真题精讲', '写作'],
    highlight: '真题逐句精讲，附高分范文批注。',
    suitability: { englishSubjects: ['英语一'], scoreMin: 360 },
  },
  {
    id: 'course_english_speaking',
    title: '英语口语听力提升营',
    teacher: 'Grace',
    category: '公共课',
    progress: 58,
    nextTask: '完成第 5 讲听力跟读作业',
    description: '直播精讲 + 口语纠错，覆盖复试高频场景。',
    intensity: '基础',
    tags: ['英语二', '听力', '口语'],
    highlight: '每周双语跟读与口语批改。',
    suitability: { englishSubjects: ['英语二', '英语一'] },
  },
  {
    id: 'major',
    title: '计算机 408 高频考点训练营',
    teacher: '张老师',
    category: '专业课',
    progress: 55,
    nextTask: '完成 栈与队列 章节刷题',
    description: '覆盖数据结构、操作系统、计组与网络四大模块。',
    intensity: '强化',
    tags: ['408', '数据结构', '算法'],
    highlight: '配套机试训练与专题答疑。',
    suitability: {
      mathSubjects: ['数学一'],
      majorIds: ['major_cs'],
      majors: ['计算机科学与技术', '软件工程'],
    },
  },
  {
    id: 'course_math',
    title: '数学一冲刺串讲营',
    teacher: '周老师',
    category: '公共课',
    progress: 47,
    nextTask: '推导线性代数特征值题型通法',
    description: '拆解高频真题与压轴题型，巩固计算。',
    intensity: '冲刺',
    tags: ['数学一', '冲刺'],
    highlight: '按模块串讲，强化难点突破。',
    suitability: { mathSubjects: ['数学一', '数学二'] },
  },
];

export const toCourseProgress = (templates: CourseTemplate[]): CourseProgress[] =>
  templates.map((template) => ({
    id: template.id,
    title: template.title,
    category: template.category,
    teacher: template.teacher,
    progress: template.progress,
    nextTask: template.nextTask,
    intensity: template.intensity,
    tags: template.tags,
    highlight: template.highlight,
    suitability: template.suitability,
  }));
