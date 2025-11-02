import express from 'express';
import cors from 'cors';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { nanoid } from 'nanoid';
import { initDatabase, runQuery, closePool } from './database.js';
import { parseJson, sanitizeText, stringifyJson, statAccents } from './utils.js';

dayjs.extend(duration);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const mapPracticeSet = (row) => ({
  id: row.id,
  name: row.name,
  questions: Number(row.question_count ?? 0),
  accuracy: row.last_accuracy ? Number(row.last_accuracy) : 0,
  lastAttempt: row.last_attempt_at ? new Date(row.last_attempt_at).toISOString() : null,
  focus: row.focus ?? undefined,
  difficulty: row.difficulty ?? undefined,
  duration: row.duration_minutes ?? undefined,
  source: row.source ?? undefined,
  latestScore: row.last_score ?? null,
  latestSummary: row.last_summary ?? '',
});

const mapScheduleItem = (row) => ({
  id: row.id,
  title: row.title,
  type: row.event_type,
  start: new Date(row.start_time).toISOString(),
  end: new Date(row.end_time).toISOString(),
  location: row.location ?? undefined,
  focus: row.focus ?? undefined,
  tags: parseJson(row.tags_json, []),
  createdAt: row.created_at ? new Date(row.created_at).toISOString() : undefined,
});

const mapCourse = (row) => ({
  id: row.id,
  title: row.name,
  category: row.category,
  teacher: row.teacher,
  progress: Number(row.progress ?? 0),
  nextTask: row.summary?.slice(0, 40) ?? '',
  status: row.status,
  majorName: row.majorName ?? '',
  releaseWindow: row.release_window ?? '',
});

const mapMaterial = (row) => ({
  id: row.id,
  title: row.title,
  type: row.material_type,
  url: row.url,
  description: row.description ?? '',
  courseId: row.course_id,
  courseName: row.courseName ?? '',
  createdAt: row.created_at ? new Date(row.created_at).toISOString() : undefined,
});

const generateAdaptiveQuestions = (setId, focus) => {
  const topic = focus?.split(/[、，,]/)[0] ?? '目标知识点';
  const base = [
    {
      type: 'single',
      stem: `【单选】针对 ${topic} 的核心考点，下列说法正确的是？`,
      options: ['需要记忆公式并理解推导过程', '只要背诵结论，无需理解证明', '完全可以通过刷题跳过概念梳理', '以上选项均不对'],
      correct: [0],
      explanation: '核心考点需要理解推导与应用场景，才能在变形题中灵活运用。',
      knowledge: topic,
    },
    {
      type: 'multiple',
      stem: `【多选】在复习 ${topic} 时，以下哪些策略有助于巩固薄弱点？`,
      options: ['整理错题，记录出错原因', '将概念与历年真题建立映射', '忽略解析直接记答案', '结合时间轴安排复习节奏'],
      correct: [0, 1, 3],
      explanation: '系统梳理错题、构建知识图谱并结合时间管理有助于巩固薄弱知识点。',
      knowledge: topic,
    },
    {
      type: 'single',
      stem: '【单选】AI 自适应训练推荐题目的依据不包括以下哪项？',
      options: ['最近一次练习的错误率', '知识图谱掌握度', '个人资料中的专业方向', '好友的练习记录'],
      correct: [3],
      explanation: '推荐题目基于个人数据和知识掌握情况，不会参考他人的练习记录。',
      knowledge: '自适应训练原理',
    },
    {
      type: 'multiple',
      stem: '【多选】完成专项训练后，系统会自动生成哪些内容帮助复盘？',
      options: ['错题知识点图谱', '备考日程调整建议', '随机推送的无关资料', '自测报告与巩固建议'],
      correct: [0, 1, 3],
      explanation: '训练结束后会生成错题图谱、日程提醒与个性化报告，帮助复盘与跟进。',
      knowledge: '智能诊断',
    },
  ];

  return base.map((item, index) => ({
    id: `${setId}_gen_${index + 1}`,
    practice_set_id: setId,
    question_type: item.type,
    stem: item.stem,
    options_json: JSON.stringify(item.options),
    correct_options: JSON.stringify(item.correct),
    explanation: item.explanation,
    knowledge_point: item.knowledge,
  }));
};

const mapForumComment = (row) => ({
  id: row.id,
  content: row.content,
  createdAt: row.created_at ? new Date(row.created_at).toISOString() : undefined,
  author: {
    id: row.author_id,
    name: row.authorName ?? '匿名用户',
    avatar: row.authorAvatar ?? (row.authorName ? row.authorName.slice(0, 1) : '友'),
  },
});

