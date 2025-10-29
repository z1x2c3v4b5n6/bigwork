import { Router } from 'express';
import { query } from '../config/database.js';

const router = Router();

const sanitizeUser = (row) => ({
  id: String(row.id),
  name: row.display_name ?? row.username ?? '未知用户',
  username: row.username ?? '',
  role: row.role ?? 'student',
  email: row.email ?? undefined,
});

router.get('/session', (req, res) => {
  const sessionUser = req.session?.user;

  if (!sessionUser) {
    return res.status(401).json({ message: '未登录' });
  }

  return res.json({ user: sessionUser });
});

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body ?? {};

    if (!username || !password) {
      return res.status(400).json({ message: '请提供用户名和密码' });
    }

    const users = await query(
      'SELECT id, username, display_name, role, email, password FROM users WHERE username = ? LIMIT 1',
      [username],
    );

    if (users.length === 0) {
      return res.status(401).json({ message: '账号或密码错误' });
    }

    const userRecord = users[0];
    const storedPassword = userRecord.password ?? '';

    if (storedPassword !== password) {
      return res.status(401).json({ message: '账号或密码错误' });
    }

    const user = sanitizeUser(userRecord);

    return req.session.regenerate((error) => {
      if (error) {
        return next(error);
      }

      req.session.user = user;
      return res.json({ success: true, user });
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/logout', (req, res, next) => {
  if (!req.session) {
    return res.json({ success: true });
  }

  const sessionCookieName = process.env.SESSION_NAME ?? 'kaoyan.sid';
  const cookieOptions = {
    sameSite: process.env.SESSION_SAME_SITE ?? 'lax',
    secure: process.env.SESSION_COOKIE_SECURE === 'true',
    httpOnly: true,
  };

  req.session.destroy((error) => {
    if (error) {
      return next(error);
    }

    res.clearCookie(sessionCookieName, cookieOptions);
    return res.json({ success: true });
  });
});

router.post('/register', async (req, res, next) => {
  try {
    const { username, password, displayName, email } = req.body ?? {};

    if (!username || !password || !displayName) {
      return res.status(400).json({ message: '用户名、姓名和密码均为必填项' });
    }

    const existing = await query('SELECT id FROM users WHERE username = ? LIMIT 1', [username]);

    if (existing.length > 0) {
      return res.status(409).json({ message: '用户名已存在' });
    }

    const result = await query(
      'INSERT INTO users (username, password, display_name, email, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      [username, password, displayName, email ?? null, 'student'],
    );

    const user = sanitizeUser({
      id: result.insertId,
      username,
      display_name: displayName,
      email,
      role: 'student',
    });

    return req.session.regenerate((error) => {
      if (error) {
        return next(error);
      }

      req.session.user = user;
      return res.status(201).json({ success: true, user });
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
