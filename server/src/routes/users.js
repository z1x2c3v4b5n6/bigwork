const express = require('express');
const {
  query,
  updateRecord,
  getTableColumns,
  getTableColumnDetails,
  tableExists,
} = require('../database');
const { requireAuth } = require('../middleware/auth');
const { normalizeRole } = require('../utils/auth');
const { normalizeIdentifier, normalizeValueForColumn } = require('../utils/db');

const router = express.Router();

const resolveColumn = (columns, candidates) => candidates.find((column) => columns.has(column)) || null;

let cachedUserConfig = null;

const getUserConfig = async () => {
  if (cachedUserConfig) {
    return cachedUserConfig;
  }

  const columns = await getTableColumns('users');

  if (columns.size === 0) {
    return null;
  }

  const columnDetails = await getTableColumnDetails('users');
  const majorsAvailable = await tableExists('majors');

  cachedUserConfig = {
    table: 'users',
    columns,
    columnDetails,
    id: resolveColumn(columns, ['id', 'user_id']),
    username: resolveColumn(columns, ['username', 'user_name', 'account']),
    name: resolveColumn(columns, ['display_name', 'name', 'full_name']),
    email: resolveColumn(columns, ['email', 'email_address']),
    phone: resolveColumn(columns, ['phone', 'mobile', 'phone_number']),
    organization: resolveColumn(columns, ['organization', 'school', 'company']),
    goal: resolveColumn(columns, ['goal', 'target', 'plan']),
    majorId: resolveColumn(columns, ['major_id', 'majorid', 'major']),
    avatar: resolveColumn(columns, ['avatar', 'avatar_url', 'profile_picture']),
    bio: resolveColumn(columns, ['bio', 'introduction', 'profile']),
    role: resolveColumn(columns, ['role', 'user_role']),
    majorsAvailable,
  };

  return cachedUserConfig;
};

const buildUserSelect = (config) => {
  const fragments = [];

  fragments.push(config.id ? `u.\`${config.id}\` AS id` : 'NULL AS id');
  fragments.push(config.username ? `u.\`${config.username}\` AS username` : 'NULL AS username');
  fragments.push(config.name ? `u.\`${config.name}\` AS display_name` : 'NULL AS display_name');
  fragments.push(config.email ? `u.\`${config.email}\` AS email` : 'NULL AS email');
  fragments.push(config.phone ? `u.\`${config.phone}\` AS phone` : 'NULL AS phone');
  fragments.push(config.organization ? `u.\`${config.organization}\` AS organization` : 'NULL AS organization');
  fragments.push(config.goal ? `u.\`${config.goal}\` AS goal` : 'NULL AS goal');
  fragments.push(config.avatar ? `u.\`${config.avatar}\` AS avatar` : 'NULL AS avatar');
  fragments.push(config.bio ? `u.\`${config.bio}\` AS bio` : 'NULL AS bio');
  fragments.push(config.role ? `u.\`${config.role}\` AS role` : "'student' AS role");

  if (config.majorId) {
    fragments.push(`u.\`${config.majorId}\` AS major_id`);
    if (config.majorsAvailable) {
      fragments.push('m.`name` AS major_name');
    } else {
      fragments.push('NULL AS major_name');
    }
  } else {
    fragments.push('NULL AS major_id');
    fragments.push('NULL AS major_name');
  }

  return fragments;
};

const formatUserProfile = (row) => ({
  id: row?.id != null ? String(row.id) : '',
  name: row?.display_name || row?.username || '未命名用户',
  email: row?.email || null,
  phone: row?.phone || null,
  organization: row?.organization || null,
  goal: row?.goal || null,
  majorId: row?.major_id ? String(row.major_id) : null,
  majorName: row?.major_name || null,
  role: normalizeRole(row?.role),
  avatar: row?.avatar || null,
  bio: row?.bio || null,
});

