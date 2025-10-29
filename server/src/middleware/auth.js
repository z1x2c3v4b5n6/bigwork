export const ensureAuthenticated = (req, res, next) => {
  if (!req.session?.user) {
    return res.status(401).json({ message: '未登录或登录状态已过期' });
  }

  return next();
};

export const ensureAdmin = (req, res, next) => {
  if (!req.session?.user) {
    return res.status(401).json({ message: '未登录或登录状态已过期' });
  }

  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ message: '需要管理员权限' });
  }

  return next();
};
