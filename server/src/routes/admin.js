const express = require('express');
const bcrypt = require('bcryptjs');
const { query } = require('../database');
const { requireAdmin } = require('../middleware/auth');
const { normalizeDate, parseTags, stringifyTags } = require('../utils/formatters');

const router = express.Router();

const logAdminAction = async (req, action, detail) => {
  const actor = req.session?.user?.name || '系统';
  try {
    await query(
      `INSERT INTO admin_audit_logs (action, detail, actor_name, created_at)
       VALUES (:action, :detail, :actor, NOW())`,
      { action, detail, actor },
    );
  } catch (error) {
    console.warn('记录审计日志失败', error);
  }
};

router.get('/dashboard', requireAdmin, async (req, res) => {
  try {
    const [activeStudentsRow] = await query('SELECT COUNT(*) AS total FROM student_progress');
    const [tasksCompletedRow] = await query(
      "SELECT COUNT(*) AS total FROM study_tasks WHERE completed = 1 AND DATE(completed_at) = CURDATE()",
    );
    const [followUpsRow] = await query(
      "SELECT COUNT(*) AS total FROM follow_up_tasks WHERE status IS NULL OR status NOT IN ('done','resolved','completed')",
    );
    const [systemAlertsRow] = await query('SELECT COUNT(*) AS total FROM system_alerts WHERE resolved = 0');

    const progressRows = await query(
      `SELECT sp.id, sp.user_id, sp.target_university, sp.weekly_study_hours, sp.completion_rate,
              sp.updated_at, COALESCE(u.display_name, u.username) AS display_name
         FROM student_progress sp
    LEFT JOIN users u ON u.id = sp.user_id
        ORDER BY sp.updated_at DESC, sp.created_at DESC
        LIMIT 20`,
    );

    const auditRows = await query(
      `SELECT id, action, detail, actor_name, created_at
         FROM admin_audit_logs
        ORDER BY created_at DESC
        LIMIT 10`,
    );

    const adminRows = await query("SELECT display_name, username FROM users WHERE role = 'admin' ORDER BY display_name ASC");

    res.json({
      metrics: {
        activeStudents: Number(activeStudentsRow?.total) || 0,
        tasksCompletedToday: Number(tasksCompletedRow?.total) || 0,
        followUpsPending: Number(followUpsRow?.total) || 0,
        systemAlerts: Number(systemAlertsRow?.total) || 0,
      },
      studentProgress: progressRows.map((row) => ({
        id: row.id,
        name: row.display_name || '未命名学员',
        university: row.target_university || '未填写',
        studyHours: Number(row.weekly_study_hours) || 0,
        completion: Number(row.completion_rate) || 0,
      })),
      auditLogs: auditRows.map((row) => ({
        id: row.id,
        title: row.action,
        description: row.detail,
        actor: row.actor_name || '系统',
        createdAt: normalizeDate(row.created_at),
      })),
      administrators: adminRows.map((row) => row.display_name || row.username),
      securityNote: '所有敏感操作均会记录审计日志，请定期检查异常行为。',
    });
  } catch (error) {
    console.error('获取后台看板失败', error);
    res.status(500).json({ message: '无法加载后台数据，请稍后重试' });
  }
});

router.get('/settings', requireAdmin, async (req, res) => {
  try {
    const rows = await query('SELECT `key`, `value` FROM site_settings');
    const settings = {};
    rows.forEach((row) => {
      settings[row.key] = row.value;
    });
    res.json({ settings });
  } catch (error) {
    console.error('获取站点设置失败', error);
    res.status(500).json({ message: '无法加载站点设置' });
  }
});

router.put('/settings', requireAdmin, async (req, res) => {
  const settings = req.body?.settings || {};

  try {
    const entries = Object.entries(settings);

    await Promise.all(
      entries.map(([key, value]) =>
        query(
          `INSERT INTO site_settings (
             \`key\`, value, updated_at
           ) VALUES (:key, :value, NOW())
           ON DUPLICATE KEY UPDATE value = VALUES(value), updated_at = NOW()`,
          { key, value },
        ),
      ),
    );

    await logAdminAction(req, '更新站点设置', `调整了 ${entries.length} 项配置`);

    res.json({ success: true });
  } catch (error) {
    console.error('更新站点设置失败', error);
    res.status(500).json({ message: '更新站点设置失败' });
  }
});