const mapForumTopic = (row) => ({
  id: row.id,
  title: row.title,
  content: row.content,
  tags: parseJson(row.tags_json, []),
  createdAt: row.created_at ? new Date(row.created_at).toISOString() : undefined,
  needsModeration: Boolean(row.needs_moderation),
  author: {
    id: row.author_id,
    name: row.authorName ?? '匿名用户',
    avatar: row.authorAvatar ?? (row.authorName ? row.authorName.slice(0, 1) : '友'),
  },
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body ?? {};
    if (!username || !password) {
      res.status(400).json({ message: '用户名和密码不能为空' });
      return;
    }

    const rows = await runQuery(
      `SELECT u.id, u.username, u.password, u.display_name, u.role, u.email, u.phone, u.organization, u.goal, u.avatar, u.bio, u.major_id, m.name AS majorName
       FROM users u
       LEFT JOIN majors m ON u.major_id = m.id
       WHERE u.username = :username
       LIMIT 1`,
      { username },
    );

    if (rows.length === 0 || rows[0].password !== password) {
      res.status(401).json({ message: '账号或密码错误' });
      return;
    }

    const user = rows[0];
    res.json({
      id: user.id,
      name: user.display_name,
      role: user.role,
      email: user.email ?? '',
      phone: user.phone ?? '',
      organization: user.organization ?? '',
      goal: user.goal ?? '',
      avatar: user.avatar ?? user.display_name.slice(0, 1),
      majorId: user.major_id ?? null,
      majorName: user.majorName ?? '',
      bio: user.bio ?? '',
    });
  } catch (error) {
    console.error('Login failed', error);
    res.status(500).json({ message: '登录失败，请稍后重试' });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const rows = await runQuery(
      `SELECT u.id, u.display_name, u.email, u.phone, u.organization, u.goal, u.avatar, u.bio, u.role, u.major_id, m.name AS majorName
       FROM users u
       LEFT JOIN majors m ON u.major_id = m.id
       WHERE u.id = :id
       LIMIT 1`,
      { id: req.params.id },
    );

    if (rows.length === 0) {
      res.status(404).json({ message: '未找到该用户' });
      return;
    }

    const profile = rows[0];
    res.json({
      id: profile.id,
      name: profile.display_name,
      role: profile.role,
      email: profile.email ?? '',
      phone: profile.phone ?? '',
      organization: profile.organization ?? '',
      goal: profile.goal ?? '',
      avatar: profile.avatar ?? profile.display_name.slice(0, 1),
      bio: profile.bio ?? '',
      majorId: profile.major_id ?? null,
      majorName: profile.majorName ?? '',
    });
  } catch (error) {
    console.error('Fetch profile failed', error);
    res.status(500).json({ message: '获取用户信息失败' });
  }
});

app.patch('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, organization, goal, avatar, bio, majorId } = req.body ?? {};

    const fields = [];
    const params = { id };

    if (typeof name === 'string') {
      fields.push('display_name = :display_name');
      params.display_name = sanitizeText(name);
    }
    if (typeof email === 'string') {
      fields.push('email = :email');
      params.email = email.trim();
    }
    if (typeof phone === 'string') {
      fields.push('phone = :phone');
      params.phone = phone.trim();
    }
    if (typeof organization === 'string') {
      fields.push('organization = :organization');
      params.organization = sanitizeText(organization);
    }
    if (typeof goal === 'string') {
      fields.push('goal = :goal');
      params.goal = sanitizeText(goal);
    }
    if (typeof avatar === 'string') {
      fields.push('avatar = :avatar');
      params.avatar = sanitizeText(avatar.slice(0, 2));
    }
    if (typeof bio === 'string') {
      fields.push('bio = :bio');
      params.bio = sanitizeText(bio);
    }
    if (typeof majorId === 'string' && majorId) {
      fields.push('major_id = :major_id');
      params.major_id = majorId;
    }

    if (fields.length === 0) {
      res.status(400).json({ message: '未提供可更新的字段' });
      return;
    }

    await runQuery(
      `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = :id`,
      params,
    );

    const updated = await runQuery(
      `SELECT u.id, u.display_name, u.email, u.phone, u.organization, u.goal, u.avatar, u.bio, u.major_id, m.name AS majorName, u.role
       FROM users u
       LEFT JOIN majors m ON u.major_id = m.id
       WHERE u.id = :id`,
      { id },
    );

    const profile = updated[0];
    res.json({
      id: profile.id,
      name: profile.display_name,
      role: profile.role,
      email: profile.email ?? '',
      phone: profile.phone ?? '',
      organization: profile.organization ?? '',
      goal: profile.goal ?? '',
      avatar: profile.avatar ?? profile.display_name.slice(0, 1),
      bio: profile.bio ?? '',
      majorId: profile.major_id ?? null,
      majorName: profile.majorName ?? '',
    });
  } catch (error) {
    console.error('Update profile failed', error);
    res.status(500).json({ message: '更新用户信息失败' });
  }
});

app.get('/api/majors', async (_req, res) => {
  try {
    const majors = await runQuery('SELECT id, name, description FROM majors ORDER BY name ASC');
    res.json(majors);
  } catch (error) {
    console.error('Fetch majors failed', error);
    res.status(500).json({ message: '获取专业列表失败' });
  }
});

app.post('/api/majors', async (req, res) => {
  try {
    const { name, description } = req.body ?? {};
    if (!name) {
      res.status(400).json({ message: '专业名称不能为空' });
      return;
    }
    const id = `major_${nanoid(8)}`;
    await runQuery(
      `INSERT INTO majors (id, name, description) VALUES (:id, :name, :description)`,
      { id, name: sanitizeText(name), description: sanitizeText(description ?? '') },
    );
    res.status(201).json({ id, name: sanitizeText(name), description: sanitizeText(description ?? '') });
  } catch (error) {
    console.error('Create major failed', error);
    res.status(500).json({ message: '新增专业失败' });
  }
});

