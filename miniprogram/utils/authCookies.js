const { loadFromStorage, resetStorageKey, saveToStorage } = require('./storage.js');

const COOKIE_STORAGE_KEY = 'sessionCookieHeader';

const normalizeCookie = (cookie) => {
  if (!cookie) {
    return null;
  }
  const trimmed = cookie.split(';')[0];
  return trimmed && trimmed.trim() ? trimmed.trim() : null;
};

const extractFromCookieArray = (cookies) => {
  if (!Array.isArray(cookies)) {
    return [];
  }
  return cookies
    .map((cookie) => {
      if (typeof cookie === 'string') {
        return cookie;
      }
      if (cookie && typeof cookie === 'object') {
        const { name, value } = cookie;
        if (typeof name === 'string' && typeof value === 'string') {
          return `${name}=${value}`;
        }
      }
      return '';
    })
    .filter((value) => Boolean(value));
};

const extractFromHeader = (headerValue) => {
  if (typeof headerValue === 'string') {
    return [headerValue];
  }
  if (Array.isArray(headerValue)) {
    return headerValue.filter((value) => typeof value === 'string');
  }
  return [];
};

const deduplicate = (values) => {
  const seen = new Set();
  const result = [];
  values.forEach((value) => {
    if (!seen.has(value)) {
      seen.add(value);
      result.push(value);
    }
  });
  return result;
};

const getStoredCookieHeader = () => {
  const stored = loadFromStorage(COOKIE_STORAGE_KEY, null);
  if (typeof stored === 'string' && stored.trim()) {
    return stored;
  }
  return null;
};

const storeResponseCookies = (response) => {
  const header = response.header || {};
  const cookieCandidates = [
    ...extractFromCookieArray(response.cookies),
    ...extractFromHeader(header['Set-Cookie']),
    ...extractFromHeader(header['set-cookie']),
  ];

  const normalized = deduplicate(
    cookieCandidates
      .map((cookie) => normalizeCookie(cookie))
      .filter((cookie) => Boolean(cookie)),
  );

  if (!normalized.length) {
    return null;
  }

  const headerValue = normalized.join('; ');
  saveToStorage(COOKIE_STORAGE_KEY, headerValue);
  return headerValue;
};

const clearStoredCookies = () => {
  resetStorageKey(COOKIE_STORAGE_KEY);
};

module.exports = {
  getStoredCookieHeader,
  storeResponseCookies,
  clearStoredCookies,
};
