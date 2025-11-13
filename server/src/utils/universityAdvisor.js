const universities = require('../../data/universityProfiles');

const matchLevelOrder = {
  稳妥: 0,
  冲刺: 1,
  保底: 2,
  高风险: 3,
};

const normalizeMajor = (major) => {
  if (!major) {
    return '';
  }
  return String(major).trim().toLowerCase();
};

const normalizeMathSubject = (value) => {
  if (!value) {
    return '';
  }
  const normalized = String(value).replace(/\s+/g, '').toLowerCase();
  if (/(数学|数)[一1]/.test(normalized)) {
    return 'math1';
  }
  if (/(数学|数)[二2]/.test(normalized)) {
    return 'math2';
  }
  if (/(数学|数)[三3]/.test(normalized)) {
    return 'math3';
  }
  if (/不考|无数学|免数学/.test(normalized)) {
    return 'mathNone';
  }
  return normalized;
};

const normalizeEnglishSubject = (value) => {
  if (!value) {
    return '';
  }
  const normalized = String(value).replace(/\s+/g, '').toLowerCase();
  if (/(英语|英)[一1]/.test(normalized)) {
    return 'eng1';
  }
  if (/(英语|英)[二2]/.test(normalized)) {
    return 'eng2';
  }
  return normalized;
};

const formatExamSubjects = (subjects = {}) => {
  const items = [];
  if (subjects.math) {
    items.push(`数学：${subjects.math}`);
  }
  if (subjects.english) {
    items.push(`英语：${subjects.english}`);
  }
  if (subjects.professional) {
    items.push(`专业课：${subjects.professional}`);
  }
  if (subjects.politics) {
    items.push(`政治：${subjects.politics}`);
  }
  return items.join(' · ');
};

const buildSubjectAdvice = (subjects, preferences = {}, matches) => {
  const preferenceValues = [];
  if (preferences.math) {
    preferenceValues.push(preferences.math);
  }
  if (preferences.english) {
    preferenceValues.push(preferences.english);
  }
  const preferenceText = preferenceValues.length > 0 ? preferenceValues.join(' / ') : '';
  const baseRequirement = formatExamSubjects(subjects);

  if (!preferenceText) {
    return baseRequirement ? `初试科目要求：${baseRequirement}。` : '初试科目以院校最新简章为准。';
  }

  const requirementText = baseRequirement ? `初试科目要求：${baseRequirement}。` : '';

  if (matches.math && matches.english) {
    return `${requirementText}与你选择的科目（${preferenceText}）完全匹配，可直接参考该院校的备考规划。`.trim();
  }

  const mismatchReasons = [];
  if (!matches.math && preferences.math) {
    mismatchReasons.push(`数学科目要求为 ${subjects.math || '院校自定'}`);
  }
  if (!matches.english && preferences.english) {
    mismatchReasons.push(`英语科目要求为 ${subjects.english || '院校自定'}`);
  }

  const mismatchText = mismatchReasons.join('，');
  const message = `${requirementText}与你选择的科目（${preferenceText}）存在差异，${mismatchText}，请评估是否补充备考或调整志愿。`;
  return message.trim();
};

const getScoreBand = (score) => {
  if (score >= 420) {
    return '420+ 卓越冲刺档：具备冲击顶尖院校的硬实力';
  }
  if (score >= 400) {
    return '400-419 稳固优势档：大部分985/热门专业具备竞争力';
  }
  if (score >= 380) {
    return '380-399 综合提升档：兼顾冲刺与稳妥院校的黄金分段';
  }
  if (score >= 360) {
    return '360-379 重点强化档：重点院校需突出亮点，建议搭配保底';
  }
  return '360 以下夯实基础档：建议选择稳妥与保底院校组合，同时提升复试竞争力';
};

const buildMatchReason = (score, university) => {
  const diff = score - university.score.recommended;
  const diffAbs = Math.abs(diff);

  const base = `近年拟录取线约 ${university.score.recommended} 分`;

  if (diff >= 15) {
    return `${base}，你的分数高出 ${diff} 分，复试发挥正常即可稳妥录取。`;
  }

  if (diff >= 5) {
    return `${base}，你的分数领先 ${diff} 分，保持复试稳定输出即可。`;
  }

  if (diff >= -10) {
    return `${base}，你的分数只低于 ${diffAbs} 分，复试突出优势有望逆袭。`;
  }

  return `${base}，当前分差 ${diffAbs} 分，建议突出科研/实践亮点或准备调剂方案。`;
};