app.get('/api/courses', async (req, res) => {
  try {
    const { majorId, status } = req.query;
    const conditions = [];
    const params = {};

    if (typeof majorId === 'string' && majorId) {
      conditions.push('(c.major_id = :majorId OR c.category = "公共课")');
      params.majorId = majorId;
    }
    if (typeof status === 'string' && status) {
      conditions.push('c.status = :status');
      params.status = status;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const courses = await runQuery(
      `SELECT c.*, m.name AS majorName FROM courses c LEFT JOIN majors m ON c.major_id = m.id ${where} ORDER BY c.updated_at DESC`,
      params,
    );
    res.json(courses.map(mapCourse));
  } catch (error) {
    console.error('Fetch courses failed', error);
    res.status(500).json({ message: '获取课程信息失败' });
  }
});

app.post('/api/admin/courses', async (req, res) => {
  try {
    const { name, category, teacher, majorId, releaseWindow, summary } = req.body ?? {};
    if (!name || !category || !teacher) {
      res.status(400).json({ message: '课程名称、分类和讲师为必填项' });
      return;
    }
    const id = `course_${nanoid(8)}`;
    await runQuery(
      `INSERT INTO courses (id, major_id, name, category, teacher, credit, progress, status, summary, schedule_info, release_window)
       VALUES (:id, :major_id, :name, :category, :teacher, :credit, :progress, :status, :summary, :schedule_info, :release_window)`,
      {
        id,
        major_id: majorId ?? null,
        name: sanitizeText(name),
        category,
        teacher: sanitizeText(teacher),
        credit: 0,
        progress: 0,
        status: 'draft',
        summary: sanitizeText(summary ?? ''),
        schedule_info: '待排期',
        release_window: releaseWindow ?? '待排期',
      },
    );
    const created = await runQuery(
      `SELECT c.*, m.name AS majorName FROM courses c LEFT JOIN majors m ON c.major_id = m.id WHERE c.id = :id`,
      { id },
    );
    res.status(201).json(mapCourse(created[0]));
  } catch (error) {
    console.error('Create course failed', error);
    res.status(500).json({ message: '新增课程失败' });
  }
});

app.post('/api/admin/courses/:id/publish', async (req, res) => {
  try {
    const { id } = req.params;
    await runQuery(
      `UPDATE courses SET status = 'published', progress = GREATEST(progress, 35), updated_at = CURRENT_TIMESTAMP WHERE id = :id`,
      { id },
    );
    const rows = await runQuery(
      `SELECT c.*, m.name AS majorName FROM courses c LEFT JOIN majors m ON c.major_id = m.id WHERE c.id = :id`,
      { id },
    );
    if (rows.length === 0) {
      res.status(404).json({ message: '课程不存在' });
      return;
    }
    res.json(mapCourse(rows[0]));
  } catch (error) {
    console.error('Publish course failed', error);
    res.status(500).json({ message: '发布课程失败' });
  }
});

app.get('/api/materials', async (req, res) => {
  try {
    const { courseId } = req.query;
    const params = {};
    let where = '';
    if (typeof courseId === 'string' && courseId) {
      where = 'WHERE m.course_id = :courseId';
      params.courseId = courseId;
    }
    const materials = await runQuery(
      `SELECT m.*, c.name AS courseName FROM materials m LEFT JOIN courses c ON m.course_id = c.id ${where} ORDER BY m.created_at DESC`,
      params,
    );
    res.json(materials.map(mapMaterial));
  } catch (error) {
    console.error('Fetch materials failed', error);
    res.status(500).json({ message: '获取资料失败' });
  }
});

app.post('/api/materials', async (req, res) => {
  try {
    const { courseId, title, type, url, description } = req.body ?? {};
    if (!courseId || !title || !type) {
      res.status(400).json({ message: '课程、标题和类型为必填项' });
      return;
    }
    const id = `material_${nanoid(8)}`;
    await runQuery(
      `INSERT INTO materials (id, course_id, title, material_type, url, description)
       VALUES (:id, :course_id, :title, :material_type, :url, :description)`,
      {
        id,
        course_id: courseId,
        title: sanitizeText(title),
        material_type: type,
        url: url ?? '',
        description: sanitizeText(description ?? ''),
      },
    );
    const [material] = await runQuery(
      `SELECT m.*, c.name AS courseName FROM materials m LEFT JOIN courses c ON m.course_id = c.id WHERE m.id = :id`,
      { id },
    );
    res.status(201).json(mapMaterial(material));
  } catch (error) {
    console.error('Create material failed', error);
    res.status(500).json({ message: '新增资料失败' });
  }
});
app.get('/api/practice', async (req, res) => {
  try {
    const { userId } = req.query;
    if (typeof userId !== 'string' || !userId) {
      res.status(400).json({ message: '需要提供 userId' });
      return;
    }
    const sets = await runQuery(
      `SELECT * FROM practice_sets WHERE owner_id = :userId ORDER BY COALESCE(last_attempt_at, created_at) DESC`,
      { userId },
    );
    res.json(sets.map(mapPracticeSet));
  } catch (error) {
    console.error('Fetch practice sets failed', error);
    res.status(500).json({ message: '获取专项训练失败' });
  }
});

app.post('/api/practice', async (req, res) => {
  try {
    const { userId, name, focus, difficulty, duration } = req.body ?? {};
    if (!userId || !name) {
      res.status(400).json({ message: '需提供 userId 与训练名称' });
      return;
    }
    const id = `practice_${nanoid(10)}`;
    await runQuery(
      `INSERT INTO practice_sets (id, owner_id, name, focus, difficulty, duration_minutes, question_count, last_summary, source)
       VALUES (:id, :owner_id, :name, :focus, :difficulty, :duration, :question_count, :last_summary, :source)`,
      {
        id,
        owner_id: userId,
        name: sanitizeText(name),
        focus: sanitizeText(focus ?? ''),
        difficulty: difficulty ?? '进阶',
        duration: Number(duration) || 45,
        question_count: 0,
        last_summary: '系统已生成适配题目，等待首次训练。',
        source: '自定义',
      },
    );

    const generated = generateAdaptiveQuestions(id, focus);
    for (const question of generated) {
      await runQuery(
        `INSERT INTO practice_questions (id, practice_set_id, question_type, stem, options_json, correct_options, explanation, knowledge_point)
         VALUES (:id, :practice_set_id, :question_type, :stem, :options_json, :correct_options, :explanation, :knowledge_point)`,
        question,
      );
    }

    await runQuery(
      `UPDATE practice_sets SET question_count = (SELECT COUNT(*) FROM practice_questions WHERE practice_set_id = :id) WHERE id = :id`,
      { id },
    );

    const [created] = await runQuery(`SELECT * FROM practice_sets WHERE id = :id`, { id });
    res.status(201).json(mapPracticeSet(created));
  } catch (error) {
    console.error('Create practice failed', error);
    res.status(500).json({ message: '创建专项训练失败' });
  }
});

app.get('/api/practice/:id/questions', async (req, res) => {
  try {
    const questions = await runQuery(
      `SELECT * FROM practice_questions WHERE practice_set_id = :id ORDER BY created_at ASC`,
      { id: req.params.id },
    );
    res.json(
      questions.map((row) => ({
        id: row.id,
        practiceSetId: row.practice_set_id,
        questionType: row.question_type,
        stem: row.stem,
        options: parseJson(row.options_json, []),
        correctOptions: parseJson(row.correct_options, []),
        explanation: row.explanation ?? '',
        knowledgePoint: row.knowledge_point ?? '',
      })),
    );
  } catch (error) {
    console.error('Fetch practice questions failed', error);
    res.status(500).json({ message: '获取题目失败' });
  }
});

app.post('/api/practice/:id/attempt', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, answers } = req.body ?? {};
    if (!userId || !Array.isArray(answers)) {
      res.status(400).json({ message: '需要提供 userId 与答题记录' });
      return;
    }

    const questions = await runQuery(
      `SELECT id, correct_options FROM practice_questions WHERE practice_set_id = :id`,
      { id },
    );
    if (questions.length === 0) {
      res.status(404).json({ message: '题目不存在' });
      return;
    }

    const answerMap = new Map();
    answers.forEach((item) => {
      if (item && item.questionId) {
        answerMap.set(String(item.questionId), Array.isArray(item.selected) ? item.selected.map(Number) : []);
      }
    });

    let correctCount = 0;
    const detail = questions.map((question) => {
      const correctOptions = parseJson(question.correct_options, []);
      const selected = answerMap.get(question.id) ?? [];
      const normalizedSelected = selected.map(Number).sort();
      const normalizedCorrect = correctOptions.map(Number).sort();
      const isCorrect =
        normalizedSelected.length === normalizedCorrect.length &&
        normalizedSelected.every((value, index) => value === normalizedCorrect[index]);
      if (isCorrect) {
        correctCount += 1;
      }
      return { questionId: question.id, selected: normalizedSelected, correct: normalizedCorrect, isCorrect };
    });

    const accuracy = Number((correctCount / questions.length).toFixed(2));
    const score = Math.round(accuracy * 100);
    const attemptId = `attempt_${nanoid(10)}`;
    const summary = `本次共 ${questions.length} 题，正确 ${correctCount} 题，正确率 ${(accuracy * 100).toFixed(0)}%。`;

    await runQuery(
      `INSERT INTO practice_attempts (id, practice_set_id, user_id, accuracy, score, answers_json, summary)
       VALUES (:id, :practice_set_id, :user_id, :accuracy, :score, :answers_json, :summary)` ,
      {
        id: attemptId,
        practice_set_id: id,
        user_id: userId,
        accuracy,
        score,
        answers_json: JSON.stringify(detail),
        summary,
      },
    );

    await runQuery(
      `UPDATE practice_sets
       SET last_attempt_at = CURRENT_TIMESTAMP,
           last_accuracy = :accuracy,
           last_score = :score,
           last_summary = :summary
       WHERE id = :id`,
      { id, accuracy, score, summary },
    );

    res.status(201).json({ attemptId, accuracy, score, summary, detail });
  } catch (error) {
    console.error('Submit attempt failed', error);
    res.status(500).json({ message: '提交答题记录失败' });
  }
});

