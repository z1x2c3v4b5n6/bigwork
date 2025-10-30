const normalizeRole = (rawRole) => {
  if (!rawRole) {
    return 'student';
  }

  const role = String(rawRole).trim();
  const lowerRole = role.toLowerCase();

  if (['admin', 'administrator', '系统管理员'].includes(lowerRole) || role === '管理员') {
    return 'admin';
  }

  return 'student';
};

const isAdminRole = (rawRole) => normalizeRole(rawRole) === 'admin';

module.exports = {
  normalizeRole,
  isAdminRole,
};
