const normalizeDate = (value) => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  try {
    return new Date(value).toISOString();
  } catch (error) {
    return null;
  }
};

const parseTags = (raw) => {
  if (!raw) {
    return [];
  }

  if (Array.isArray(raw)) {
    return raw;
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    if (typeof parsed === 'string') {
      return parsed.split(',').map((item) => item.trim()).filter(Boolean);
    }
  } catch (error) {
    return String(raw)
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const stringifyTags = (tags) => {
  if (!tags) {
    return JSON.stringify([]);
  }

  if (typeof tags === 'string') {
    return JSON.stringify(
      tags
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    );
  }

  if (Array.isArray(tags)) {
    return JSON.stringify(tags);
  }

  return JSON.stringify([]);
};

const toMySqlDateTime = (value) => {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const pad = (num) => String(num).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(
    date.getMinutes(),
  )}:${pad(date.getSeconds())}`;
};

module.exports = {
  normalizeDate,
  parseTags,
  stringifyTags,
  toMySqlDateTime,
};
