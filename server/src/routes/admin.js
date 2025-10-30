const express = require('express');
const bcrypt = require('bcryptjs');
const {
  query,
  insertRecord,
  updateRecord,
  deleteRecord,
  tableExists,
  getTableColumns,
} = require('../database');
const { requireAdmin } = require('../middleware/auth');
const { normalizeDate } = require('../utils/formatters');
const { normalizeRole } = require('../utils/auth');

const router = express.Router();

const safeCount = async (table, clause = '', params = {}) => {
  if (!(await tableExists(table))) {
    return 0;
  }

  const [row] = await query(`SELECT COUNT(*) AS total FROM \`${table}\` ${clause}`, params);
  return Number(row?.total) || 0;
};

const safeSelect = async (table, sql, params = {}) => {
  try {
    return await query(sql, params);
  } catch (error) {
    if (['ER_NO_SUCH_TABLE', 'ER_BAD_FIELD_ERROR'].includes(error.code)) {
      console.warn(`跳过 ${table} 查询：${error.message}`);
      return [];
    }
    throw error;
  }
};

const logAdminAction = async (req, action, detail) => {
  try {
    if (!(await tableExists('admin_audit_logs'))) {
      return;
    }

    await insertRecord('admin_audit_logs', {
      action,
      detail,
      actor_name: req.session?.user?.name || '系统',
    });
  } catch (error) {
    console.warn('记录审计日志失败', error.message);
  }
};

router.get('/dashboard', requireAdmin, async (req, res) => {
  try {
    const metrics = {
      activeStudents: await safeCount('student_progress'),
      tasksCompletedToday: await safeCount(
        'study_tasks',
        "WHERE completed = 1 AND DATE(completed_at) = CURDATE()",
      ),
      followUpsPending: await safeCount(
        'follow_up_tasks',
        "WHERE status IS NULL OR status NOT IN ('done','resolved','completed')",
      ),
      systemAlerts: await safeCount('system_alerts', 'WHERE resolved = 0'),
    };

    let studentProgress = [];
    if (await tableExists('student_progress')) {
      const columns = await getTableColumns('student_progress');
      const hasUsersTable = columns.has('user_id') && (await tableExists('users'));
      const selectFragments = [
        'sp.id',
        columns.has('target_university') ? 'sp.target_university' : "NULL AS target_university",
        columns.has('weekly_study_hours') ? 'sp.weekly_study_hours' : '0 AS weekly_study_hours',
        columns.has('completion_rate') ? 'sp.completion_rate' : '0 AS completion_rate',
        hasUsersTable
          ? "COALESCE(u.display_name, u.username, '未命名学员') AS display_name"
          : "'未命名学员' AS display_name",
      ];

      const joinClause = hasUsersTable ? 'LEFT JOIN users u ON u.id = sp.user_id' : '';
      const orderColumn = columns.has('updated_at')
        ? 'sp.updated_at'
        : columns.has('created_at')
        ? 'sp.created_at'
        : 'sp.id';

      const rows = await safeSelect(
        'student_progress',
        `SELECT ${selectFragments.join(', ')}
           FROM student_progress sp
           ${joinClause}
          ORDER BY ${orderColumn} DESC
          LIMIT 20`,
      );

      studentProgress = rows.map((row) => ({
        id: Number(row.id),
        name: row.display_name || '未命名学员',
        university: row.target_university || '未填写',
        studyHours: Number(row.weekly_study_hours) || 0,
        completion: Number(row.completion_rate) || 0,
      }));
    }

    let auditLogs = [];
    if (await tableExists('admin_audit_logs')) {
      const rows = await safeSelect(
        'admin_audit_logs',
        `SELECT id, action, detail, actor_name, created_at
           FROM admin_audit_logs
          ORDER BY created_at DESC, id DESC
          LIMIT 10`,
      );

      auditLogs = rows.map((row) => ({
        id: Number(row.id),
        title: row.action,
        description: row.detail,
        actor: row.actor_name || '系统',
        createdAt: normalizeDate(row.created_at),
      }));
    }

    let administrators = [];
    if (await tableExists('users')) {
      const userColumns = await getTableColumns('users');
      const selectFragments = [
        'id',
        userColumns.has('username') ? 'username' : "'' AS username",
        userColumns.has('display_name') ? 'display_name' : "NULL AS display_name",
        userColumns.has('role') ? 'role' : "'student' AS role",
      ];

      const rows = await query(`SELECT ${selectFragments.join(', ')} FROM users`);
      administrators = rows
        .filter((row) => normalizeRole(row.role) === 'admin')
        .map((row) => row.display_name || row.username)
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, 'zh-CN'));
    }

    res.json({
      metrics,
      studentProgress,
      auditLogs,
      administrators,
      securityNote: '所有敏感操作均会记录审计日志，请定期检查异常行为。',
    });
  } catch (error) {
    console.error('获取后台看板失败', error);
    res.status(500).json({ message: '无法加载后台数据，请稍后重试' });
  }
});

