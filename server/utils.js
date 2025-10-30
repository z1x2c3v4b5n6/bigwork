export const bannedWords = ['傻逼', '傻子', '垃圾', '去死', '滚', 'fuck', 'shit', 'sb', '妈的'];

export const sanitizeText = (value) => {
  if (typeof value !== 'string') {
    return value;
  }
  let sanitized = value.trim();
  bannedWords.forEach((word) => {
    const pattern = new RegExp(word, 'gi');
    sanitized = sanitized.replace(pattern, '*'.repeat(word.length));
  });
  return sanitized;
};

export const parseJson = (value, fallback) => {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch (error) {
    return fallback;
  }
};

export const stringifyJson = (value) => JSON.stringify(value ?? []);

export const statAccents = {
  studyTime: 'rgba(25, 118, 210, 0.2)',
  questionDrill: 'rgba(255, 112, 67, 0.25)',
  courseFocus: 'rgba(102, 187, 106, 0.25)',
  mockRank: 'rgba(255, 213, 79, 0.35)',
};
