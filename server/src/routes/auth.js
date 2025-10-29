import { Router } from 'express';
import { query } from '../config/database.js';

const router = Router();

const sanitizeUser = (row) => ({
  id: String(row.id),
  name: row.name ?? row.username ?? '未知用户',
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
      `SELECT id, username, name, role, email, password FROM users WHERE username = ? LIMIT 1`,
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

export default router;
