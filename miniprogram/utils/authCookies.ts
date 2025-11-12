import { loadFromStorage, resetStorageKey, saveToStorage } from './storage';

type CookieResponse = {
  header?: Record<string, unknown>;
  cookies?: unknown;
} & Record<string, unknown>;

const COOKIE_STORAGE_KEY = 'sessionCookieHeader';

const normalizeCookie = (cookie: string): string | null => {
  if (!cookie) {
    return null;
  }
  const trimmed = cookie.split(';')[0]?.trim();
  return trimmed ? trimmed : null;
};

const extractFromCookieArray = (cookies: unknown): string[] => {
  if (!Array.isArray(cookies)) {
    return [];
  }
  return cookies
    .map((cookie) => {
      if (typeof cookie === 'string') {
        return cookie;
      }
      if (cookie && typeof cookie === 'object') {
        const record = cookie as { name?: string; value?: string };
        if (typeof record.name === 'string' && typeof record.value === 'string') {
          return `${record.name}=${record.value}`;
        }
      }
      return '';
    })
    .filter((value): value is string => Boolean(value));
};

const extractFromHeader = (headerValue: unknown): string[] => {
  if (typeof headerValue === 'string') {
    return [headerValue];
  }
  if (Array.isArray(headerValue)) {
    return headerValue.filter((value): value is string => typeof value === 'string');
  }
  return [];
};

const deduplicate = (values: string[]): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];
  values.forEach((value) => {
    if (!seen.has(value)) {
      seen.add(value);
      result.push(value);
    }
  });
  return result;
};

export const getStoredCookieHeader = (): string | null => {
  const stored = loadFromStorage<string | null>(COOKIE_STORAGE_KEY, null);
  if (typeof stored === 'string' && stored.trim()) {
    return stored;
  }
  return null;
};

export const storeResponseCookies = (response: CookieResponse): string | null => {
  const header = response.header ?? {};
  const cookieCandidates = [
    ...extractFromCookieArray((response as { cookies?: unknown }).cookies),
    ...extractFromHeader((header as Record<string, unknown>)['Set-Cookie']),
    ...extractFromHeader((header as Record<string, unknown>)['set-cookie']),
  ];

  const normalized = deduplicate(
    cookieCandidates
      .map((cookie) => normalizeCookie(cookie))
      .filter((cookie): cookie is string => Boolean(cookie)),
  );

  if (!normalized.length) {
    return null;
  }

  const headerValue = normalized.join('; ');
  saveToStorage(COOKIE_STORAGE_KEY, headerValue);
  return headerValue;
};

export const clearStoredCookies = () => {
  resetStorageKey(COOKIE_STORAGE_KEY);
};
