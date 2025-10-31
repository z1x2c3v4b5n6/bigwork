const express = require('express');
const bcrypt = require('bcryptjs');
const { query, insertRecord, getTableColumns } = require('../database');
const { requireAuth } = require('../middleware/auth');
const { normalizeRole } = require('../utils/auth');

const { SESSION_NAME = 'connect.sid' } = process.env;

const router = express.Router();

const resolveColumn = (columns, candidates) => candidates.find((column) => columns.has(column)) || null;

const buildUserColumnMap = (columns) => ({
  id: resolveColumn(columns, ['id', 'user_id']),
  username: resolveColumn(columns, ['username', 'user_name', 'account']),
  password: resolveColumn(columns, ['password', 'passwd', 'password_hash']),
  displayName: resolveColumn(columns, ['display_name', 'name', 'full_name']),
  email: resolveColumn(columns, ['email', 'email_address']),
  role: resolveColumn(columns, ['role', 'user_role']),
  phone: resolveColumn(columns, ['phone', 'mobile', 'phone_number']),
  organization: resolveColumn(columns, ['organization', 'school', 'company']),
  goal: resolveColumn(columns, ['goal', 'target', 'plan']),
  majorId: resolveColumn(columns, ['major_id', 'majorid', 'major']),
  avatar: resolveColumn(columns, ['avatar', 'avatar_url', 'profile_picture']),
  bio: resolveColumn(columns, ['bio', 'introduction', 'profile']),
});

const buildUserSelectFragments = (map, { includePassword = false, includeProfile = false, majorAlias = null } = {}) => {
  const fragments = [];

  fragments.push(map.id ? `u.\`${map.id}\` AS id` : 'NULL AS id');
  fragments.push(map.username ? `u.\`${map.username}\` AS username` : "NULL AS username");

  if (includePassword) {
    fragments.push(map.password ? `u.\`${map.password}\` AS password` : 'NULL AS password');
  }

  const displayExpr = map.displayName
    ? `u.\`${map.displayName}\``
    : map.username
    ? `u.\`${map.username}\``
    : "'未命名用户'";
  fragments.push(`${displayExpr} AS display_name`);

  fragments.push(map.email ? `u.\`${map.email}\` AS email` : 'NULL AS email');
  fragments.push(map.role ? `u.\`${map.role}\` AS role` : "'student' AS role");

  if (includeProfile) {
    fragments.push(map.phone ? `u.\`${map.phone}\` AS phone` : 'NULL AS phone');
    fragments.push(map.organization ? `u.\`${map.organization}\` AS organization` : 'NULL AS organization');
    fragments.push(map.goal ? `u.\`${map.goal}\` AS goal` : 'NULL AS goal');
    fragments.push(map.avatar ? `u.\`${map.avatar}\` AS avatar` : 'NULL AS avatar');
    fragments.push(map.bio ? `u.\`${map.bio}\` AS bio` : 'NULL AS bio');
    if (map.majorId) {
      fragments.push(`u.\`${map.majorId}\` AS major_id`);
      if (majorAlias) {
        fragments.push(`${majorAlias}.\`name\` AS major_name`);
      } else {
        fragments.push('NULL AS major_name');
      }
    } else {
      fragments.push('NULL AS major_id');
      fragments.push('NULL AS major_name');
    }
  }

  return fragments;
};

const fetchUserByUsername = async (username) => {
  const columns = await getTableColumns('users');

  if (columns.size === 0) {
    throw new Error('users 表不存在，请先在数据库中创建。');
  }

  const map = buildUserColumnMap(columns);

  if (!map.username) {
    throw new Error('users 表缺少 username 字段，请确认字段名是否为 username。');
  }

  const includeProfile = Boolean(map.phone || map.organization || map.goal || map.majorId || map.avatar || map.bio);
  const selectFragments = buildUserSelectFragments(map, {
    includePassword: true,
    includeProfile,
    majorAlias: includeProfile && map.majorId ? 'm' : null,
  });

  const joinClause = includeProfile && map.majorId ? 'LEFT JOIN majors m ON m.id = u.\`' + map.majorId + '\`' : '';

  const rows = await query(
    `SELECT ${selectFragments.join(', ')} FROM users u ${joinClause} WHERE u.\`${map.username}\` = :username LIMIT 1`,
    { username },
  );

  return { record: rows[0] || null, map };
};

const serializeUser = (row) => ({
  id: row?.id != null ? String(row.id) : '',
  name: row?.display_name || row?.username || '未命名用户',
  role: normalizeRole(row?.role),
  email: row?.email || null,
  phone: row?.phone || null,
  organization: row?.organization || null,
  goal: row?.goal || null,
  majorId: row?.major_id ? String(row.major_id) : null,
  majorName: row?.major_name || null,
  avatar: row?.avatar || null,
  bio: row?.bio || null,
});

router.get('/session', (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: '未登录' });
  }

  return res.json({ user: req.session.user });
});

router.post('/register', async (req, res) => {
  const { username, password, displayName, email } = req.body || {};

  if (!username || !password || !displayName) {
    return res.status(400).json({ message: '用户名、密码与姓名不能为空' });
  }

  try {
    const { record: existing, map } = await fetchUserByUsername(username);

    if (existing) {
      return res.status(409).json({ message: '用户名已存在' });
    }

    if (!map.password) {
      return res
        .status(500)
        .json({ message: 'users 表缺少 password 字段，请参考 README 调整数据表结构。' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const payload = {
      [map.username]: username,
      [map.password]: hashedPassword,
    };

    if (map.displayName) {
      payload[map.displayName] = displayName;
    }

    if (map.email) {
      payload[map.email] = email || null;
    }

    if (map.role) {
      payload[map.role] = 'student';
    }

    await insertRecord('users', payload);

    const { record: createdRecord } = await fetchUserByUsername(username);
    const user = serializeUser(createdRecord || { username, display_name: displayName, email, role: 'student' });

    req.session.user = user;

    return res.status(201).json({ user });
  } catch (error) {
    console.error('注册失败', error);
    return res.status(500).json({ message: '注册失败，请稍后重试' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: '请输入用户名和密码' });
  }

  try {
    const { record } = await fetchUserByUsername(username);

    if (!record) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }
    let passwordMatch = false;

    try {
      passwordMatch = await bcrypt.compare(password, record.password || '');
    } catch (compareError) {
      console.warn('密码校验异常，尝试使用明文比对', compareError.message);
    }

    if (!passwordMatch && record.password === password) {
      passwordMatch = true;
    }

    if (!passwordMatch) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    const user = serializeUser(record);
    req.session.user = user;

    return res.json({ user });
  } catch (error) {
    console.error('登录失败', error);
    return res.status(500).json({ message: '登录失败，请稍后重试' });
  }
});

router.post('/logout', requireAuth, (req, res) => {
  req.session.destroy(() => {
    res.clearCookie(SESSION_NAME);
    res.json({ success: true });
  });
});

module.exports = router;
