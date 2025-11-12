const {
  isAdminRole,
  verifyAuthToken,
  resolveUserFromTokenPayload,
  extractBearerToken,
} = require('../utils/auth');

const resolveTokenFromRequest = (req) => {
  const header = req.headers?.authorization || req.headers?.Authorization;
  const tokenFromHeader = extractBearerToken(header);
  if (tokenFromHeader) {
    return tokenFromHeader;
  }

  const queryToken = req.query && typeof req.query.token === 'string' ? req.query.token.trim() : '';
  if (queryToken) {
    return queryToken;
  }

  const directHeaderToken = req.headers && typeof req.headers.token === 'string' ? req.headers.token.trim() : '';
  return directHeaderToken || null;
};

const applyUserToRequest = (req, user) => {
  if (user && user.id) {
    req.user = user;
    if (req.session) {
      req.session.user = user;
    }
    return true;
  }
  return false;
};

const ensureRequestUser = (req) => {
  if (req.user && req.user.id) {
    applyUserToRequest(req, req.user);
    return req.user;
  }

  if (req.session && req.session.user && req.session.user.id) {
    applyUserToRequest(req, req.session.user);
    return req.session.user;
  }

  const token = resolveTokenFromRequest(req);
  if (!token) {
    return null;
  }

  const payload = verifyAuthToken(token);
  const user = resolveUserFromTokenPayload(payload);

  if (user && user.id) {
    applyUserToRequest(req, user);
    return user;
  }

  return null;
};

const requireAuth = (req, res, next) => {
  const user = ensureRequestUser(req);
  if (user && user.id) {
    return next();
  }

  return res.status(401).json({ message: '未登录或会话已失效' });
};

const requireAdmin = (req, res, next) => {
  const user = ensureRequestUser(req);

  if (!user || !user.id) {
    return res.status(401).json({ message: '未登录或会话已失效' });
  }

  if (isAdminRole(user.role)) {
    return next();
  }

  return res.status(403).json({ message: '需要管理员权限' });
};

module.exports = {
  requireAuth,
  requireAdmin,
};