router.get('/settings', requireAdmin, async (req, res) => {
  try {
    if (!(await tableExists('site_settings'))) {
      return res.json({ settings: {} });
    }

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
  const entries = Object.entries(settings);

  if (entries.length === 0) {
    return res.json({ success: true });
  }

  try {
    if (!(await tableExists('site_settings'))) {
      return res.status(500).json({ message: 'site_settings 表不存在，请先创建后再保存设置。' });
    }

    await Promise.all(
      entries.map(([key, value]) =>
        query(
          `INSERT INTO site_settings (\`key\`, value, updated_at)
             VALUES (:key, :value, NOW())
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
    if (!(await tableExists('users'))) {
      return res.json({ users: [] });
    }

    const columns = await getTableColumns('users');
    const selectFragments = [
      'id',
      columns.has('username') ? 'username' : "'' AS username",
      columns.has('display_name') ? 'display_name' : "NULL AS display_name",
      columns.has('email') ? 'email' : 'NULL AS email',
      columns.has('role') ? 'role' : "'student' AS role",
      columns.has('created_at') ? 'created_at' : 'NULL AS created_at',
      columns.has('updated_at') ? 'updated_at' : 'NULL AS updated_at',
    ];

    const rows = await query(`SELECT ${selectFragments.join(', ')} FROM users ORDER BY id DESC`);

    const users = rows.map((row) => ({
      id: Number(row.id),
      username: row.username,
      displayName: row.display_name || row.username,
      email: row.email || null,
      role: normalizeRole(row.role),
      created_at: normalizeDate(row.created_at),
      updated_at: normalizeDate(row.updated_at),
    }));

    res.json({ users });
  } catch (error) {
    console.error('获取用户失败', error);
    res.status(500).json({ message: '无法加载用户列表' });
  }
});

router.post('/users', requireAdmin, async (req, res) => {
  const { username, password, displayName, email, role = 'student' } = req.body || {};

  if (!username || !password || !displayName) {
    return res.status(400).json({ message: '请填写用户名、密码与姓名' });
  }

  try {
    if (!(await tableExists('users'))) {
      return res.status(500).json({ message: 'users 表不存在，请先创建后再添加用户。' });
    }

    const existing = await query('SELECT id FROM users WHERE username = :username LIMIT 1', { username });
    if (existing.length > 0) {
      return res.status(409).json({ message: '用户名已存在' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await insertRecord('users', {
      username,
      password: hashedPassword,
      display_name: displayName,
      email: email || null,
      role: normalizeRole(role),
    });

    await logAdminAction(req, '创建用户', `新增用户 ${displayName}`);

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('创建用户失败', error);
    res.status(500).json({ message: '创建用户失败，请稍后重试' });
  }
});

router.put('/users/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { role, displayName, email } = req.body || {};

  try {
    const updates = {};
    if (role !== undefined) {
      updates.role = normalizeRole(role);
    }
    if (displayName !== undefined) {
      updates.display_name = displayName || null;
    }
    if (email !== undefined) {
      updates.email = email || null;
    }

    if (Object.keys(updates).length === 0) {
      return res.json({ success: true });
    }

    await updateRecord('users', id, updates);
    await logAdminAction(req, '更新用户', `调整用户 ${id} 的信息`);

    res.json({ success: true });
  } catch (error) {
    console.error('更新用户失败', error);
    res.status(500).json({ message: '更新用户失败，请稍后重试' });
  }
});

router.delete('/users/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    await deleteRecord('users', id);
    await logAdminAction(req, '删除用户', `移除用户 ${id}`);

    res.json({ success: true });
  } catch (error) {
    console.error('删除用户失败', error);
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ message: '无法删除，该用户仍有关联数据' });
    }
    res.status(500).json({ message: '删除用户失败，请稍后重试' });
  }
});

router.get('/majors', requireAdmin, async (req, res) => {
  try {
    if (!(await tableExists('majors'))) {
      return res.json({ majors: [] });
    }

    const columns = await getTableColumns('majors');
    const selectFragments = [
      'id',
      columns.has('name') ? 'name' : "'' AS name",
      columns.has('description') ? 'description' : 'NULL AS description',
    ];

    const rows = await query(`SELECT ${selectFragments.join(', ')} FROM majors ORDER BY id DESC`);
    const majors = rows.map((row) => ({
      id: Number(row.id),
      name: row.name,
      description: row.description || null,
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
    await insertRecord('majors', { name, description: description || null });
    await logAdminAction(req, '创建专业', `新增专业 ${name}`);

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('创建专业失败', error);
    res.status(500).json({ message: '创建专业失败，请稍后重试' });
  }
});

router.put('/majors/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body || {};

  try {
    await updateRecord('majors', id, {
      name,
      description: description || null,
    });

    await logAdminAction(req, '更新专业', `调整专业 ${id}`);

    res.json({ success: true });
  } catch (error) {
    console.error('更新专业失败', error);
    res.status(500).json({ message: '更新专业失败，请稍后重试' });
  }
});

router.delete('/majors/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    await deleteRecord('majors', id);
    await logAdminAction(req, '删除专业', `移除专业 ${id}`);

    res.json({ success: true });
  } catch (error) {
    console.error('删除专业失败', error);
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ message: '无法删除，该专业仍有关联课程' });
    }
    res.status(500).json({ message: '删除专业失败，请稍后重试' });
  }
});

router.get('/courses', requireAdmin, async (req, res) => {
  try {
    if (!(await tableExists('courses'))) {
      return res.json({ courses: [] });
    }

    const courseColumns = await getTableColumns('courses');
    const hasMajors = courseColumns.has('major_id') && (await tableExists('majors'));
    const selectFragments = [
      'c.id',
      'c.title',
      courseColumns.has('description') ? 'c.description' : 'NULL AS description',
      courseColumns.has('teacher') ? 'c.teacher' : 'NULL AS teacher',
      courseColumns.has('credit') ? 'c.credit' : 'NULL AS credit',
      courseColumns.has('major_id') ? 'c.major_id' : 'NULL AS major_id',
    ];

    if (hasMajors) {
      selectFragments.push('m.name AS major_name');
    }

    const joinClause = hasMajors ? 'LEFT JOIN majors m ON m.id = c.major_id' : '';

    const rows = await query(
      `SELECT ${selectFragments.join(', ')}
         FROM courses c
         ${joinClause}
        ORDER BY c.id DESC`,
    );

    const courses = rows.map((row) => ({
      id: Number(row.id),
      title: row.title,
      description: row.description || null,
      teacher: row.teacher || null,
      credit: row.credit !== null ? Number(row.credit) : null,
      majorId: row.major_id !== null ? Number(row.major_id) : null,
      majorName: row.major_name || null,
    }));

    res.json({ courses });
  } catch (error) {
    console.error('获取课程失败', error);
    res.status(500).json({ message: '无法加载课程列表' });
  }
});

router.post('/courses', requireAdmin, async (req, res) => {
  const { title, description, teacher, credit, majorId } = req.body || {};

  if (!title) {
    return res.status(400).json({ message: '课程名称不能为空' });
  }

  try {
    await insertRecord('courses', {
      title,
      description: description || null,
      teacher: teacher || null,
      credit: credit !== undefined && credit !== null && credit !== '' ? Number(credit) : null,
      major_id: majorId ? Number(majorId) : null,
    });

    await logAdminAction(req, '创建课程', `新增课程 ${title}`);

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('创建课程失败', error);
    res.status(500).json({ message: '创建课程失败，请稍后重试' });
  }
});

router.put('/courses/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { title, description, teacher, credit, majorId } = req.body || {};

  try {
    await updateRecord('courses', id, {
      title,
      description: description || null,
      teacher: teacher || null,
      credit: credit !== undefined && credit !== null && credit !== '' ? Number(credit) : null,
      major_id: majorId ? Number(majorId) : null,
    });

    await logAdminAction(req, '更新课程', `调整课程 ${id}`);

    res.json({ success: true });
  } catch (error) {
    console.error('更新课程失败', error);
    res.status(500).json({ message: '更新课程失败，请稍后重试' });
  }
});

router.delete('/courses/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    await deleteRecord('courses', id);
    await logAdminAction(req, '删除课程', `移除课程 ${id}`);

    res.json({ success: true });
  } catch (error) {
    console.error('删除课程失败', error);
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ message: '无法删除，该课程仍有关联资料' });
    }
    res.status(500).json({ message: '删除课程失败，请稍后重试' });
  }
});

router.get('/materials', requireAdmin, async (req, res) => {
  try {
    if (!(await tableExists('course_materials'))) {
      return res.json({ materials: [] });
    }

    const materialColumns = await getTableColumns('course_materials');
    const hasCourses = materialColumns.has('course_id') && (await tableExists('courses'));
    const selectFragments = [
      'm.id',
      'm.title',
      materialColumns.has('description') ? 'm.description' : 'NULL AS description',
      materialColumns.has('file_url') ? 'm.file_url' : 'NULL AS file_url',
      materialColumns.has('course_id') ? 'm.course_id' : 'NULL AS course_id',
    ];

    if (hasCourses) {
      selectFragments.push('c.title AS course_title');
    }

    const joinClause = hasCourses ? 'LEFT JOIN courses c ON c.id = m.course_id' : '';

    const rows = await query(
      `SELECT ${selectFragments.join(', ')}
         FROM course_materials m
         ${joinClause}
        ORDER BY m.id DESC`,
    );

    const materials = rows.map((row) => ({
      id: Number(row.id),
      title: row.title,
      description: row.description || null,
      fileUrl: row.file_url || null,
      courseId: row.course_id !== null ? Number(row.course_id) : null,
      courseTitle: row.course_title || null,
    }));

    res.json({ materials });
  } catch (error) {
    console.error('获取资料失败', error);
    res.status(500).json({ message: '无法加载资料列表' });
  }
});

router.post('/materials', requireAdmin, async (req, res) => {
  const { title, description, fileUrl, courseId } = req.body || {};

  if (!title) {
    return res.status(400).json({ message: '资料名称不能为空' });
  }

  try {
    await insertRecord('course_materials', {
      title,
      description: description || null,
      file_url: fileUrl || null,
      course_id: courseId ? Number(courseId) : null,
    });

    await logAdminAction(req, '创建资料', `新增资料 ${title}`);

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('创建资料失败', error);
    res.status(500).json({ message: '创建资料失败，请稍后重试' });
  }
});

router.put('/materials/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { title, description, fileUrl, courseId } = req.body || {};

  try {
    await updateRecord('course_materials', id, {
      title,
      description: description || null,
      file_url: fileUrl || null,
      course_id: courseId ? Number(courseId) : null,
    });

    await logAdminAction(req, '更新资料', `调整资料 ${id}`);

    res.json({ success: true });
  } catch (error) {
    console.error('更新资料失败', error);
    res.status(500).json({ message: '更新资料失败，请稍后重试' });
  }
});

router.delete('/materials/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    await deleteRecord('course_materials', id);
    await logAdminAction(req, '删除资料', `移除资料 ${id}`);

    res.json({ success: true });
  } catch (error) {
    console.error('删除资料失败', error);
    res.status(500).json({ message: '删除资料失败，请稍后重试' });
  }
});

router.get('/forum/topics', requireAdmin, async (req, res) => {
  try {
    if (!(await tableExists('forum_topics'))) {
      return res.json({ topics: [] });
    }

    const columns = await getTableColumns('forum_topics');
    const selectFragments = [
      'id',
      columns.has('title') ? 'title' : "'' AS title",
      columns.has('description') ? 'description' : 'NULL AS description',
      columns.has('created_at') ? 'created_at' : 'NULL AS created_at',
      columns.has('updated_at') ? 'updated_at' : 'NULL AS updated_at',
    ];

    const orderColumn = columns.has('updated_at')
      ? 'updated_at'
      : columns.has('created_at')
      ? 'created_at'
      : 'id';

    const rows = await query(
      `SELECT ${selectFragments.join(', ')}
         FROM forum_topics
        ORDER BY ${orderColumn} DESC, id DESC`,
    );

    const topics = rows.map((row) => ({
      id: Number(row.id),
      title: row.title,
      description: row.description || null,
      created_at: normalizeDate(row.created_at),
      updated_at: normalizeDate(row.updated_at),
    }));

    res.json({ topics });
  } catch (error) {
    console.error('获取论坛话题失败', error);
    res.status(500).json({ message: '无法加载论坛话题' });
  }
});

router.get('/forum/topics/:topicId/posts', requireAdmin, async (req, res) => {
  const { topicId } = req.params;

  try {
    if (!(await tableExists('forum_posts'))) {
      return res.json({ posts: [] });
    }

    const postColumns = await getTableColumns('forum_posts');
    const hasUsers = await tableExists('users');
    const joinClause = hasUsers ? 'LEFT JOIN users u ON u.id = fp.author_id' : '';
    const authorSelect = hasUsers
      ? "COALESCE(u.display_name, u.username, '匿名用户') AS author"
      : "'匿名用户' AS author";

    const selectFragments = [
      'fp.id',
      postColumns.has('content') ? 'fp.content' : "'' AS content",
      postColumns.has('created_at') ? 'fp.created_at' : 'NULL AS created_at',
      postColumns.has('updated_at') ? 'fp.updated_at' : 'NULL AS updated_at',
      authorSelect,
    ];

    const orderColumn = postColumns.has('created_at') ? 'fp.created_at' : 'fp.id';

    const rows = await query(
      `SELECT ${selectFragments.join(', ')}
         FROM forum_posts fp
         ${joinClause}
        WHERE fp.topic_id = :topicId
        ORDER BY ${orderColumn} ASC, fp.id ASC`,
      { topicId },
    );

    const posts = rows.map((row) => ({
      id: Number(row.id),
      content: row.content,
      author: row.author || '匿名用户',
      created_at: normalizeDate(row.created_at),
      updated_at: normalizeDate(row.updated_at),
    }));

    res.json({ posts });
  } catch (error) {
    console.error('获取论坛帖子失败', error);
    res.status(500).json({ message: '无法加载论坛帖子' });
  }
});

router.delete('/forum/topics/:topicId', requireAdmin, async (req, res) => {
  const { topicId } = req.params;

  try {
    if (await tableExists('forum_posts')) {
      await query('DELETE FROM forum_posts WHERE topic_id = :topicId', { topicId });
    }

    await deleteRecord('forum_topics', topicId);
    await logAdminAction(req, '删除论坛话题', `移除话题 ${topicId}`);

    res.json({ success: true });
  } catch (error) {
    console.error('删除论坛话题失败', error);
    res.status(500).json({ message: '删除论坛话题失败，请稍后重试' });
  }
});

router.delete('/forum/posts/:postId', requireAdmin, async (req, res) => {
  const { postId } = req.params;

  try {
    await deleteRecord('forum_posts', postId);
    await logAdminAction(req, '删除论坛帖子', `移除帖子 ${postId}`);

    res.json({ success: true });
  } catch (error) {
    console.error('删除论坛帖子失败', error);
    res.status(500).json({ message: '删除论坛帖子失败，请稍后重试' });
  }
});

router.get('/statistics/overview', requireAdmin, async (req, res) => {
  try {
    const overview = {
      totalUsers: await safeCount('users'),
      totalMajors: await safeCount('majors'),
      totalCourses: await safeCount('courses'),
      totalMaterials: await safeCount('course_materials'),
      totalPracticeSets: await safeCount('practice_sets'),
      totalForumPosts: await safeCount('forum_posts'),
      lastUpdatedAt: null,
    };

    if (await tableExists('admin_audit_logs')) {
      const rows = await query(
        `SELECT created_at FROM admin_audit_logs ORDER BY created_at DESC, id DESC LIMIT 1`,
      );
      overview.lastUpdatedAt = normalizeDate(rows[0]?.created_at);
    }

    res.json(overview);
  } catch (error) {
    console.error('获取统计概览失败', error);
    res.status(500).json({ message: '无法加载统计信息' });
  }
});

router.get('/statistics/search', requireAdmin, async (req, res) => {
  const keyword = String(req.query.keyword || '').trim();

  if (!keyword) {
    return res.json({
      users: [],
      majors: [],
      courses: [],
      materials: [],
      forumTopics: [],
    });
  }

  const wildcard = `%${keyword}%`;

  try {
    const users = (await (async () => {
      if (!(await tableExists('users'))) {
        return [];
      }
      const columns = await getTableColumns('users');
      const conditions = [];
      if (columns.has('username')) conditions.push('username LIKE :keyword');
      if (columns.has('display_name')) conditions.push('display_name LIKE :keyword');
      if (columns.has('email')) conditions.push('email LIKE :keyword');
      if (conditions.length === 0) return [];

      const selectFragments = [
        'id',
        columns.has('username') ? 'username' : "'' AS username",
        columns.has('display_name') ? 'display_name' : "NULL AS display_name",
        columns.has('role') ? 'role' : "'student' AS role",
        columns.has('email') ? 'email' : 'NULL AS email',
      ];

      const rows = await query(
        `SELECT ${selectFragments.join(', ')}
           FROM users
          WHERE ${conditions.join(' OR ')}
          ORDER BY id DESC
          LIMIT 20`,
        { keyword: wildcard },
      );

      return rows.map((row) => ({
        id: Number(row.id),
        username: row.username,
        displayName: row.display_name || row.username,
        role: normalizeRole(row.role),
        email: row.email || null,
      }));
    })());

    const majors = (await (async () => {
      if (!(await tableExists('majors'))) {
        return [];
      }
      const columns = await getTableColumns('majors');
      if (!columns.has('name')) {
        return [];
      }
      const conditions = ['name LIKE :keyword'];
      if (columns.has('description')) {
        conditions.push('description LIKE :keyword');
      }

      const selectFragments = [
        'id',
        'name',
        columns.has('description') ? 'description' : 'NULL AS description',
      ];

      const rows = await query(
        `SELECT ${selectFragments.join(', ')}
           FROM majors
          WHERE ${conditions.join(' OR ')}
          ORDER BY id DESC
          LIMIT 20`,
        { keyword: wildcard },
      );
      return rows.map((row) => ({
        id: Number(row.id),
        name: row.name,
        description: row.description || null,
      }));
    })());

    const courses = (await (async () => {
      if (!(await tableExists('courses'))) {
        return [];
      }
      const courseColumns = await getTableColumns('courses');
      if (!courseColumns.has('title')) {
        return [];
      }
      const hasMajors = courseColumns.has('major_id') && (await tableExists('majors'));
      const conditions = [
        'c.title LIKE :keyword',
      ];
      if (courseColumns.has('description')) conditions.push('c.description LIKE :keyword');
      if (courseColumns.has('teacher')) conditions.push('c.teacher LIKE :keyword');

      const selectFragments = [
        'c.id',
        'c.title',
        courseColumns.has('description') ? 'c.description' : 'NULL AS description',
        courseColumns.has('teacher') ? 'c.teacher' : 'NULL AS teacher',
        courseColumns.has('major_id') ? 'c.major_id' : 'NULL AS major_id',
      ];
      if (hasMajors) {
        selectFragments.push('m.name AS major_name');
      }

      const joinClause = hasMajors ? 'LEFT JOIN majors m ON m.id = c.major_id' : '';

      const rows = await query(
        `SELECT ${selectFragments.join(', ')}
           FROM courses c
           ${joinClause}
          WHERE ${conditions.join(' OR ')}
          ORDER BY c.id DESC
          LIMIT 20`,
        { keyword: wildcard },
      );

      return rows.map((row) => ({
        id: Number(row.id),
        title: row.title,
        description: row.description || null,
        teacher: row.teacher || null,
        majorId: row.major_id !== null ? Number(row.major_id) : null,
        majorName: row.major_name || null,
      }));
    })());

    const materials = (await (async () => {
      if (!(await tableExists('course_materials'))) {
        return [];
      }
      const materialColumns = await getTableColumns('course_materials');
      if (!materialColumns.has('title')) {
        return [];
      }

      const hasCourses = await tableExists('courses');
      const selectFragments = [
        'm.id',
        'm.title',
        materialColumns.has('description') ? 'm.description' : 'NULL AS description',
        materialColumns.has('file_url') ? 'm.file_url' : 'NULL AS file_url',
        materialColumns.has('course_id') ? 'm.course_id' : 'NULL AS course_id',
      ];
      if (hasCourses) {
        selectFragments.push('c.title AS course_title');
      }

      const joinClause = hasCourses ? 'LEFT JOIN courses c ON c.id = m.course_id' : '';

      const conditions = ['m.title LIKE :keyword'];
      if (materialColumns.has('description')) {
        conditions.push('m.description LIKE :keyword');
      }

      const rows = await query(
        `SELECT ${selectFragments.join(', ')}
           FROM course_materials m
           ${joinClause}
          WHERE ${conditions.join(' OR ')}
          ORDER BY m.id DESC
          LIMIT 20`,
        { keyword: wildcard },
      );

      return rows.map((row) => ({
        id: Number(row.id),
        title: row.title,
        description: row.description || null,
        fileUrl: row.file_url || null,
        courseId: row.course_id !== null ? Number(row.course_id) : null,
        courseTitle: row.course_title || null,
      }));
    })());

    const forumTopics = (await (async () => {
      if (!(await tableExists('forum_topics'))) {
        return [];
      }
      const columns = await getTableColumns('forum_topics');
      if (!columns.has('title')) {
        return [];
      }

      const conditions = ['title LIKE :keyword'];
      if (columns.has('description')) {
        conditions.push('description LIKE :keyword');
      }

      const selectFragments = [
        'id',
        'title',
        columns.has('description') ? 'description' : 'NULL AS description',
      ];

      const rows = await query(
        `SELECT ${selectFragments.join(', ')}
           FROM forum_topics
          WHERE ${conditions.join(' OR ')}
          ORDER BY id DESC
          LIMIT 20`,
        { keyword: wildcard },
      );

      return rows.map((row) => ({
        id: Number(row.id),
        title: row.title,
        description: row.description || null,
      }));
    })());

    res.json({ users, majors, courses, materials, forumTopics });
  } catch (error) {
    console.error('搜索数据失败', error);
    res.status(500).json({ message: '搜索失败，请稍后重试' });
  }
});

module.exports = router;
