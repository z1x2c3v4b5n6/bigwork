const express = require('express');
const session = require('express-session');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { pool } = require('./database');

const authRoutes = require('./routes/auth');
const practiceRoutes = require('./routes/practice');
const forumRoutes = require('./routes/forum');
const adminRoutes = require('./routes/admin');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

typeof pool.getConnection === 'function' && pool.getConnection().then((conn) => conn.release()).catch(() => {});

const app = express();

const {
  PORT = 3000,
  ALLOWED_ORIGINS = 'http://localhost:5173,http://localhost:5174,http://localhost:5175',
  SESSION_SECRET = 'replace_me',
  SESSION_NAME = 'kaoyan.sid',
  SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000,
  SESSION_COOKIE_SECURE = 'false',
  SESSION_SAME_SITE = 'lax',
} = process.env;

const allowedOrigins = ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, origin);
      }
      console.warn(`阻止来自未授权来源的请求: ${origin}`);
      return callback(new Error('不被允许的来源'));
    },
    credentials: true,
  }),
);

app.use(express.json());

app.use(
  session({
    name: SESSION_NAME,
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: SESSION_COOKIE_SECURE === 'true',
      sameSite: (SESSION_SAME_SITE || 'lax').toLowerCase(),
      maxAge: Number(SESSION_MAX_AGE) || 7 * 24 * 60 * 60 * 1000,
    },
  }),
);

app.use('/api/auth', authRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', (req, res) => {
  res.status(404).json({ message: '未找到对应接口' });
});

app.use((err, req, res, next) => {
  if (err && err.message === '不被允许的来源') {
    return res.status(403).json({ message: '当前来源未被允许访问接口' });
  }

  console.error('接口出现未捕获异常', err);
  return res.status(500).json({ message: '服务器内部错误，请稍后重试' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
