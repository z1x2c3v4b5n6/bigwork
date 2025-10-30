const requireAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }

  return res.status(401).json({ message: '未登录或会话已失效' });
};

const requireAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }

  return res.status(403).json({ message: '需要管理员权限' });
};

module.exports = {
  requireAuth,
  requireAdmin,
};
