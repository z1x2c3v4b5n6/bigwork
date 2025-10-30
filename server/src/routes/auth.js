const express = require('express');
const bcrypt = require('bcryptjs');
const { query } = require('../database');
const { requireAuth } = require('../middleware/auth');
const { normalizeRole } = require('../utils/auth');

const { SESSION_NAME = 'connect.sid' } = process.env;

const router = express.Router();

const serializeUser = (row) => ({
  id: String(row.id),
  name: row.display_name || row.username,
  role: normalizeRole(row.role),
  email: row.email || null,
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
    const existing = await query(
      'SELECT id FROM users WHERE username = :username LIMIT 1',
      { username },
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: '用户名已存在' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO users (username, password, display_name, email, role, created_at, updated_at)
       VALUES (:username, :password, :displayName, :email, 'student', NOW(), NOW())`,
      {
        username,
        password: hashedPassword,
        displayName,
        email: email || null,
      },
    );

    const user = {
      id: String(result.insertId),
      name: displayName,
      role: 'student',
      email: email || null,
    };

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
    const rows = await query(
      'SELECT id, username, password, display_name, email, role FROM users WHERE username = :username LIMIT 1',
      { username },
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    const record = rows[0];
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