app.get('/api/schedule', async (req, res) => {
  try {
    const { userId } = req.query;
    if (typeof userId !== 'string' || !userId) {
      res.status(400).json({ message: '需要提供 userId' });
      return;
    }
    const events = await runQuery(
      `SELECT * FROM schedule_events WHERE user_id = :userId ORDER BY start_time ASC`,
      { userId },
    );
    res.json(events.map(mapScheduleItem));
  } catch (error) {
    console.error('Fetch schedule failed', error);
    res.status(500).json({ message: '获取学习日程失败' });
  }
});

app.post('/api/schedule', async (req, res) => {
  try {
    const { userId, title, type, start, end, location, focus, tags } = req.body ?? {};
    if (!userId || !title || !type || !start || !end) {
      res.status(400).json({ message: '缺少必要字段' });
      return;
    }
    const id = `schedule_${nanoid(10)}`;
    await runQuery(
      `INSERT INTO schedule_events (id, user_id, title, event_type, start_time, end_time, location, focus, tags_json)
       VALUES (:id, :user_id, :title, :event_type, :start_time, :end_time, :location, :focus, :tags_json)`,
      {
        id,
        user_id: userId,
        title: sanitizeText(title),
        event_type: type,
        start_time: new Date(start),
        end_time: new Date(end),
        location: sanitizeText(location ?? ''),
        focus: sanitizeText(focus ?? ''),
        tags_json: stringifyJson(Array.isArray(tags) ? tags : []),
      },
    );
    const [created] = await runQuery(`SELECT * FROM schedule_events WHERE id = :id`, { id });
    res.status(201).json(mapScheduleItem(created));
  } catch (error) {
    console.error('Create schedule failed', error);
    res.status(500).json({ message: '创建日程失败' });
  }
});
app.get('/api/forum/topics', async (req, res) => {
  try {
    const { userId } = req.query;
    const topics = await runQuery(
      `SELECT t.*, u.display_name AS authorName, u.avatar AS authorAvatar
       FROM forum_topics t
       LEFT JOIN users u ON t.author_id = u.id
       ORDER BY t.created_at DESC
       LIMIT 50`,
    );

    const payload = [];
    for (const topic of topics) {
      const comments = await runQuery(
        `SELECT c.*, u.display_name AS authorName, u.avatar AS authorAvatar
         FROM forum_comments c
         LEFT JOIN users u ON c.author_id = u.id
         WHERE c.topic_id = :topicId
         ORDER BY c.created_at ASC`,
        { topicId: topic.id },
      );
      const [{ totalLikes = 0 } = { totalLikes: 0 }] = await runQuery(
        `SELECT COUNT(*) AS totalLikes FROM forum_likes WHERE topic_id = :topicId`,
        { topicId: topic.id },
      );
      let likedByUser = false;
      if (typeof userId === 'string' && userId) {
        const likedRows = await runQuery(
          `SELECT 1 FROM forum_likes WHERE topic_id = :topicId AND user_id = :userId LIMIT 1`,
          { topicId: topic.id, userId },
        );
        likedByUser = likedRows.length > 0;
      }
      payload.push({
        ...mapForumTopic(topic),
        likes: Number(totalLikes),
        likedByUser,
        comments: comments.map(mapForumComment),
      });
    }

    res.json(payload);
  } catch (error) {
    console.error('Fetch forum topics failed', error);
    res.status(500).json({ message: '获取论坛动态失败' });
  }
});

