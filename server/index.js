import express from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dayjs from 'dayjs';
import { nanoid } from 'nanoid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'data', 'db.json');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

async function readDb() {
  const raw = await fs.readFile(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

async function writeDb(nextState) {
  await fs.writeFile(DB_PATH, JSON.stringify(nextState, null, 2));
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/dashboard', async (_req, res) => {
  const db = await readDb();
  res.json(db.dashboard);
});

app.get('/api/schedule', async (_req, res) => {
  const db = await readDb();
  res.json(db.schedule);
});

app.post('/api/schedule', async (req, res) => {
  const { title, type, start, end, location, focus, tags } = req.body;

  if (!title || !type || !start || !end) {
    res.status(400).json({ message: 'title, type, start, end are required' });
    return;
  }

  const db = await readDb();
  const newItem = {
    id: `schedule_${nanoid(8)}`,
    title,
    type,
    start,
    end,
    location,
    focus,
    tags: Array.isArray(tags) ? tags : [],
    createdAt: new Date().toISOString(),
  };

  const nextSchedule = [newItem, ...db.schedule].sort((a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf());

  const nextState = {
    ...db,
    schedule: nextSchedule,
    dashboard: {
      ...db.dashboard,
      schedule: nextSchedule.slice(0, 6),
    },
  };

  await writeDb(nextState);
  res.status(201).json(newItem);
});

app.get('/api/practice', async (_req, res) => {
  const db = await readDb();
  res.json(db.practiceSets);
});

app.post('/api/practice', async (req, res) => {
  const { name, questions, duration, focus, difficulty } = req.body;
  if (!name) {
    res.status(400).json({ message: 'name is required' });
    return;
  }

  const db = await readDb();
  const newSet = {
    id: `practice_${nanoid(8)}`,
    name,
    questions: Number.isFinite(questions) ? questions : 25,
    accuracy: 0.5,
    lastAttempt: new Date().toISOString(),
    duration: duration ?? 45,
    focus,
    difficulty: difficulty ?? '进阶',
    source: '自定义',
  };

  const nextState = {
    ...db,
    practiceSets: [newSet, ...db.practiceSets],
    dashboard: {
      ...db.dashboard,
      practiceSets: [newSet, ...db.practiceSets],
    },
  };

  await writeDb(nextState);
  res.status(201).json(newSet);
});

app.get('/api/admin/overview', async (_req, res) => {
  const db = await readDb();
  res.json(db.admin);
});

app.post('/api/admin/courses', async (req, res) => {
  const { name, category, teacher, releaseWindow } = req.body;
  if (!name || !category || !teacher) {
    res.status(400).json({ message: 'name, category, teacher are required' });
    return;
  }

  const db = await readDb();
  const draft = {
    id: `draft_${nanoid(6)}`,
    name,
    category,
    status: '待发布',
    teacher,
    updatedAt: dayjs().format('YYYY-MM-DD HH:mm'),
    releaseWindow: releaseWindow ?? '待排期',
  };

  const nextState = {
    ...db,
    admin: {
      ...db.admin,
      courseDrafts: [draft, ...db.admin.courseDrafts],
    },
  };

  await writeDb(nextState);
  res.status(201).json(draft);
});

app.post('/api/admin/courses/:id/publish', async (req, res) => {
  const draftId = req.params.id;
  const db = await readDb();
  const drafts = db.admin.courseDrafts.map((draft) =>
    draft.id === draftId ? { ...draft, status: '已发布', updatedAt: dayjs().format('YYYY-MM-DD HH:mm') } : draft,
  );

  const nextState = {
    ...db,
    admin: {
      ...db.admin,
      courseDrafts: drafts,
    },
  };

  await writeDb(nextState);
  const updated = drafts.find((draft) => draft.id === draftId);
  res.json(updated ?? { message: 'not found' });
});

app.post('/api/admin/sync', async (_req, res) => {
  const db = await readDb();
  const now = new Date().toISOString();
  const nextState = {
    ...db,
    admin: {
      ...db.admin,
      lastSyncAt: now,
    },
  };
  await writeDb(nextState);
  res.json({ lastSyncAt: now });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