const evaluateMatchLevel = (score, university) => {
  const diff = score - university.score.recommended;
  if (diff >= 15) {
    return '保底';
  }
  if (diff >= 5) {
    return '稳妥';
  }
  if (diff >= -10) {
    return '冲刺';
  }
  return '高风险';
};

const buildRecommendations = (totalScore, major, examPreferences = {}) => {
  const normalizedMajor = normalizeMajor(major);
  const normalizedPreferences = {
    math: normalizeMathSubject(examPreferences.math),
    english: normalizeEnglishSubject(examPreferences.english),
  };
  const results = universities
    .map((university) => {
      const matchLevel = evaluateMatchLevel(totalScore, university);
      const diff = totalScore - university.score.recommended;
      const majorMatched = normalizedMajor
        ? university.majors?.some((item) => normalizeMajor(item).includes(normalizedMajor))
        : true;

      const majorBoost = majorMatched ? 8 : 0;
      const diffScore = diff >= 0 ? diff : diff * 0.6;
      const levelScore = (3 - matchLevelOrder[matchLevel]) * 12;
      const examSubjects = university.examSubjects || {};
      const mathRequirement = normalizeMathSubject(examSubjects.math);
      const englishRequirement = normalizeEnglishSubject(examSubjects.english);
      const mathMatches = !normalizedPreferences.math || !mathRequirement
        ? true
        : normalizedPreferences.math === mathRequirement;
      const englishMatches = !normalizedPreferences.english || !englishRequirement
        ? true
        : normalizedPreferences.english === englishRequirement;

      const subjectScore =
        (normalizedPreferences.math ? (mathMatches ? 8 : -12) : 0) +
        (normalizedPreferences.english ? (englishMatches ? 6 : -10) : 0);

      const compositeScore = levelScore * 2 + diffScore + majorBoost + subjectScore;

      return {
        id: university.id,
        name: university.name,
        province: university.province,
        level: university.level,
        category: university.category,
        tags: university.tags,
        scoreWindow: `国家线/校线 ${university.score.floor} - ${university.score.recommended} 分`,
        highlights: university.strengths,
        matchLevel,
        matchReason: buildMatchReason(totalScore, university),
        interviewFocus: university.interviewFocus,
        examSubjects,
        subjectMatch: mathMatches && englishMatches,
        subjectAdvice: buildSubjectAdvice(
          examSubjects,
          examPreferences,
          { math: mathMatches, english: englishMatches },
        ),
        scoreDelta: diff,
        compositeScore,
        majorMatched,
      };
    })
    .filter((item) => item.scoreDelta >= -25 || item.matchLevel !== '高风险')
    .sort((a, b) => {
      const levelDiff = matchLevelOrder[a.matchLevel] - matchLevelOrder[b.matchLevel];
      if (levelDiff !== 0) {
        return levelDiff;
      }
      if (b.compositeScore !== a.compositeScore) {
        return b.compositeScore - a.compositeScore;
      }
      return b.scoreDelta - a.scoreDelta;
    });

  const recommendedUniversities = results.slice(0, 6);

  const focusTopics = Array.from(
    new Set(
      recommendedUniversities
        .flatMap((item) => item.interviewFocus || [])
        .filter(Boolean),
    ),
  ).slice(0, 8);

  return {
    recommendedUniversities,
    focusTopics,
  };
};

