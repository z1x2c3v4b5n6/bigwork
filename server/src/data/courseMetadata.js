const { getCourseSubjectMeta } = require('./courseSubjects');

const normalizeCourseId = (value) => {
  if (!value) {
    return '';
  }
  return String(value).trim().toLowerCase();
};

const uniqueList = (values = []) => {
  const result = [];
  const seen = new Set();
  values.forEach((value) => {
    if (value == null) {
      return;
    }
    const text = String(value).trim();
    if (!text) {
      return;
    }
    const key = text.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(text);
    }
  });
  return result;
};

const normalizeScore = (value) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
};

const normalizeSuitability = (suitability = {}) => {
  const mathSubjects = uniqueList(suitability.mathSubjects);
  const englishSubjects = uniqueList(suitability.englishSubjects);
  const majorIds = uniqueList(suitability.majorIds);
  const majors = uniqueList(suitability.majors);
  const scoreMin = normalizeScore(suitability.scoreMin);
  const scoreMax = normalizeScore(suitability.scoreMax);

  const payload = {};
  if (mathSubjects.length > 0) {
    payload.mathSubjects = mathSubjects;
  }
  if (englishSubjects.length > 0) {
    payload.englishSubjects = englishSubjects;
  }
  if (majorIds.length > 0) {
    payload.majorIds = majorIds;
  }
  if (majors.length > 0) {
    payload.majors = majors;
  }
  if (scoreMin !== undefined) {
    payload.scoreMin = scoreMin;
  }
  if (scoreMax !== undefined) {
    payload.scoreMax = scoreMax;
  }
  return Object.keys(payload).length > 0 ? payload : undefined;
};

const courseMetadataStore = new Map();

const setCourseMetadata = (courseId, metadata = {}) => {
  const normalizedId = normalizeCourseId(courseId);
  if (!normalizedId) {
    return null;
  }

  const existing = courseMetadataStore.get(normalizedId) || {};

  const next = { ...existing };

  if (metadata.intensity !== undefined) {
    next.intensity = metadata.intensity || undefined;
  }
  if (metadata.highlight !== undefined) {
    next.highlight = metadata.highlight || undefined;
  }
  if (metadata.nextTask !== undefined) {
    next.nextTask = metadata.nextTask || undefined;
  }
  if (metadata.tags !== undefined) {
    next.tags = uniqueList(metadata.tags);
  }
  if (metadata.suitability !== undefined) {
    next.suitability = normalizeSuitability(metadata.suitability);
  }

  courseMetadataStore.set(normalizedId, next);
  return next;
};

const getCourseMetadata = (courseId) => {
  const normalizedId = normalizeCourseId(courseId);
  if (!normalizedId) {
    return null;
  }
  return courseMetadataStore.get(normalizedId) || null;
};

const applyCourseMetadata = (course) => {
  if (!course || course.id == null) {
    return course;
  }

  const normalizedId = normalizeCourseId(course.id);
  const metadata = getCourseMetadata(normalizedId);
  const subjectMeta = getCourseSubjectMeta(normalizedId);

  const tags = new Set();
  [course.tags, metadata?.tags, subjectMeta?.tags].forEach((list) => {
    if (!Array.isArray(list)) {
      return;
    }
    list.forEach((tag) => {
      if (tag == null) {
        return;
      }
      const text = String(tag).trim();
      if (text) {
        tags.add(text);
      }
    });
  });

  const enriched = { ...course };

  if (metadata?.intensity) {
    enriched.intensity = metadata.intensity;
  }
  if (metadata?.highlight) {
    enriched.highlight = metadata.highlight;
  }
  if (!enriched.nextTask && metadata?.nextTask) {
    enriched.nextTask = metadata.nextTask;
  }
  if (tags.size > 0) {
    enriched.tags = Array.from(tags.values());
  }
  if (subjectMeta?.tags && subjectMeta.tags.length > 0) {
    enriched.subjectTags = uniqueList(subjectMeta.tags);
  }

  const suitability = metadata?.suitability;
  if (suitability) {
    enriched.suitability = suitability;
  }

  return enriched;
};

const enrichCourseWithMetadata = (course) => {
  const enriched = applyCourseMetadata(course);
  const subjectMeta = getCourseSubjectMeta(course?.id);
  return { course: enriched, subjectMeta };
};

