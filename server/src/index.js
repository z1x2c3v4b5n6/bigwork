import express from 'express';
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';

import authRouter from './routes/auth.js';
import adminRouter from './routes/admin.js';
import practiceRouter from './routes/practice.js';
import forumRouter from './routes/forum.js';
import { getPool } from './config/database.js';

dotenv.config();

const app = express();

const defaultOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? defaultOrigins.join(','))
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowAllOrigins = allowedOrigins.includes('*');

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (allowAllOrigins || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      const error = new Error(`Origin ${origin} is not allowed by CORS`);
      console.warn(error.message);
      return callback(error);
    },
    credentials: true,
  }),
);

app.use(express.json());

app.use(
  session({
    name: process.env.SESSION_NAME ?? 'kaoyan.sid',
    secret: process.env.SESSION_SECRET ?? 'dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: process.env.SESSION_SAME_SITE ?? 'lax',
      secure: process.env.SESSION_COOKIE_SECURE === 'true',
      maxAge: Number(process.env.SESSION_MAX_AGE ?? 1000 * 60 * 60 * 24 * 7),
    },
  }),
);

app.get('/health', async (req, res, next) => {
  try {
    const pool = getPool();
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
});

app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/practice', practiceRouter);
app.use('/api/forum', forumRouter);

app.use('/api/*', (req, res) => {
  res.status(404).json({ message: '接口未找到' });
});

app.use((err, req, res, next) => {
  console.error('请求处理失败:', err);
  res.status(500).json({ message: '服务器异常，请稍后重试' });
});

const PORT = Number(process.env.PORT ?? 3000);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