app.post('/api/forum/topics', async (req, res) => {
  try {
    const { authorId, title, content, tags } = req.body ?? {};
    if (!authorId || !title || !content) {
      res.status(400).json({ message: '缺少必要字段' });
      return;
    }
    const id = `topic_${nanoid(10)}`;
    await runQuery(
      `INSERT INTO forum_topics (id, author_id, title, content, tags_json, needs_moderation)
       VALUES (:id, :author_id, :title, :content, :tags_json, :needs_moderation)`,
      {
        id,
        author_id: authorId,
        title: sanitizeText(title),
        content: sanitizeText(content),
        tags_json: stringifyJson(Array.isArray(tags) ? tags.map(sanitizeText) : []),
        needs_moderation: 0,
      },
    );
    const [created] = await runQuery(
      `SELECT t.*, u.display_name AS authorName, u.avatar AS authorAvatar
       FROM forum_topics t LEFT JOIN users u ON t.author_id = u.id WHERE t.id = :id`,
      { id },
    );
    res.status(201).json({ ...mapForumTopic(created), likes: 0, likedByUser: false, comments: [] });
  } catch (error) {
    console.error('Create forum topic failed', error);
    res.status(500).json({ message: '发帖失败' });
  }
});

app.post('/api/forum/topics/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { authorId, content } = req.body ?? {};
    if (!authorId || !content) {
      res.status(400).json({ message: '缺少必要字段' });
      return;
    }
    const commentId = `comment_${nanoid(10)}`;
    await runQuery(
      `INSERT INTO forum_comments (id, topic_id, author_id, content)
       VALUES (:id, :topic_id, :author_id, :content)`,
      { id: commentId, topic_id: id, author_id: authorId, content: sanitizeText(content) },
    );
    const [comment] = await runQuery(
      `SELECT c.*, u.display_name AS authorName, u.avatar AS authorAvatar
       FROM forum_comments c LEFT JOIN users u ON c.author_id = u.id WHERE c.id = :id`,
      { id: commentId },
    );
    res.status(201).json(mapForumComment(comment));
  } catch (error) {
    console.error('Create forum comment failed', error);
    res.status(500).json({ message: '发表评论失败' });
  }
});

