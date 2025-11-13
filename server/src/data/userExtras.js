const { resolveMajorSubjects } = require('./majorSubjects');

const examProfileStore = new Map(); // userId -> profile

const normalizeId = (value) => {
  if (!value) {
    return '';
  }
  return String(value).trim();
};

const setExamProfile = (userId, payload = {}) => {
  const normalized = normalizeId(userId);
  if (!normalized) {
    return null;
  }
  const resolvedMajor = resolveMajorSubjects({
    majorId: payload.majorId,
    majorName: payload.targetMajor,
  });
  const majorTags = Array.isArray(payload.majorTags) && payload.majorTags.length > 0
    ? payload.majorTags
    : resolvedMajor.tags || [];
  const profile = {
    totalScore:
      payload.totalScore != null && Number.isFinite(Number(payload.totalScore))
        ? Number(payload.totalScore)
        : null,
    targetMajor: payload.targetMajor ? String(payload.targetMajor).trim() : null,
    mathSubject: payload.mathSubject ? String(payload.mathSubject).trim() : null,
    englishSubject: payload.englishSubject ? String(payload.englishSubject).trim() : null,
    majorId: payload.majorId ? String(payload.majorId).trim() : resolvedMajor.id || null,
    majorTags: majorTags,
  };
  examProfileStore.set(normalized, profile);
  return profile;
};

const getExamProfile = (userId) => {
  const normalized = normalizeId(userId);
  if (!normalized) {
    return null;
  }
  const profile = examProfileStore.get(normalized);
  return profile
    ? {
        totalScore: profile.totalScore,
        targetMajor: profile.targetMajor,
        mathSubject: profile.mathSubject,
        englishSubject: profile.englishSubject,
        majorId: profile.majorId || null,
        majorTags: Array.isArray(profile.majorTags) ? profile.majorTags : [],
      }
    : null;
};

const defaultExamProfiles = [
  {
    userId: 'user_student_1',
    totalScore: 398,
    targetMajor: '计算机科学与技术',
    mathSubject: '数学一',
    englishSubject: '英语一',
    majorId: 'major_cs',
  },
];

defaultExamProfiles.forEach((profile) => {
  setExamProfile(profile.userId, profile);
});

module.exports = {
  setExamProfile,
  getExamProfile,
};
