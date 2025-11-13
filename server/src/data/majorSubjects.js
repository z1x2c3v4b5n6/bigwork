const normalizeKey = (value) => {
  if (!value) {
    return '';
  }
  return String(value).trim().toLowerCase().replace(/[\s·\-_/]+/g, '');
};

const unique = (values = []) => {
  const set = new Set();
  values.forEach((value) => {
    if (!value) {
      return;
    }
    const trimmed = String(value).trim();
    if (trimmed) {
      set.add(trimmed);
    }
  });
  return Array.from(set);
};

const PRESET_MAJOR_SUBJECTS = [
  {
    id: 'major_cs',
    name: '计算机科学与技术',
    aliases: ['计算机', '计算机科学', '软件工程', '人工智能', '大数据技术'],
    tags: ['计算机', '408', '算法', '工程实践', '数学一'],
  },
  {
    id: 'major_math',
    name: '应用数学',
    aliases: ['数学', '数学与应用数学', '统计学'],
    tags: ['数学', '统计建模', '概率论', '数学三'],
  },
  {
    id: 'major_english',
    name: '英语语言文学',
    aliases: ['英语', '英语笔译', '英语口译'],
    tags: ['英语', '口语', '翻译', '写作'],
  },
  {
    id: 'major_management',
    name: '工商管理',
    aliases: ['管理类联考', 'MBA', 'MPA', '金融专硕'],
    tags: ['管理类联考', '金融', '案例分析', '英语二'],
  },
];

const idMap = new Map();
const nameMap = new Map();

PRESET_MAJOR_SUBJECTS.forEach((major) => {
  idMap.set(normalizeKey(major.id), major);
  const normalizedName = normalizeKey(major.name);
  if (normalizedName) {
    nameMap.set(normalizedName, major);
  }
  (major.aliases || []).forEach((alias) => {
    const normalizedAlias = normalizeKey(alias);
    if (normalizedAlias) {
      nameMap.set(normalizedAlias, major);
    }
  });
});

const resolveMajorSubjects = ({ majorId, majorName } = {}) => {
  const normalizedId = normalizeKey(majorId);
  const normalizedName = normalizeKey(majorName);

  let matched = null;

  if (normalizedId && idMap.has(normalizeKey(normalizedId))) {
    matched = idMap.get(normalizeKey(normalizedId));
  }

  if (!matched && normalizedName) {
    matched = nameMap.get(normalizedName) || null;
  }

  if (!matched && normalizedName) {
    // 允许前缀或包含关系匹配
    for (const [key, value] of nameMap.entries()) {
      if (key.includes(normalizedName) || normalizedName.includes(key)) {
        matched = value;
        break;
      }
    }
  }

  if (!matched) {
    return { id: normalizedId || null, name: majorName || null, tags: [] };
  }

  return {
    id: matched.id,
    name: matched.name,
    tags: unique(matched.tags),
  };
};

module.exports = {
  resolveMajorSubjects,
  PRESET_MAJOR_SUBJECTS,
};

