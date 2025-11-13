const normalizeKey = (value?: string | null): string => {
  if (!value) {
    return '';
  }
  return value.trim().toLowerCase().replace(/[\s·\-_/]+/g, '');
};

export interface MajorTagPreset {
  id: string;
  name: string;
  aliases: string[];
  tags: string[];
}

export const majorTagPresets: MajorTagPreset[] = [
  {
    id: 'major_cs',
    name: '计算机科学与技术',
    aliases: ['计算机', '软件工程', '人工智能', '大数据技术'],
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

const idMap = new Map<string, MajorTagPreset>();
const nameMap = new Map<string, MajorTagPreset>();

majorTagPresets.forEach((preset) => {
  idMap.set(normalizeKey(preset.id), preset);
  nameMap.set(normalizeKey(preset.name), preset);
  preset.aliases.forEach((alias) => {
    nameMap.set(normalizeKey(alias), preset);
  });
});

export const resolveMajorTags = (
  majorId?: string | null,
  majorName?: string | null,
  fallbackTags: string[] = [],
): string[] => {
  const normalizedId = normalizeKey(majorId ?? '');
  if (normalizedId && idMap.has(normalizedId)) {
    return idMap.get(normalizedId)!.tags;
  }

  const normalizedName = normalizeKey(majorName ?? '');
  if (normalizedName && nameMap.has(normalizedName)) {
    return nameMap.get(normalizedName)!.tags;
  }

  if (normalizedName) {
    for (const [key, preset] of nameMap.entries()) {
      if (key.includes(normalizedName) || normalizedName.includes(key)) {
        return preset.tags;
      }
    }
  }

  return fallbackTags;
};