app.post('/api/forum/topics/:id/likes', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body ?? {};
    if (!userId) {
      res.status(400).json({ message: '缺少 userId' });
      return;
    }
    const existing = await runQuery(
      `SELECT 1 FROM forum_likes WHERE topic_id = :topicId AND user_id = :userId LIMIT 1`,
      { topicId: id, userId },
    );
    if (existing.length > 0) {
      await runQuery(
        `DELETE FROM forum_likes WHERE topic_id = :topicId AND user_id = :userId`,
        { topicId: id, userId },
      );
      const [{ totalLikes = 0 } = { totalLikes: 0 }] = await runQuery(
        `SELECT COUNT(*) AS totalLikes FROM forum_likes WHERE topic_id = :topicId`,
        { topicId: id },
      );
      res.json({ likes: Number(totalLikes), likedByUser: false });
      return;
    }
    await runQuery(
      `INSERT INTO forum_likes (topic_id, user_id) VALUES (:topicId, :userId)`,
      { topicId: id, userId },
    );
    const [{ totalLikes = 0 } = { totalLikes: 0 }] = await runQuery(
      `SELECT COUNT(*) AS totalLikes FROM forum_likes WHERE topic_id = :topicId`,
      { topicId: id },
    );
    res.json({ likes: Number(totalLikes), likedByUser: true });
  } catch (error) {
    console.error('Toggle like failed', error);
    res.status(500).json({ message: '点赞失败' });
  }
});
app.get('/api/dashboard', async (req, res) => {
  try {
    const { userId, role } = req.query;
    if (typeof userId !== 'string' || !userId) {
      res.status(400).json({ message: '需要提供 userId' });
      return;
    }

    const users = await runQuery(
      `SELECT u.id, u.display_name, u.role, u.major_id, u.goal, u.organization
       FROM users u WHERE u.id = :userId LIMIT 1`,
      { userId },
    );
    if (users.length === 0) {
      res.status(404).json({ message: '未找到用户' });
      return;
    }

    const currentUser = users[0];
    const resolvedRole = (role ?? currentUser.role) === 'admin' ? 'admin' : currentUser.role;

    if (resolvedRole === 'admin') {
      const [{ totalStudents = 0 } = { totalStudents: 0 }] = await runQuery(
        'SELECT COUNT(*) AS totalStudents FROM users WHERE role = "student"',
      );
      const [{ newStudents = 0 } = { newStudents: 0 }] = await runQuery(
        'SELECT COUNT(*) AS newStudents FROM users WHERE role = "student" AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)',
      );
      const [{ totalMajors = 0 } = { totalMajors: 0 }] = await runQuery(
        'SELECT COUNT(*) AS totalMajors FROM majors',
      );
      const [{ totalMaterials = 0 } = { totalMaterials: 0 }] = await runQuery(
        'SELECT COUNT(*) AS totalMaterials FROM materials',
      );
      const [{ pendingCourses = 0 } = { pendingCourses: 0 }] = await runQuery(
        'SELECT COUNT(*) AS pendingCourses FROM courses WHERE status <> "published"',
      );
      const [{ activeTopics = 0 } = { activeTopics: 0 }] = await runQuery(
        'SELECT COUNT(*) AS activeTopics FROM forum_topics',
      );
      const [{ practiceTotal = 0 } = { practiceTotal: 0 }] = await runQuery(
        'SELECT COUNT(*) AS practiceTotal FROM practice_sets',
      );

      const courses = await runQuery(
        `SELECT c.*, m.name AS majorName FROM courses c LEFT JOIN majors m ON c.major_id = m.id ORDER BY c.updated_at DESC LIMIT 6`,
      );
      const schedule = await runQuery(
        `SELECT * FROM schedule_events WHERE user_id = :userId ORDER BY start_time ASC LIMIT 10`,
        { userId },
      );
      const courseDrafts = await runQuery(
        `SELECT c.*, m.name AS majorName FROM courses c LEFT JOIN majors m ON c.major_id = m.id WHERE c.status <> 'published' ORDER BY c.updated_at DESC`,
      );
      const reviewQueue = await runQuery(
        `SELECT id, title, content, created_at FROM forum_topics WHERE needs_moderation = 1 ORDER BY created_at DESC`,
      );
      const recentRegistrations = await runQuery(
        `SELECT u.id, u.display_name, u.created_at, m.name AS majorName
         FROM users u LEFT JOIN majors m ON u.major_id = m.id
         WHERE u.role = 'student' ORDER BY u.created_at DESC LIMIT 6`,
      );

      const adminStats = [
        {
          id: 'studyTime',
          title: '活跃学员',
          value: `${totalStudents} 人`,
          helperText: `近 7 天新增 ${newStudents} 人`,
          accent: statAccents.studyTime,
        },
        {
          id: 'questionDrill',
          title: '待审核课程',
          value: `${pendingCourses} 门`,
          helperText: '覆盖冲刺班与题库更新',
          accent: statAccents.questionDrill,
        },
        {
          id: 'courseFocus',
          title: '资料总量',
          value: `${totalMaterials} 份`,
          helperText: '含讲义、题单与模考',
          accent: statAccents.courseFocus,
        },
        {
          id: 'mockRank',
          title: '论坛活跃话题',
          value: `${activeTopics} 条`,
          helperText: '实时关注学员反馈',
          accent: statAccents.mockRank,
        },
      ];

      res.json({
        role: 'admin',
        userName: currentUser.display_name,
        stats: adminStats,
        courses: courses.map(mapCourse),
        practiceSets: [],
        schedule: schedule.map(mapScheduleItem),
        recommendation: '已为你同步教研进度、论坛反馈和课程排期。',
        adminFocus: {
          courseDrafts: courseDrafts.map((course) => ({
            id: course.id,
            name: course.name,
            teacher: course.teacher,
            status: course.status,
            releaseWindow: course.release_window ?? '',
            updatedAt: course.updated_at ? new Date(course.updated_at).toISOString() : undefined,
            majorName: course.majorName ?? '',
          })),
          reviewQueue: reviewQueue.map((item) => ({
            id: item.id,
            title: item.title,
            content: item.content,
            createdAt: item.created_at ? new Date(item.created_at).toISOString() : undefined,
          })),
          recentRegistrations: recentRegistrations.map((item) => ({
            id: item.id,
            name: item.display_name,
            majorName: item.majorName ?? '',
            createdAt: item.created_at ? new Date(item.created_at).toISOString() : undefined,
          })),
          dataQuality: {
            majors: Number(totalMajors),
            practiceSets: Number(practiceTotal),
            forumTopics: Number(activeTopics),
          },
        },
      });
      return;
    }

    const practiceSets = await runQuery(
      `SELECT * FROM practice_sets WHERE owner_id = :userId ORDER BY COALESCE(last_attempt_at, created_at) DESC`,
      { userId },
    );
    const schedule = await runQuery(
      `SELECT * FROM schedule_events WHERE user_id = :userId ORDER BY start_time ASC`,
      { userId },
    );
    const courses = await runQuery(
      `SELECT c.*, m.name AS majorName
       FROM courses c LEFT JOIN majors m ON c.major_id = m.id
       WHERE c.category = '公共课' OR c.major_id = :majorId
       ORDER BY c.progress DESC
       LIMIT 6`,
      { majorId: currentUser.major_id },
    );
    const attempts = await runQuery(
      `SELECT accuracy, created_at, answers_json FROM practice_attempts WHERE user_id = :userId ORDER BY created_at DESC LIMIT 8`,
      { userId },
    );
    const overviewRows = await runQuery(
      `SELECT mock_trend, time_distribution FROM analytics_overview WHERE user_id = :userId LIMIT 1`,
      { userId },
    );

    const recentMinutes = schedule
      .filter((item) => dayjs(item.start_time).isAfter(dayjs().subtract(7, 'day')))
      .reduce((total, item) => total + dayjs(item.end_time).diff(dayjs(item.start_time), 'minute'), 0);
    const totalQuestions = attempts.reduce((total, attempt) => {
      const answers = parseJson(attempt.answers_json, []);
      return total + (Array.isArray(answers) ? answers.length : 0);
    }, 0);
    const latestAttempt = attempts[0];

    const stats = [
      {
        id: 'studyTime',
        title: '本周学习时长',
        value: `${(recentMinutes / 60).toFixed(1)} 小时`,
        helperText: `近 7 天共安排 ${schedule.length} 场学习任务`,
        accent: statAccents.studyTime,
      },
      {
        id: 'questionDrill',
        title: '近期刷题量',
        value: `${totalQuestions} 题`,
        helperText: latestAttempt ? `最新正确率 ${(Number(latestAttempt.accuracy) * 100).toFixed(0)}%` : '等待首次专项训练',
        accent: statAccents.questionDrill,
      },
      {
        id: 'courseFocus',
        title: '重点课程',
        value: `${courses.length} 门`,
        helperText: currentUser.organization ? `目标：${currentUser.organization}` : '来自公共课与专业课推荐',
        accent: statAccents.courseFocus,
      },
      {
        id: 'mockRank',
        title: '冲刺建议',
        value: 'TOP 12%',
        helperText: '保持冲刺节奏，持续巩固弱项',
        accent: statAccents.mockRank,
      },
    ];

    const recommendationBase = overviewRows[0]?.mock_trend ?? '';
    const recommendationTime = overviewRows[0]?.time_distribution ?? '';
    const recommendation = recommendationBase
      ? `${recommendationBase} ${recommendationTime}`
      : '结合你的训练记录，建议重点复习薄弱知识点并保持日程执行率。';

    res.json({
      role: 'student',
      userName: currentUser.display_name,
      stats,
      courses: courses.map(mapCourse),
      practiceSets: practiceSets.map(mapPracticeSet),
      schedule: schedule.slice(0, 8).map(mapScheduleItem),
      recommendation,
    });
  } catch (error) {
    console.error('Fetch dashboard failed', error);
    res.status(500).json({ message: '获取看板数据失败' });
  }
});