const subjectRecommendationMatrix = {
  'math1|eng1': {
    combination: '数学一 + 英语一',
    majors: ['计算机科学与技术', '软件工程', '电子信息工程'],
    suggestion: '适合冲刺计算机、电子信息等对数理和英语要求均高的专业，复试常见算法或项目深挖。',
  },
  'math1|eng2': {
    combination: '数学一 + 英语二',
    majors: ['自动化', '通信工程', '数据科学与大数据技术'],
    suggestion: '偏理工交叉方向，可结合项目经历强调工程实现能力。',
  },
  'math2|eng1': {
    combination: '数学二 + 英语一',
    majors: ['机械工程', '控制工程', '仪器工程'],
    suggestion: '建议突出力学与控制基础，关注联合培养或企业实践项目。',
  },
  'math2|eng2': {
    combination: '数学二 + 英语二',
    majors: ['管理科学与工程', '工业工程', '物流工程'],
    suggestion: '适合工管交叉型专业，复试常结合案例分析与数据建模。',
  },
  'math3|eng1': {
    combination: '数学三 + 英语一',
    majors: ['数量经济学', '应用数学', '金融工程'],
    suggestion: '兼顾数学与英语的复试考察，建议准备英文案例分析与建模题。',
  },
  'math3|eng2': {
    combination: '数学三 + 英语二',
    majors: ['金融学', '会计硕士', '应用统计'],
    suggestion: '经管方向常见组合，复试关注财经热点与量化分析。',
  },
  'mathnone|eng1': {
    combination: '不考数学 + 英语一',
    majors: ['翻译硕士', '新闻与传播', '公共管理'],
    suggestion: '突出语言能力与社会科学素养，准备跨文化沟通或政策分析案例。',
  },
  'mathnone|eng2': {
    combination: '不考数学 + 英语二',
    majors: ['法律硕士（非法学）', '教育学', '社会工作'],
    suggestion: '注重综合素质与实践经验，复试常含案例面试与口述题。',
  },
  'math1|any': {
    combination: '数学一',
    majors: ['人工智能', '信息安全', '计算机技术'],
    suggestion: '数学一通常搭配 408 等统考科目，可重点准备算法与数据结构。',
  },
  'math2|any': {
    combination: '数学二',
    majors: ['机械工程', '电气工程', '土木工程'],
    suggestion: '适合传统工科方向，复试强调工程设计与实践能力。',
  },
  'math3|any': {
    combination: '数学三',
    majors: ['金融学', '应用统计', '物流工程'],
    suggestion: '兼顾数学基础与实际应用，可准备案例分析与数据建模展示。',
  },
  'any|eng1': {
    combination: '英语一',
    majors: ['计算机科学', '金融学', '管理科学'],
    suggestion: '英语一复试口语要求更高，建议准备英文自我介绍与问答。',
  },
  'any|eng2': {
    combination: '英语二',
    majors: ['会计硕士', '教育学', '新闻传播'],
    suggestion: '英语二强调实用交流能力，可准备热点话题讨论。',
  },
};

const fallbackSubjectRecommendation = {
  combination: '公共课组合参考',
  majors: ['计算机科学与技术', '金融学', '管理科学与工程'],
  suggestion: '结合目标院校最新招生简章确认专业课要求，合理规划公共课与专业课的复习节奏。',
};

const buildSubjectRecommendations = ({ math, english, targetMajor, totalScore } = {}) => {
  const normalizedMath = normalizeMathSubject(math) || '';
  const normalizedEnglish = normalizeEnglishSubject(english) || '';
  const mathKey = normalizedMath ? normalizedMath.toLowerCase() : 'any';
  const englishKey = normalizedEnglish ? normalizedEnglish.toLowerCase() : 'any';
  const key = `${mathKey}|${englishKey}`;
  const recommendations = [];

  const pushUnique = (entry) => {
    if (!entry) {
      return;
    }
    const exists = recommendations.some((item) => item.combination === entry.combination);
    if (!exists) {
      recommendations.push({ ...entry });
    }
  };

  pushUnique(subjectRecommendationMatrix[key]);

  if (!subjectRecommendationMatrix[key]) {
    if (normalizedMath) {
      pushUnique(subjectRecommendationMatrix[`${mathKey}|any`]);
    }
    if (normalizedEnglish) {
      pushUnique(subjectRecommendationMatrix[`any|${englishKey}`]);
    }
  }

  if (recommendations.length === 0) {
    pushUnique(subjectRecommendationMatrix['math3|eng2']);
    pushUnique(subjectRecommendationMatrix['math1|eng1']);
  }

  pushUnique(fallbackSubjectRecommendation);

  return recommendations.map((item) => {
    const notes = [item.suggestion];
    if (targetMajor) {
      notes.push(`结合目标专业「${targetMajor}」，优先核对复试科目与导师方向，准备差异化亮点。`);
    }
    if (Number.isFinite(totalScore)) {
      if (totalScore >= 400) {
        notes.push('当前分数段具备冲刺顶尖院校的条件，建议提前准备复试英语与科研展示。');
      } else if (totalScore >= 370) {
        notes.push('分数段适合搭配冲刺与稳妥院校，复试阶段突出实践案例。');
      } else {
        notes.push('建议在确保稳妥院校的同时准备调剂方案，关注院校补录信息。');
      }
    }
    return {
      combination: item.combination,
      recommendedMajors: item.majors,
      suggestion: notes.filter(Boolean).join(' '),
    };
  });
};

