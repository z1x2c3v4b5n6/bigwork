const normalizeCourseId = (value) => {
  if (!value) {
    return '';
  }
  return String(value).trim().toLowerCase();
};

const COURSE_SUBJECTS = {
  english: { general: true, tags: ['英语', '公共课'] },
  course_english: { general: true, tags: ['英语', '写作'] },
  politics: { general: true, tags: ['政治', '公共课'] },
  course_politics: { general: true, tags: ['政治', '时政'] },
  major: { majorIds: ['major_cs'], tags: ['计算机', '408', '算法'] },
  course_algo: { majorIds: ['major_cs'], tags: ['计算机', '408', '算法'] },
  'math-advanced': { general: true, tags: ['数学', '高等数学'] },
  course_math: { general: true, tags: ['数学', '冲刺'] },
  'ai-lab': { majorIds: ['major_cs'], tags: ['AI', '计算机', '项目实战'] },
  course_ai: { majorIds: ['major_cs'], tags: ['AI', '算法', '工程实践'] },
  'mba-case': { majorIds: ['major_management'], tags: ['管理类联考', '案例分析'] },
  course_mba_case: { majorIds: ['major_management'], tags: ['管理类联考', '案例分析'] },
  'english-speaking': { general: true, tags: ['英语', '口语'] },
  course_english_speaking: { general: true, tags: ['英语', '口语'] },
  course_stat_modeling: { majorIds: ['major_math'], tags: ['统计', '数学', '建模'] },
  course_english_listening: { general: true, tags: ['英语', '听力'] },
  course_finance_case: { majorIds: ['major_management', 'major_math'], tags: ['金融', '管理'] },
};

const getCourseSubjectMeta = (courseId) => {
  const normalized = normalizeCourseId(courseId);
  return COURSE_SUBJECTS[normalized] || null;
};

module.exports = {
  getCourseSubjectMeta,
  normalizeCourseId,
};