app.get('/api/admin/overview', async (_req, res) => {
  try {
    const [{ totalStudents = 0 } = { totalStudents: 0 }] = await runQuery(
      'SELECT COUNT(*) AS totalStudents FROM users WHERE role = "student"',
    );
    const majors = await runQuery('SELECT id, name FROM majors ORDER BY name ASC');
    const courses = await runQuery(
      `SELECT c.*, m.name AS majorName FROM courses c LEFT JOIN majors m ON c.major_id = m.id ORDER BY c.updated_at DESC`,
    );
    const materials = await runQuery(
      `SELECT m.*, c.name AS courseName FROM materials m LEFT JOIN courses c ON m.course_id = c.id ORDER BY m.created_at DESC`,
    );
    const forum = await runQuery(
      `SELECT t.id, t.title, t.needs_moderation, t.created_at, COUNT(c.id) AS commentCount
       FROM forum_topics t LEFT JOIN forum_comments c ON t.id = c.topic_id
       GROUP BY t.id, t.title, t.needs_moderation, t.created_at
       ORDER BY t.created_at DESC`,
    );

    const usersList = await runQuery(
      `SELECT u.id, u.display_name, u.role, u.email, u.phone, u.created_at, m.name AS majorName
       FROM users u LEFT JOIN majors m ON u.major_id = m.id
       ORDER BY u.created_at DESC LIMIT 20`,
    );

    const courseList = courses.map(mapCourse);
    const draftList = courseList.filter((course) => course.status !== 'published');

    res.json({
      totals: {
        students: Number(totalStudents),
        majors: majors.length,
        courses: courseList.length,
        materials: materials.length,
        forumTopics: forum.length,
      },
      majors,
      courses: courseList,
      courseDrafts: draftList,
      materials: materials.map(mapMaterial),
      forum: forum.map((topic) => ({
        id: topic.id,
        title: topic.title,
        needsModeration: Boolean(topic.needs_moderation),
        commentCount: Number(topic.commentCount ?? 0),
        createdAt: topic.created_at ? new Date(topic.created_at).toISOString() : undefined,
      })),
      users: usersList.map((user) => ({
        id: user.id,
        name: user.display_name,
        role: user.role,
        email: user.email ?? '',
        phone: user.phone ?? '',
        majorName: user.majorName ?? '',
        createdAt: user.created_at ? new Date(user.created_at).toISOString() : undefined,
      })),
    });
  } catch (error) {
    console.error('Fetch admin overview failed', error);
    res.status(500).json({ message: '获取管理概览失败' });
  }
});