const DEFAULT_METADATA = {
  english: {
    intensity: '强化',
    tags: ['英语一', '真题精讲', '写作'],
    suitability: { englishSubjects: ['英语一'], scoreMin: 360 },
  },
  course_english: {
    intensity: '强化',
    tags: ['英语一', '写作', '真题'],
    suitability: { englishSubjects: ['英语一'], scoreMin: 360 },
  },
  politics: {
    intensity: '基础',
    tags: ['政治', '时政热点'],
    suitability: { scoreMin: 340 },
  },
  course_politics: {
    intensity: '基础',
    tags: ['政治', '热点'],
    suitability: { scoreMin: 340 },
  },
  major: {
    intensity: '强化',
    tags: ['408', '数据结构', '算法'],
    suitability: {
      mathSubjects: ['数学一'],
      majorIds: ['major_cs'],
      majors: ['计算机科学与技术', '人工智能', '软件工程'],
      scoreMin: 360,
    },
    highlight: '图论、动态规划专项强化，配套机试演练。',
  },
  course_algo: {
    intensity: '强化',
    tags: ['408', '数据结构', '算法'],
    suitability: {
      mathSubjects: ['数学一'],
      majorIds: ['major_cs'],
      majors: ['计算机科学与技术', '人工智能', '软件工程'],
      scoreMin: 360,
    },
    highlight: '配套图论、动态规划专项训练，含机试点评。',
  },
  'math-advanced': {
    intensity: '强化',
    tags: ['数学一', '高等数学', '线代'],
    suitability: {
      mathSubjects: ['数学一', '数学二'],
      scoreMin: 350,
    },
    nextTask: '推导线性代数特征值题型通法',
  },
  course_math: {
    intensity: '强化',
    tags: ['数学一', '冲刺'],
    suitability: {
      mathSubjects: ['数学一', '数学二'],
      scoreMin: 350,
    },
  },
  'ai-lab': {
    intensity: '冲刺',
    tags: ['计算机', '项目实战', '科研'],
    suitability: {
      mathSubjects: ['数学一'],
      majorIds: ['major_cs'],
      majors: ['计算机科学与技术', '人工智能'],
      scoreMin: 380,
    },
    nextTask: '完善 CNN 图像分类实验记录并提交代码审阅',
    highlight: '人工智能工程项目制学习，含代码审阅与部署。',
  },
  course_ai: {
    intensity: '冲刺',
    tags: ['AI', '算法', '项目'],
    suitability: {
      mathSubjects: ['数学一'],
      majorIds: ['major_cs'],
      majors: ['计算机科学与技术', '人工智能'],
      scoreMin: 380,
    },
  },
  'mba-case': {
    intensity: '冲刺',
    tags: ['管理类联考', '面试', '口语'],
    suitability: {
      mathSubjects: ['不考数学'],
      englishSubjects: ['英语二'],
      majorIds: ['major_management'],
      majors: ['工商管理', '会计硕士', '金融'],
      scoreMin: 360,
    },
    nextTask: '准备 2 个管理案例 STAR 答题稿',
  },
  course_mba_case: {
    intensity: '冲刺',
    tags: ['管理类联考', '面试'],
    suitability: {
      mathSubjects: ['不考数学'],
      englishSubjects: ['英语二'],
      majorIds: ['major_management'],
      majors: ['工商管理', '会计硕士', '金融'],
      scoreMin: 360,
    },
  },
  'english-speaking': {
    intensity: '基础',
    tags: ['英语口语', '听力', '表达'],
    suitability: {
      englishSubjects: ['英语一', '英语二'],
    },
    nextTask: '完成 15 分钟口语跟读与录音打卡',
  },
  course_english_speaking: {
    intensity: '基础',
    tags: ['英语口语', '听力'],
    suitability: {
      englishSubjects: ['英语一', '英语二'],
    },
  },
  course_stat_modeling: {
    intensity: '强化',
    tags: ['统计建模', 'Python', '实战'],
    suitability: {
      mathSubjects: ['数学一', '数学三'],
      majorIds: ['major_math'],
      majors: ['应用数学', '金融'],
      scoreMin: 350,
    },
    highlight: '配套真实数据集建模案例与代码讲解。',
  },
  course_english_listening: {
    intensity: '基础',
    tags: ['英语二', '听力', '口语'],
    suitability: {
      englishSubjects: ['英语二', '英语一'],
    },
    highlight: '每周提供逐句纠错与口语点评音频。',
  },
  course_finance_case: {
    intensity: '强化',
    tags: ['金融', '案例分析', '量化'],
    suitability: {
      mathSubjects: ['数学三', '不考数学'],
      englishSubjects: ['英语二'],
      majorIds: ['major_management', 'major_math'],
      majors: ['金融', '工商管理'],
      scoreMin: 355,
    },
    highlight: '结合财经热点进行量化推演与面试演练。',
  },
};

Object.entries(DEFAULT_METADATA).forEach(([courseId, metadata]) => {
  setCourseMetadata(courseId, metadata);
});

module.exports = {
  setCourseMetadata,
  getCourseMetadata,
  applyCourseMetadata,
  enrichCourseWithMetadata,
};
