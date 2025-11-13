const crypto = require('crypto');

const {
  AUTH_TOKEN_SECRET = 'change_me_in_env',
  AUTH_TOKEN_EXPIRES_IN = '7d',
} = process.env;

const DEFAULT_EXP_SECONDS = 7 * 24 * 60 * 60;

const toBase64Url = (value) =>
  Buffer.from(value, 'utf8')
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

const fromBase64Url = (value) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  return Buffer.from(padded, 'base64').toString('utf8');
};

const signSegment = (segment) =>
  crypto
    .createHmac('sha256', AUTH_TOKEN_SECRET)
    .update(segment)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

const timingSafeEqual = (a, b) => {
  const bufferA = Buffer.from(a, 'utf8');
  const bufferB = Buffer.from(b, 'utf8');
  if (bufferA.length !== bufferB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufferA, bufferB);
};

const parseExpiresInSeconds = (value) => {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return Math.floor(value);
  }

  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw) {
    return DEFAULT_EXP_SECONDS;
  }

  const match = raw.match(/^(\d+)([smhd])?$/i);
  if (!match) {
    return DEFAULT_EXP_SECONDS;
  }

  const amount = Number.parseInt(match[1], 10);
  const unit = (match[2] || 's').toLowerCase();
  const multipliers = { s: 1, m: 60, h: 3600, d: 24 * 3600 };
  const multiplier = multipliers[unit] || 1;

  if (!Number.isFinite(amount) || amount <= 0) {
    return DEFAULT_EXP_SECONDS;
  }

  return amount * multiplier;
};

const normalizeRole = (rawRole) => {
  if (!rawRole) {
    return 'student';
  }

  const role = String(rawRole).trim();
  const lowerRole = role.toLowerCase();

  if (['admin', 'administrator', '系统管理员'].includes(lowerRole) || role === '管理员') {
    return 'admin';
  }

  if (
    ['institution', 'university', 'college'].includes(lowerRole) ||
    ['院校', '招生单位', '高校'].includes(role)
  ) {
    return 'institution';
  }

  return 'student';
};

const isAdminRole = (rawRole) => normalizeRole(rawRole) === 'admin';

const sanitizeSessionUser = (rawUser) => {
  if (!rawUser || typeof rawUser !== 'object') {
    return {
      id: '',
      name: '未命名用户',
      role: 'student',
      email: null,
      phone: null,
      organization: null,
      goal: null,
      majorId: null,
      majorName: null,
      avatar: null,
      bio: null,
    };
  }

  const record = rawUser;
  const id = record.id != null ? String(record.id) : record.userId != null ? String(record.userId) : '';
  return {
    id,
    name:
      typeof record.name === 'string' && record.name.trim()
        ? record.name.trim()
        : typeof record.display_name === 'string' && record.display_name.trim()
        ? record.display_name.trim()
        : typeof record.username === 'string' && record.username.trim()
        ? record.username.trim()
        : '未命名用户',
    role: normalizeRole(record.role),
    email: typeof record.email === 'string' && record.email ? record.email : null,
    phone: typeof record.phone === 'string' && record.phone ? record.phone : null,
    organization:
      typeof record.organization === 'string' && record.organization ? record.organization : null,
    goal: typeof record.goal === 'string' && record.goal ? record.goal : null,
    majorId:
      record.majorId != null
        ? String(record.majorId)
        : record.major_id != null
        ? String(record.major_id)
        : null,
    majorName:
      typeof record.majorName === 'string' && record.majorName
        ? record.majorName
        : typeof record.major_name === 'string' && record.major_name
        ? record.major_name
        : null,
    avatar: typeof record.avatar === 'string' && record.avatar ? record.avatar : null,
    bio: typeof record.bio === 'string' && record.bio ? record.bio : null,
  };
};

const createAuthToken = (user) => {
  const sanitized = sanitizeSessionUser(user);

  if (!sanitized.id) {
    throw new Error('用户信息缺少 id，无法生成访问令牌');
  }

  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresInSeconds = parseExpiresInSeconds(AUTH_TOKEN_EXPIRES_IN);
  const payload = {
    sub: sanitized.id,
    role: sanitized.role,
    name: sanitized.name,
    iat: issuedAt,
    exp: issuedAt + expiresInSeconds,
    user: sanitized,
  };

  const payloadSegment = toBase64Url(JSON.stringify(payload));
  const signature = signSegment(payloadSegment);
  return `${payloadSegment}.${signature}`;
};

const verifyAuthToken = (token) => {
  if (typeof token !== 'string' || !token.trim()) {
    return null;
  }
  const parts = token.split('.');
  if (parts.length !== 2) {
    return null;
  }

  const [payloadSegment, signatureSegment] = parts;
  if (!payloadSegment || !signatureSegment) {
    return null;
  }

  const expectedSignature = signSegment(payloadSegment);
  if (!timingSafeEqual(signatureSegment, expectedSignature)) {
    return null;
  }

  try {
    const json = fromBase64Url(payloadSegment);
    const payload = JSON.parse(json);

    if (payload && typeof payload === 'object' && payload.exp) {
      const now = Math.floor(Date.now() / 1000);
      if (Number.isFinite(payload.exp) && now >= payload.exp) {
        return null;
      }
    }

    return payload;
  } catch (error) {
    return null;
  }
};

const resolveUserFromTokenPayload = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  if (payload.user && typeof payload.user === 'object') {
    return sanitizeSessionUser(payload.user);
  }

  const sub = payload.sub != null ? String(payload.sub) : '';
  if (!sub) {
    return null;
  }

  return sanitizeSessionUser({
    id: sub,
    role: payload.role,
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    organization: payload.organization,
    goal: payload.goal,
    majorId: payload.majorId,
    majorName: payload.majorName,
    avatar: payload.avatar,
    bio: payload.bio,
  });
};

const extractBearerToken = (headerValue) => {
  if (typeof headerValue !== 'string') {
    return null;
  }

  const match = headerValue.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
};

module.exports = {
  normalizeRole,
  isAdminRole,
  sanitizeSessionUser,
  createAuthToken,
  verifyAuthToken,
  resolveUserFromTokenPayload,
  extractBearerToken,
};