const buildInterviewPreparation = (focusTopics) => {
  const timeline = [
    {
      stage: '出分当周',
      items: [
        '完成成绩复盘，整理各科优势与短板，明确想要冲刺/稳妥的院校组合。',
        '收集目标院校复试方案、近三年真题与面试常见问题。',
      ],
    },
    {
      stage: '复试准备期（D-21 ~ D-7）',
      items: [
        '针对专业课热点整理答题框架，准备 2-3 个代表性项目或科研案例。',
        '每天至少 30 分钟英文口语训练，覆盖自我介绍与问答过渡。',
        '准备综合素质问题（职业规划、团队协作、抗压经历）的 STAR 结构回答。',
      ],
    },
    {
      stage: '复试冲刺周',
      items: [
        '按照目标院校复试流程进行至少 2 次全真模拟，邀请同伴或导师点评。',
        '完善复试材料（简历、成绩单、获奖证明等）并提前打印备份。',
        '保持作息与心态稳定，复盘常见问题关键词和英文口语表达。',
      ],
    },
  ];

  const suggestions = [
    '构建“冲刺 + 稳妥 + 保底”三层院校池，避免复试节点临时被动调剂。',
    '将科研/实践经历按照背景-任务-行动-结果（STAR）结构输出，突出个人贡献。',
    '准备一段 1.5 分钟左右的中文与英文自我介绍，呼应报考动机与未来规划。',
  ];

  if (focusTopics.length > 0) {
    suggestions.push(`重点关注 ${focusTopics.slice(0, 3).join('、')} 等高频复试主题，准备差异化亮点。`);
  }

  const resources = [
    {
      name: '复试自我介绍模板（含中英文）',
      url: 'https://yz.chsi.com.cn/kyzx/jyzl/202212/20221220/2235205777.html',
      description: '提供结构化自我介绍范式，可快速替换成个人经历。',
    },
    {
      name: '复试专业课高频题整理表',
      url: 'https://www.chinakaoyan.com/info/article/id/344359.shtml',
      description: '覆盖近三年热门院校专业课考察要点与答题思路。',
    },
  ];

  return {
    timeline,
    suggestions,
    focusTopics,
    resources,
  };
};

const buildStrategy = (totalScore, recommended) => {
  const topMatch = recommended[0];
  const hasStable = recommended.some((item) => item.matchLevel === '稳妥');
  const hasSprint = recommended.some((item) => item.matchLevel === '冲刺');
  const hasSafe = recommended.some((item) => item.matchLevel === '保底');

  const strategy = [];

  if (topMatch) {
    strategy.push(
      `优先锁定 ${topMatch.name} 等 ${topMatch.matchLevel} 院校，围绕其复试侧重点（${
        (topMatch.interviewFocus || []).slice(0, 2).join('、') || '综合素质'
      }）制定专项准备。`,
    );
  }

  if (!hasStable || !hasSprint) {
    strategy.push('建议同时保留至少 1 所稳妥院校和 1 所冲刺院校，增强选择余地。');
  }

  if (!hasSafe) {
    strategy.push('如缺少保底院校，可补充 1-2 所对口专业、复试难度适中的学校。');
  }

  strategy.push('提前整理复试材料与调剂意向，关键时间节点保持信息畅通。');

  return strategy;
};

const buildRecommendationResponse = ({ totalScore, major, examPreferences }) => {
  const { recommendedUniversities, focusTopics } = buildRecommendations(
    totalScore,
    major,
    examPreferences,
  );
  const interviewPreparation = buildInterviewPreparation(focusTopics);
  const strategy = buildStrategy(totalScore, recommendedUniversities);

  const summary =
    totalScore >= 400
      ? '分数段具备冲击985热门专业的竞争力，复试环节需突出综合素质与项目深度。'
      : totalScore >= 370
      ? '核心分数段适合冲击优质211及部分985，建议在复试中强化实践与表达。'
      : '建议优先确保稳妥与保底院校的复试通过率，同时准备调剂方案。';

  return {
    totalScore,
    scoreBand: getScoreBand(totalScore),
    summary,
    strategy,
    recommendedUniversities,
    interviewPreparation,
    subjectRecommendations: buildSubjectRecommendations({
      math: examPreferences?.math,
      english: examPreferences?.english,
      targetMajor: major,
      totalScore,
    }),
  };
};

module.exports = {
  buildRecommendationResponse,
  buildSubjectRecommendations,
};