const loadUserProfile = async (identifier) => {
  const config = await getUserConfig();

  if (!config || !config.id) {
    return null;
  }

  const selectFragments = buildUserSelect(config);
  const joinClause = config.majorId && config.majorsAvailable ? `LEFT JOIN majors m ON m.id = u.\`${config.majorId}\`` : '';

  const rows = await query(
    `SELECT ${selectFragments.join(', ')} FROM users u ${joinClause} WHERE u.\`${config.id}\` = :id LIMIT 1`,
    { id: identifier },
  );

  if (rows.length === 0) {
    return null;
  }

  return formatUserProfile(rows[0]);
};

const applyProfileUpdates = (config, payload) => {
  const updates = {};

  if (config.name && payload.name !== undefined) {
    updates[config.name] = normalizeValueForColumn(config.columnDetails, config.name, payload.name);
  }

  if (config.email && payload.email !== undefined) {
    updates[config.email] = normalizeValueForColumn(config.columnDetails, config.email, payload.email);
  }

  if (config.phone && payload.phone !== undefined) {
    updates[config.phone] = normalizeValueForColumn(config.columnDetails, config.phone, payload.phone);
  }

  if (config.organization && payload.organization !== undefined) {
    updates[config.organization] = normalizeValueForColumn(
      config.columnDetails,
      config.organization,
      payload.organization,
    );
  }

  if (config.goal && payload.goal !== undefined) {
    updates[config.goal] = normalizeValueForColumn(config.columnDetails, config.goal, payload.goal);
  }

  if (config.bio && payload.bio !== undefined) {
    updates[config.bio] = normalizeValueForColumn(config.columnDetails, config.bio, payload.bio);
  }

  if (config.avatar && payload.avatar !== undefined) {
    updates[config.avatar] = normalizeValueForColumn(config.columnDetails, config.avatar, payload.avatar);
  }

  if (config.majorId && Object.prototype.hasOwnProperty.call(payload, 'majorId')) {
    const normalizedMajor = payload.majorId ? normalizeIdentifier(payload.majorId) : null;
    updates[config.majorId] = normalizeValueForColumn(config.columnDetails, config.majorId, normalizedMajor);
  }

  return updates;
};

router.get('/:id', requireAuth, async (req, res) => {
  const identifier = normalizeIdentifier(req.params.id);

  if (!identifier) {
    return res.status(400).json({ message: '用户编号无效' });
  }

  const sessionUser = req.session?.user;
  const isAdmin = sessionUser?.role === 'admin';

  if (!isAdmin && sessionUser?.id !== identifier) {
    return res.status(403).json({ message: '无权查看该用户资料' });
  }

  try {
    const profile = await loadUserProfile(identifier);

    if (!profile) {
      return res.status(404).json({ message: '未找到对应的用户资料' });
    }

    return res.json(profile);
  } catch (error) {
    console.error('加载用户资料失败', error);
    return res.status(500).json({ message: '无法加载用户资料，请稍后重试' });
  }
});

router.patch('/:id', requireAuth, async (req, res) => {
  const identifier = normalizeIdentifier(req.params.id);

  if (!identifier) {
    return res.status(400).json({ message: '用户编号无效' });
  }

  const sessionUser = req.session?.user;
  const isAdmin = sessionUser?.role === 'admin';

  if (!isAdmin && sessionUser?.id !== identifier) {
    return res.status(403).json({ message: '无权修改该用户资料' });
  }

  try {
    const config = await getUserConfig();

    if (!config || !config.id) {
      return res.status(500).json({ message: 'users 表不存在或缺少主键字段，请检查数据库结构。' });
    }

    const updates = applyProfileUpdates(config, req.body || {});

    if (Object.keys(updates).length === 0) {
      const profile = await loadUserProfile(identifier);
      if (!profile) {
        return res.status(404).json({ message: '未找到对应的用户资料' });
      }
      return res.json(profile);
    }

    await updateRecord(config.table, identifier, updates, { idColumn: config.id });

    const profile = await loadUserProfile(identifier);

    if (profile && sessionUser?.id === profile.id) {
      req.session.user = { ...sessionUser, ...profile };
    }

    return res.json(profile ?? {});
  } catch (error) {
    console.error('更新用户资料失败', error);
    return res.status(500).json({ message: '保存用户资料失败，请稍后重试' });
  }
});

module.exports = router;