router.get('/users', requireAdmin, async (req, res) => {
  try {
    const rows = await query(
      `SELECT id, username, display_name, role, email, created_at, updated_at
         FROM users
        ORDER BY created_at DESC`,
    );

    const users = rows.map((row) => ({
      id: row.id,
      username: row.username,
      displayName: row.display_name || row.username,
      role: row.role,
      email: row.email || null,
      created_at: normalizeDate(row.created_at),
      updated_at: normalizeDate(row.updated_at),
    }));

    res.json({ users });
  } catch (error) {
    console.error('获取用户列表失败', error);
    res.status(500).json({ message: '无法加载用户列表' });
  }
});

router.post('/users', requireAdmin, async (req, res) => {
  const { username, password, displayName, role = 'admin', email } = req.body || {};

  if (!username || !password || !displayName) {
    return res.status(400).json({ message: '请填写用户名、密码和姓名' });
  }

  try {
    const existing = await query('SELECT id FROM users WHERE username = :username LIMIT 1', { username });
    if (existing.length > 0) {
      return res.status(409).json({ message: '用户名已存在' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await query(
      `INSERT INTO users (username, password, display_name, email, role, created_at, updated_at)
       VALUES (:username, :password, :displayName, :email, :role, NOW(), NOW())`,
      {
        username,
        password: hashedPassword,
        displayName,
        email: email || null,
        role,
      },
    );

    await logAdminAction(req, '创建用户', `新增账号 ${displayName} (${username})`);

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('创建用户失败', error);
    res.status(500).json({ message: '创建用户失败，请稍后重试' });
  }
});

router.put('/users/:userId', requireAdmin, async (req, res) => {
  const { userId } = req.params;
  const { password, displayName, role, email } = req.body || {};

  if (!password && !displayName && !role && !email) {
    return res.status(400).json({ message: '请至少更新一项信息' });
  }

  try {
    const updates = [];
    const params = { userId };

    if (displayName) {
      updates.push('display_name = :displayName');
      params.displayName = displayName;
    }
    if (role) {
      updates.push('role = :role');
      params.role = role;
    }
    if (typeof email !== 'undefined') {
      updates.push('email = :email');
      params.email = email || null;
    }
    if (password) {
      updates.push('password = :password');
      params.password = await bcrypt.hash(password, 10);
    }

    updates.push('updated_at = NOW()');

    await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = :userId`,
      params,
    );

    await logAdminAction(req, '更新用户', `调整了账号 ${userId} 信息`);

    res.json({ success: true });
  } catch (error) {
    console.error('更新用户失败', error);
    res.status(500).json({ message: '更新用户失败，请稍后重试' });
  }
});

router.delete('/users/:userId', requireAdmin, async (req, res) => {
  const { userId } = req.params;

  try {
    await query('DELETE FROM users WHERE id = :userId', { userId });
    await logAdminAction(req, '删除用户', `移除了账号 ${userId}`);
    res.json({ success: true });
  } catch (error) {
    console.error('删除用户失败', error);
    res.status(500).json({ message: '删除用户失败，请稍后重试' });
  }
});

router.get('/majors', requireAdmin, async (req, res) => {
  try {
    const rows = await query(
      `SELECT id, name, description, created_at, updated_at
         FROM majors
        ORDER BY updated_at DESC, created_at DESC`,
    );

    const majors = rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description || null,
      createdAt: normalizeDate(row.created_at),
      updatedAt: normalizeDate(row.updated_at),
    }));

    res.json({ majors });
  } catch (error) {
    console.error('获取专业失败', error);
    res.status(500).json({ message: '无法加载专业列表' });
  }
});

router.post('/majors', requireAdmin, async (req, res) => {
  const { name, description = '' } = req.body || {};

  if (!name) {
    return res.status(400).json({ message: '专业名称不能为空' });
  }

  try {
    const result = await query(
      `INSERT INTO majors (name, description, created_at, updated_at)
       VALUES (:name, :description, NOW(), NOW())`,
      { name, description: description || null },
    );

    await logAdminAction(req, '创建专业', `新增专业 ${name}`);

    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error('创建专业失败', error);
    res.status(500).json({ message: '创建专业失败，请稍后重试' });
  }
});

router.put('/majors/:majorId', requireAdmin, async (req, res) => {
  const { majorId } = req.params;
  const { name, description } = req.body || {};

  if (!name && typeof description === 'undefined') {
    return res.status(400).json({ message: '请至少更新一项信息' });
  }

  try {
    const updates = [];
    const params = { majorId };

    if (name) {
      updates.push('name = :name');
      params.name = name;
    }
    if (typeof description !== 'undefined') {
      updates.push('description = :description');
      params.description = description || null;
    }

    updates.push('updated_at = NOW()');

    await query(`UPDATE majors SET ${updates.join(', ')} WHERE id = :majorId`, params);

    await logAdminAction(req, '更新专业', `调整专业 ${majorId}`);

    res.json({ success: true });
  } catch (error) {
    console.error('更新专业失败', error);
    res.status(500).json({ message: '更新专业失败，请稍后重试' });
  }
});

router.delete('/majors/:majorId', requireAdmin, async (req, res) => {
  const { majorId } = req.params;

  try {
    await query('DELETE FROM majors WHERE id = :majorId', { majorId });
    await logAdminAction(req, '删除专业', `移除专业 ${majorId}`);
    res.json({ success: true });
  } catch (error) {
    console.error('删除专业失败', error);
    res.status(500).json({ message: '删除专业失败，请稍后重试' });
  }
});

router.get('/courses', requireAdmin, async (req, res) => {
  try {
    const rows = await query(
      `SELECT c.id, c.title, c.description, c.teacher, c.credit, c.major_id, c.created_at, c.updated_at,
              m.name AS major_name
         FROM courses c
    LEFT JOIN majors m ON m.id = c.major_id
        ORDER BY c.updated_at DESC, c.created_at DESC`,
    );

    const courses = rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description || null,
      teacher: row.teacher || null,
      credit: typeof row.credit === 'number' ? row.credit : row.credit ? Number(row.credit) : null,
      majorId: row.major_id || null,
      majorName: row.major_name || null,
      createdAt: normalizeDate(row.created_at),
      updatedAt: normalizeDate(row.updated_at),
    }));

    res.json({ courses });
  } catch (error) {
    console.error('获取课程失败', error);
    res.status(500).json({ message: '无法加载课程列表' });
  }
});

router.post('/courses', requireAdmin, async (req, res) => {
  const { title, description = '', teacher = '', credit = null, majorId = null } = req.body || {};

  if (!title) {
    return res.status(400).json({ message: '课程标题不能为空' });
  }

  try {
    const result = await query(
      `INSERT INTO courses (title, description, teacher, credit, major_id, created_at, updated_at)
       VALUES (:title, :description, :teacher, :credit, :majorId, NOW(), NOW())`,
      {
        title,
        description: description || null,
        teacher: teacher || null,
        credit: credit !== null && credit !== undefined ? credit : null,
        majorId,
      },
    );

    await logAdminAction(req, '创建课程', `新增课程 ${title}`);

    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error('创建课程失败', error);
    res.status(500).json({ message: '创建课程失败，请稍后重试' });
  }
});

router.put('/courses/:courseId', requireAdmin, async (req, res) => {
  const { courseId } = req.params;
  const { title, description, teacher, credit, majorId } = req.body || {};

  if (
    typeof title === 'undefined' &&
    typeof description === 'undefined' &&
    typeof teacher === 'undefined' &&
    typeof credit === 'undefined' &&
    typeof majorId === 'undefined'
  ) {
    return res.status(400).json({ message: '请至少更新一项信息' });
  }

  try {
    const updates = [];
    const params = { courseId };

    if (typeof title !== 'undefined') {
      updates.push('title = :title');
      params.title = title;
    }
    if (typeof description !== 'undefined') {
      updates.push('description = :description');
      params.description = description || null;
    }
    if (typeof teacher !== 'undefined') {
      updates.push('teacher = :teacher');
      params.teacher = teacher || null;
    }
    if (typeof credit !== 'undefined') {
      updates.push('credit = :credit');
      params.credit = credit !== null && credit !== undefined ? credit : null;
    }
    if (typeof majorId !== 'undefined') {
      updates.push('major_id = :majorId');
      params.majorId = majorId || null;
    }

    updates.push('updated_at = NOW()');

    await query(`UPDATE courses SET ${updates.join(', ')} WHERE id = :courseId`, params);

    await logAdminAction(req, '更新课程', `调整课程 ${courseId}`);

    res.json({ success: true });
  } catch (error) {
    console.error('更新课程失败', error);
    res.status(500).json({ message: '更新课程失败，请稍后重试' });
  }
});

router.delete('/courses/:courseId', requireAdmin, async (req, res) => {
  const { courseId } = req.params;

  try {
    await query('DELETE FROM courses WHERE id = :courseId', { courseId });
    await logAdminAction(req, '删除课程', `移除课程 ${courseId}`);
    res.json({ success: true });
  } catch (error) {
    console.error('删除课程失败', error);
    res.status(500).json({ message: '删除课程失败，请稍后重试' });
  }
});

router.get('/materials', requireAdmin, async (req, res) => {
  try {
    const rows = await query(
      `SELECT cm.id, cm.title, cm.description, cm.file_url, cm.course_id, cm.created_at, cm.updated_at,
              c.title AS course_title
         FROM course_materials cm
    LEFT JOIN courses c ON c.id = cm.course_id
        ORDER BY cm.updated_at DESC, cm.created_at DESC`,
    );

    const materials = rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description || null,
      fileUrl: row.file_url || null,
      courseId: row.course_id || null,
      courseTitle: row.course_title || null,
      createdAt: normalizeDate(row.created_at),
      updatedAt: normalizeDate(row.updated_at),
    }));

    res.json({ materials });
  } catch (error) {
    console.error('获取资料失败', error);
    res.status(500).json({ message: '无法加载资料列表' });
  }
});

router.post('/materials', requireAdmin, async (req, res) => {
  const { title, description = '', fileUrl = '', courseId = null } = req.body || {};

  if (!title) {
    return res.status(400).json({ message: '资料标题不能为空' });
  }

  try {
    const result = await query(
      `INSERT INTO course_materials (title, description, file_url, course_id, created_at, updated_at)
       VALUES (:title, :description, :fileUrl, :courseId, NOW(), NOW())`,
      {
        title,
        description: description || null,
        fileUrl: fileUrl || null,
        courseId,
      },
    );

    await logAdminAction(req, '创建资料', `新增资料 ${title}`);

    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error('创建资料失败', error);
    res.status(500).json({ message: '创建资料失败，请稍后重试' });
  }
});

router.put('/materials/:materialId', requireAdmin, async (req, res) => {
  const { materialId } = req.params;
  const { title, description, fileUrl, courseId } = req.body || {};

  if (
    typeof title === 'undefined' &&
    typeof description === 'undefined' &&
    typeof fileUrl === 'undefined' &&
    typeof courseId === 'undefined'
  ) {
    return res.status(400).json({ message: '请至少更新一项信息' });
  }

  try {
    const updates = [];
    const params = { materialId };

    if (typeof title !== 'undefined') {
      updates.push('title = :title');
      params.title = title;
    }
    if (typeof description !== 'undefined') {
      updates.push('description = :description');
      params.description = description || null;
    }
    if (typeof fileUrl !== 'undefined') {
      updates.push('file_url = :fileUrl');
      params.fileUrl = fileUrl || null;
    }
    if (typeof courseId !== 'undefined') {
      updates.push('course_id = :courseId');
      params.courseId = courseId || null;
    }

    updates.push('updated_at = NOW()');

    await query(`UPDATE course_materials SET ${updates.join(', ')} WHERE id = :materialId`, params);

    await logAdminAction(req, '更新资料', `调整资料 ${materialId}`);

    res.json({ success: true });
  } catch (error) {
    console.error('更新资料失败', error);
    res.status(500).json({ message: '更新资料失败，请稍后重试' });
  }
});

router.delete('/materials/:materialId', requireAdmin, async (req, res) => {
  const { materialId } = req.params;

  try {
    await query('DELETE FROM course_materials WHERE id = :materialId', { materialId });
    await logAdminAction(req, '删除资料', `移除资料 ${materialId}`);
    res.json({ success: true });
  } catch (error) {
    console.error('删除资料失败', error);
    res.status(500).json({ message: '删除资料失败，请稍后重试' });
  }
});

router.get('/statistics/overview', requireAdmin, async (req, res) => {
  try {
    const [usersRow] = await query('SELECT COUNT(*) AS total FROM users');
    const [majorsRow] = await query('SELECT COUNT(*) AS total FROM majors');
    const [coursesRow] = await query('SELECT COUNT(*) AS total FROM courses');
    const [materialsRow] = await query('SELECT COUNT(*) AS total FROM course_materials');
    const [practiceSetsRow] = await query('SELECT COUNT(*) AS total FROM practice_sets');
    const [forumPostsRow] = await query('SELECT COUNT(*) AS total FROM forum_posts');
    const [lastAuditRow] = await query('SELECT MAX(created_at) AS lastTime FROM admin_audit_logs');

    res.json({
      totalUsers: Number(usersRow?.total) || 0,
      totalMajors: Number(majorsRow?.total) || 0,
      totalCourses: Number(coursesRow?.total) || 0,
      totalMaterials: Number(materialsRow?.total) || 0,
      totalPracticeSets: Number(practiceSetsRow?.total) || 0,
      totalForumPosts: Number(forumPostsRow?.total) || 0,
      lastUpdatedAt: normalizeDate(lastAuditRow?.lastTime),
    });
  } catch (error) {
    console.error('获取统计概览失败', error);
    res.status(500).json({ message: '无法加载统计概览' });
  }
});

router.get('/statistics/search', requireAdmin, async (req, res) => {
  const keyword = (req.query.keyword || '').toString().trim();

  if (!keyword) {
    return res.status(400).json({ message: '请输入搜索关键词' });
  }

  const likeKeyword = `%${keyword}%`;

  try {
    const [users, majors, courses, materials, forumTopics] = await Promise.all([
      query(
        `SELECT id, username, display_name, role, email FROM users
          WHERE username LIKE :kw OR display_name LIKE :kw OR email LIKE :kw
          LIMIT 20`,
        { kw: likeKeyword },
      ),
      query(
        `SELECT id, name, description FROM majors
          WHERE name LIKE :kw OR description LIKE :kw
          LIMIT 20`,
        { kw: likeKeyword },
      ),
      query(
        `SELECT c.id, c.title, c.description, COALESCE(m.name, '') AS major_name
           FROM courses c
      LEFT JOIN majors m ON m.id = c.major_id
          WHERE c.title LIKE :kw OR c.description LIKE :kw OR m.name LIKE :kw
          LIMIT 20`,
        { kw: likeKeyword },
      ),
      query(
        `SELECT cm.id, cm.title, cm.description, cm.file_url
           FROM course_materials cm
          WHERE cm.title LIKE :kw OR cm.description LIKE :kw
          LIMIT 20`,
        { kw: likeKeyword },
      ),
      query(
        `SELECT id, title, description
           FROM forum_topics
          WHERE title LIKE :kw OR description LIKE :kw
          LIMIT 20`,
        { kw: likeKeyword },
      ),
    ]);

    res.json({
      users: users.map((row) => ({
        id: row.id,
        username: row.username,
        displayName: row.display_name || row.username,
        role: row.role,
        email: row.email || null,
      })),
      majors: majors.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description || null,
      })),
      courses: courses.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description || null,
        majorName: row.major_name || null,
      })),
      materials: materials.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description || null,
        fileUrl: row.file_url || null,
      })),
      forumTopics: forumTopics.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description || null,
      })),
    });
  } catch (error) {
    console.error('搜索后台数据失败', error);
    res.status(500).json({ message: '搜索失败，请稍后重试' });
  }
});

router.get('/forum/topics', requireAdmin, async (req, res) => {
  try {
    const rows = await query(
      `SELECT id, title, description, created_at, updated_at
         FROM forum_topics
        ORDER BY updated_at DESC, created_at DESC`,
    );

    const topics = rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description || null,
      created_at: normalizeDate(row.created_at),
      updated_at: normalizeDate(row.updated_at),
    }));

    res.json({ topics });
  } catch (error) {
    console.error('获取后台话题失败', error);
    res.status(500).json({ message: '无法加载话题' });
  }
});

router.get('/forum/topics/:topicId/posts', requireAdmin, async (req, res) => {
  const { topicId } = req.params;

  try {
    const rows = await query(
      `SELECT fp.id, fp.content, fp.created_at, fp.updated_at,
              COALESCE(u.display_name, u.username) AS author
         FROM forum_posts fp
    LEFT JOIN users u ON u.id = fp.author_id
        WHERE fp.topic_id = :topicId
        ORDER BY fp.created_at ASC`,
      { topicId },
    );

    const posts = rows.map((row) => ({
      id: row.id,
      content: row.content,
      author: row.author || '匿名用户',
      created_at: normalizeDate(row.created_at),
      updated_at: normalizeDate(row.updated_at),
    }));

    res.json({ posts });
  } catch (error) {
    console.error('获取后台帖子失败', error);
    res.status(500).json({ message: '无法加载帖子' });
  }
});

router.delete('/forum/topics/:topicId', requireAdmin, async (req, res) => {
  const { topicId } = req.params;

  try {
    await query('DELETE FROM forum_posts WHERE topic_id = :topicId', { topicId });
    await query('DELETE FROM forum_topics WHERE id = :topicId', { topicId });
    await logAdminAction(req, '删除话题', `移除话题 ${topicId}`);
    res.json({ success: true });
  } catch (error) {
    console.error('删除话题失败', error);
    res.status(500).json({ message: '删除话题失败，请稍后重试' });
  }
});

router.delete('/forum/posts/:postId', requireAdmin, async (req, res) => {
  const { postId } = req.params;

  try {
    await query('DELETE FROM forum_posts WHERE id = :postId', { postId });
    await logAdminAction(req, '删除帖子', `移除帖子 ${postId}`);
    res.json({ success: true });
  } catch (error) {
    console.error('删除帖子失败', error);
    res.status(500).json({ message: '删除帖子失败，请稍后重试' });
  }
});

router.get('/practice/sets', requireAdmin, async (req, res) => {
  try {
    const rows = await query(
      `SELECT ps.id, ps.title, ps.description, ps.difficulty, ps.tags, ps.created_at, ps.updated_at,
              COUNT(pq.id) AS questionCount
         FROM practice_sets ps
    LEFT JOIN practice_questions pq ON pq.practice_set_id = ps.id
        GROUP BY ps.id
        ORDER BY ps.updated_at DESC, ps.created_at DESC`,
    );

    const sets = rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description || null,
      difficulty: row.difficulty || 'medium',
      tags: parseTags(row.tags),
      questionCount: Number(row.questionCount) || 0,
      createdAt: normalizeDate(row.created_at),
      updatedAt: normalizeDate(row.updated_at),
    }));

    res.json({ sets });
  } catch (error) {
    console.error('获取后台题单失败', error);
    res.status(500).json({ message: '无法加载题单' });
  }
});

router.put('/practice/sets/:setId', requireAdmin, async (req, res) => {
  const { setId } = req.params;
  const { title, description, difficulty, tags } = req.body || {};

  if (
    typeof title === 'undefined' &&
    typeof description === 'undefined' &&
    typeof difficulty === 'undefined' &&
    typeof tags === 'undefined'
  ) {
    return res.status(400).json({ message: '请至少更新一项信息' });
  }

  try {
    const updates = [];
    const params = { setId };

    if (typeof title !== 'undefined') {
      updates.push('title = :title');
      params.title = title;
    }
    if (typeof description !== 'undefined') {
      updates.push('description = :description');
      params.description = description || null;
    }
    if (typeof difficulty !== 'undefined') {
      updates.push('difficulty = :difficulty');
      params.difficulty = difficulty || null;
    }
    if (typeof tags !== 'undefined') {
      updates.push('tags = :tags');
      params.tags = stringifyTags(tags);
    }

    updates.push('updated_at = NOW()');

    await query(`UPDATE practice_sets SET ${updates.join(', ')} WHERE id = :setId`, params);

    await logAdminAction(req, '更新题单', `调整题单 ${setId}`);

    res.json({ success: true });
  } catch (error) {
    console.error('更新题单失败', error);
    res.status(500).json({ message: '更新题单失败，请稍后重试' });
  }
});

router.delete('/practice/sets/:setId', requireAdmin, async (req, res) => {
  const { setId } = req.params;

  try {
    await query('DELETE FROM practice_questions WHERE practice_set_id = :setId', { setId });
    await query('DELETE FROM practice_sets WHERE id = :setId', { setId });
    await logAdminAction(req, '删除题单', `移除题单 ${setId}`);
    res.json({ success: true });
  } catch (error) {
    console.error('删除题单失败', error);
    res.status(500).json({ message: '删除题单失败，请稍后重试' });
  }
});

module.exports = router;