app.get('/api/analytics', async (req, res) => {
  try {
    const { userId } = req.query;
    if (typeof userId !== 'string' || !userId) {
      res.status(400).json({ message: '需要提供 userId' });
      return;
    }
    const overviewRows = await runQuery(
      `SELECT mock_trend, time_distribution, behavior_insight FROM analytics_overview WHERE user_id = :userId LIMIT 1`,
      { userId },
    );
    const subjects = await runQuery(
      `SELECT subject, mastery, trend, focus FROM subject_mastery WHERE user_id = :userId ORDER BY subject ASC`,
      { userId },
    );
    const weakTopics = await runQuery(
      `SELECT topic, error_rate, suggestion FROM weak_topics WHERE user_id = :userId`,
      { userId },
    );

    const overview = overviewRows[0] ?? {};
    res.json({
      summaryCards: [
        {
          id: 'mockTrend',
          title: '模考趋势',
          description: overview.mock_trend ?? '暂未同步模考数据。',
        },
        {
          id: 'timeDistribution',
          title: '时间分配',
          description: overview.time_distribution ?? '请保持稳定的学习节奏。',
        },
        {
          id: 'behavior',
          title: '学习行为',
          description: overview.behavior_insight ?? '完善学习记录即可获得行为分析。',
        },
      ],
      subjectStats: subjects.map((item) => ({
        subject: item.subject,
        mastery: Number(item.mastery ?? 0),
        trend: item.trend ?? '',
        focus: item.focus ?? '',
      })),
      weakTopics: weakTopics.map((item) => ({
        topic: item.topic,
        errorRate: item.error_rate ?? '',
        suggestion: item.suggestion ?? '',
      })),
    });
  } catch (error) {
    console.error('Fetch analytics failed', error);
    res.status(500).json({ message: '获取学习分析失败' });
  }
});
const startServer = async () => {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('启动服务失败', error);
    process.exit(1);
  }
};

startServer();

const gracefulShutdown = async () => {
  try {
    await closePool();
  } finally {
    process.exit(0);
  }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

export default app;
