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
  const profile = {
    totalScore:
      payload.totalScore != null && Number.isFinite(Number(payload.totalScore))
        ? Number(payload.totalScore)
        : null,
    targetMajor: payload.targetMajor ? String(payload.targetMajor).trim() : null,
    mathSubject: payload.mathSubject ? String(payload.mathSubject).trim() : null,
    englishSubject: payload.englishSubject ? String(payload.englishSubject).trim() : null,
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
      }
    : null;
};

module.exports = {
  setExamProfile,
  getExamProfile,
};
