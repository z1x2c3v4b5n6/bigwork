const apiBase = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

export const resolveAssetUrl = (value?: string | null): string | null => {
  if (!value) {
    return null;
  }

  if (value.startsWith('data:')) {
    return value;
  }

  if (/^https?:/i.test(value)) {
    return value;
  }

  const normalized = value.startsWith('/') ? value : `/${value}`;
  return `${apiBase}${normalized}`;
};
