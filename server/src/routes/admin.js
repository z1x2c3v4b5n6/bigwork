import { Router } from 'express';
import { ensureAdmin } from '../middleware/auth.js';
import { query } from '../config/database.js';
import { toMySQLDateTime } from '../utils/datetime.js';

const router = Router();

router.use(ensureAdmin);

router.get('/dashboard', async (req, res, next) => {
  try {
    const [activeStudentsRows, tasksRows, followUpsRows, alertsRows, progressRows, auditRows, adminRows, securityRows] =
      await Promise.all([
        query("SELECT COUNT(*) AS activeStudents FROM users WHERE role = 'student'"),
        query(
          "SELECT COUNT(*) AS tasksCompletedToday FROM study_tasks WHERE completed = 1 AND DATE(completed_at) = CURRENT_DATE()",
        ),
        query("SELECT COUNT(*) AS followUpsPending FROM follow_up_tasks WHERE status = 'pending'"),
        query("SELECT COUNT(*) AS systemAlerts FROM system_alerts WHERE resolved = 0"),
        query(
          'SELECT sp.id, u.display_name AS name, sp.target_university AS university, sp.weekly_study_hours AS studyHours, sp.completion_rate AS completion\n           FROM student_progress sp\n           LEFT JOIN users u ON u.id = sp.user_id\n           ORDER BY sp.updated_at DESC\n           LIMIT 10',
        ),
        query(
          'SELECT id, action AS title, detail AS description, actor_name AS actor, created_at\n           FROM admin_audit_logs\n           ORDER BY created_at DESC\n           LIMIT 20',
        ),
        query("SELECT display_name FROM users WHERE role = 'admin' ORDER BY display_name ASC"),
        query("SELECT value FROM site_settings WHERE `key` = 'security_note' LIMIT 1"),
      ]);

    const metrics = {
      activeStudents: Number(activeStudentsRows?.[0]?.activeStudents ?? 0),
      tasksCompletedToday: Number(tasksRows?.[0]?.tasksCompletedToday ?? 0),
      followUpsPending: Number(followUpsRows?.[0]?.followUpsPending ?? 0),
      systemAlerts: Number(alertsRows?.[0]?.systemAlerts ?? 0),
    };

    const studentProgress = progressRows.map((row) => ({
      id: row.id,
      name: row.name ?? '未命名学员',
      university: row.university ?? '未设置',
      studyHours: Number(row.studyHours ?? 0),
      completion: Number(row.completion ?? 0),
    }));

    const auditLogs = auditRows.map((row) => ({
      id: row.id,
      title: row.title ?? '未命名操作',
      description: row.description ?? '',
      createdAt: row.created_at ? toMySQLDateTime(row.created_at) : null,
      actor: row.actor ?? undefined,
    }));

    const administrators = adminRows.map((row) => row.display_name ?? '未知管理员');
    const securityNote = securityRows?.[0]?.value ?? null;

    res.json({
      metrics,
      studentProgress,
      auditLogs,
      administrators,
      securityNote: securityNote ?? undefined,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/settings', async (req, res, next) => {
  try {
    const rows = await query('SELECT `key`, value FROM site_settings ORDER BY `key`');
    const settings = rows.reduce((acc, row) => ({
      ...acc,
      [row.key]: row.value,
    }), {});

    res.json({ settings });
  } catch (error) {
    next(error);
  }
});

router.put('/settings', async (req, res, next) => {
  try {
    const { settings } = req.body ?? {};

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ message: '请提供待更新的设置项' });
    }

    const entries = Object.entries(settings);

    await Promise.all(
      entries.map(([key, value]) =>
        query(
          'INSERT INTO site_settings (`key`, value, updated_at) VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE value = VALUES(value), updated_at = NOW()',
          [key, value],
        ),
      ),
    );

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.get('/users', async (req, res, next) => {
  try {
    const users = await query(
      'SELECT id, username, display_name AS displayName, email, role, created_at, updated_at FROM users ORDER BY id DESC LIMIT 200',
    );
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

router.post('/users', async (req, res, next) => {
  try {
    const { username, password, displayName, role = 'student', email } = req.body ?? {};

    if (!username || !password || !displayName) {
      return res.status(400).json({ message: '用户名、姓名和密码均为必填项' });
    }

    const existing = await query('SELECT id FROM users WHERE username = ? LIMIT 1', [username]);

    if (existing.length > 0) {
      return res.status(409).json({ message: '用户名已存在' });
    }

    const result = await query(
      'INSERT INTO users (username, password, display_name, role, email, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      [username, password, displayName, role, email ?? null],
    );

    res.status(201).json({
      id: result.insertId,
      username,
      displayName,
      role,
      email: email ?? null,
    });
  } catch (error) {
    next(error);
  }
});

router.put('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password, displayName, role, email } = req.body ?? {};

    if (!displayName && !password && !role && typeof email === 'undefined') {
      return res.status(400).json({ message: '请提供至少一个待更新的字段' });
    }

    const updates = [];
    const params = [];

    if (displayName) {
      updates.push('display_name = ?');
      params.push(displayName);
    }

    if (typeof role === 'string') {
      updates.push('role = ?');
      params.push(role);
    }

    if (typeof email !== 'undefined') {
      updates.push('email = ?');
      params.push(email || null);
    }

    if (password) {
      updates.push('password = ?');
      params.push(password);
    }

    updates.push('updated_at = NOW()');

    params.push(id);

    await query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.delete('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    await query('DELETE FROM users WHERE id = ?', [id]);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.get('/majors', async (req, res, next) => {
  try {
    const majors = await query('SELECT id, name, description, created_at, updated_at FROM majors ORDER BY name ASC');
    res.json({ majors });
  } catch (error) {
    next(error);
  }
});

router.post('/majors', async (req, res, next) => {
  try {
    const { name, description } = req.body ?? {};

    if (!name) {
      return res.status(400).json({ message: '专业名称不能为空' });
    }

    const result = await query(
      'INSERT INTO majors (name, description, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
      [name, description ?? null],
    );

    res.status(201).json({ id: result.insertId, name, description: description ?? null });
  } catch (error) {
    next(error);
  }
});

router.put('/majors/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body ?? {};

    if (!name && typeof description === 'undefined') {
      return res.status(400).json({ message: '请提供需要更新的字段' });
    }

    const updates = [];
    const params = [];

    if (name) {
      updates.push('name = ?');
      params.push(name);
    }

    if (typeof description !== 'undefined') {
      updates.push('description = ?');
      params.push(description || null);
    }

    updates.push('updated_at = NOW()');
    params.push(id);

    await query(`UPDATE majors SET ${updates.join(', ')} WHERE id = ?`, params);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.delete('/majors/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM majors WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.get('/courses', async (req, res, next) => {
  try {
    const courses = await query(
      'SELECT c.id, c.title, c.description, c.teacher, c.credit, m.name AS majorName, c.major_id AS majorId, c.created_at, c.updated_at\n       FROM courses c\n       LEFT JOIN majors m ON m.id = c.major_id\n       ORDER BY c.created_at DESC\n       LIMIT 200',
    );

    res.json({ courses });
  } catch (error) {
    next(error);
  }
});

router.post('/courses', async (req, res, next) => {
  try {
    const { title, description, teacher, credit, majorId } = req.body ?? {};

    if (!title) {
      return res.status(400).json({ message: '课程名称不能为空' });
    }

    const result = await query(
      'INSERT INTO courses (title, description, teacher, credit, major_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      [title, description ?? null, teacher ?? null, credit ?? null, majorId ?? null],
    );

    res.status(201).json({ id: result.insertId, title });
  } catch (error) {
    next(error);
  }
});

router.put('/courses/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, teacher, credit, majorId } = req.body ?? {};

    if (!title && !description && !teacher && typeof credit === 'undefined' && typeof majorId === 'undefined') {
      return res.status(400).json({ message: '请提供需要更新的字段' });
    }

    const updates = [];
    const params = [];

    if (title) {
      updates.push('title = ?');
      params.push(title);
    }

    if (typeof description !== 'undefined') {
      updates.push('description = ?');
      params.push(description || null);
    }

    if (typeof teacher !== 'undefined') {
      updates.push('teacher = ?');
      params.push(teacher || null);
    }

    if (typeof credit !== 'undefined') {
      updates.push('credit = ?');
      params.push(credit ?? null);
    }

    if (typeof majorId !== 'undefined') {
      updates.push('major_id = ?');
      params.push(majorId ?? null);
    }

    updates.push('updated_at = NOW()');
    params.push(id);

    await query(`UPDATE courses SET ${updates.join(', ')} WHERE id = ?`, params);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.delete('/courses/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM courses WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.get('/materials', async (req, res, next) => {
  try {
    const materials = await query(
      'SELECT cm.id, cm.title, cm.description, cm.file_url AS fileUrl, cm.course_id AS courseId, c.title AS courseTitle, cm.created_at, cm.updated_at\n       FROM course_materials cm\n       LEFT JOIN courses c ON c.id = cm.course_id\n       ORDER BY cm.created_at DESC\n       LIMIT 200',
    );
    res.json({ materials });
  } catch (error) {
    next(error);
  }
});

router.post('/materials', async (req, res, next) => {
  try {
    const { title, description, fileUrl, courseId } = req.body ?? {};

    if (!title) {
      return res.status(400).json({ message: '资料标题不能为空' });
    }

    const result = await query(
      'INSERT INTO course_materials (title, description, file_url, course_id, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
      [title, description ?? null, fileUrl ?? null, courseId ?? null],
    );

    res.status(201).json({ id: result.insertId, title });
  } catch (error) {
    next(error);
  }
});

router.put('/materials/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, fileUrl, courseId } = req.body ?? {};

    if (!title && typeof description === 'undefined' && typeof fileUrl === 'undefined' && typeof courseId === 'undefined') {
      return res.status(400).json({ message: '请提供需要更新的字段' });
    }

    const updates = [];
    const params = [];

    if (title) {
      updates.push('title = ?');
      params.push(title);
    }

    if (typeof description !== 'undefined') {
      updates.push('description = ?');
      params.push(description || null);
    }

    if (typeof fileUrl !== 'undefined') {
      updates.push('file_url = ?');
      params.push(fileUrl || null);
    }

    if (typeof courseId !== 'undefined') {
      updates.push('course_id = ?');
      params.push(courseId ?? null);
    }

    updates.push('updated_at = NOW()');
    params.push(id);

    await query(`UPDATE course_materials SET ${updates.join(', ')} WHERE id = ?`, params);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.delete('/materials/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM course_materials WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.get('/forum/topics', async (req, res, next) => {
  try {
    const topics = await query('SELECT id, title, description, created_at, updated_at FROM forum_topics ORDER BY updated_at DESC LIMIT 100');
    const mappedTopics = topics.map((topic) => ({
      ...topic,
      created_at: topic.created_at ? toMySQLDateTime(topic.created_at) : null,
      updated_at: topic.updated_at ? toMySQLDateTime(topic.updated_at) : null,
    }));
    res.json({ topics: mappedTopics });
  } catch (error) {
    next(error);
  }
});

router.post('/forum/topics', async (req, res, next) => {
  try {
    const { title, description } = req.body ?? {};

    if (!title) {
      return res.status(400).json({ message: '话题标题不能为空' });
    }

    const result = await query(
      'INSERT INTO forum_topics (title, description, created_at, updated_at, created_by) VALUES (?, ?, NOW(), NOW(), ?)',
      [title, description ?? null, req.session.user.id],
    );

    res.status(201).json({ id: result.insertId, title });
  } catch (error) {
    next(error);
  }
});

router.put('/forum/topics/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body ?? {};

    if (!title && typeof description === 'undefined') {
      return res.status(400).json({ message: '请提供需要更新的字段' });
    }

    const updates = [];
    const params = [];

    if (title) {
      updates.push('title = ?');
      params.push(title);
    }

    if (typeof description !== 'undefined') {
      updates.push('description = ?');
      params.push(description || null);
    }

    updates.push('updated_at = NOW()');
    params.push(id);

    await query(`UPDATE forum_topics SET ${updates.join(', ')} WHERE id = ?`, params);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.delete('/forum/topics/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM forum_topics WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.get('/forum/topics/:topicId/posts', async (req, res, next) => {
  try {
    const { topicId } = req.params;
    const posts = await query(
      'SELECT fp.id, fp.content, fp.created_at, fp.updated_at, u.display_name AS author FROM forum_posts fp LEFT JOIN users u ON u.id = fp.user_id WHERE fp.topic_id = ? ORDER BY fp.created_at ASC',
      [topicId],
    );

    const mappedPosts = posts.map((post) => ({
      ...post,
      created_at: post.created_at ? toMySQLDateTime(post.created_at) : null,
      updated_at: post.updated_at ? toMySQLDateTime(post.updated_at) : null,
    }));

    res.json({ posts: mappedPosts });
  } catch (error) {
    next(error);
  }
});

router.delete('/forum/posts/:postId', async (req, res, next) => {
  try {
    const { postId } = req.params;
    await query('DELETE FROM forum_posts WHERE id = ?', [postId]);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.get('/statistics/overview', async (req, res, next) => {
  try {
    const [usersRows, majorsRows, coursesRows, materialsRows, practiceRows, forumPostRows] = await Promise.all([
      query('SELECT COUNT(*) AS totalUsers FROM users'),
      query('SELECT COUNT(*) AS totalMajors FROM majors'),
      query('SELECT COUNT(*) AS totalCourses FROM courses'),
      query('SELECT COUNT(*) AS totalMaterials FROM course_materials'),
      query('SELECT COUNT(*) AS totalPracticeSets FROM practice_sets'),
      query('SELECT COUNT(*) AS totalForumPosts FROM forum_posts'),
    ]);

    res.json({
      totalUsers: Number(usersRows?.[0]?.totalUsers ?? 0),
      totalMajors: Number(majorsRows?.[0]?.totalMajors ?? 0),
      totalCourses: Number(coursesRows?.[0]?.totalCourses ?? 0),
      totalMaterials: Number(materialsRows?.[0]?.totalMaterials ?? 0),
      totalPracticeSets: Number(practiceRows?.[0]?.totalPracticeSets ?? 0),
      totalForumPosts: Number(forumPostRows?.[0]?.totalForumPosts ?? 0),
      lastUpdatedAt: toMySQLDateTime(new Date()),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/statistics/search', async (req, res, next) => {
  try {
    const keyword = (req.query.keyword ?? '').toString().trim();

    if (!keyword) {
      return res.status(400).json({ message: '请输入搜索关键字' });
    }

    const like = `%${keyword}%`;

    const [users, majors, courses, materials, forumTopics] = await Promise.all([
      query('SELECT id, username, display_name AS displayName FROM users WHERE username LIKE ? OR display_name LIKE ? LIMIT 20', [like, like]),
      query('SELECT id, name, description FROM majors WHERE name LIKE ? LIMIT 20', [like]),
      query('SELECT id, title, description FROM courses WHERE title LIKE ? LIMIT 20', [like]),
      query('SELECT id, title, description FROM course_materials WHERE title LIKE ? LIMIT 20', [like]),
      query('SELECT id, title, description FROM forum_topics WHERE title LIKE ? LIMIT 20', [like]),
    ]);

    res.json({ users, majors, courses, materials, forumTopics });
  } catch (error) {
    next(error);
  }
});

export default router;
