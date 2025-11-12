
import { adminReferenceSites } from '../../data/admin';
import { apiRequest, type ApiError } from '../../utils/api';
import { ensureSession } from '../../utils/session';

type AdminTab =
  | 'overview'
  | 'settings'
  | 'users'
  | 'majors'
  | 'courses'
  | 'materials'
  | 'forum'
  | 'statistics';

type MetricCard = { id: string; label: string; value: number };

type StudentProgressRow = {
  id: number;
  name: string;
  university: string;
  studyHours: number;
  completion: number;
};

type AuditLogRow = {
  id: number;
  title: string;
  description: string;
  actor?: string;
  created_at?: string | null;
};

type AdminUser = {
  id: number;
  username: string;
  displayName: string;
  role: string;
  email: string | null;
  created_at?: string | null;
};

type MajorRecord = {
  id: number;
  name: string;
  description: string | null;
};

type CourseRecord = {
  id: number;
  title: string;
  teacher: string | null;
  credit: number | null;
  description: string | null;
  majorId: number | null;
  majorName?: string | null;
};

type MaterialRecord = {
  id: number;
  title: string;
  description: string | null;
  fileUrl: string | null;
  courseId: number | null;
  courseTitle?: string | null;
};

type ForumTopic = {
  id: number;
  title: string;
  description: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type ForumPost = {
  id: number;
  content: string;
  author?: string;
  created_at?: string | null;
  updated_at?: string | null;
};

type StatisticsOverview = {
  totalUsers: number;
  totalMajors: number;
  totalCourses: number;
  totalMaterials: number;
  totalPracticeSets: number;
  totalForumPosts: number;
  lastUpdatedAt: string | null;
};

type AdminSearchResult = {
  users: AdminUser[];
  majors: MajorRecord[];
  courses: CourseRecord[];
  materials: MaterialRecord[];
  forumTopics: { id: number; title: string; description: string | null }[];
};

type UserForm = {
  username: string;
  password: string;
  displayName: string;
  email: string;
  role: string;
};

type MajorForm = { name: string; description: string };

type CourseForm = {
  title: string;
  teacher: string;
  credit: string;
  description: string;
  majorId: string;
};

type MaterialForm = {
  title: string;
  description: string;
  fileUrl: string;
  courseId: string;
};

const tabs: { id: AdminTab; label: string }[] = [
  { id: 'overview', label: '总览' },
  { id: 'settings', label: '基本信息' },
  { id: 'users', label: '用户' },
  { id: 'majors', label: '专业' },
  { id: 'courses', label: '课程' },
  { id: 'materials', label: '资料' },
  { id: 'forum', label: '论坛' },
  { id: 'statistics', label: '统计' },
];

const createUserForm = (): UserForm => ({
  username: '',
  password: '',
  displayName: '',
  email: '',
  role: 'student',
});

const createMajorForm = (): MajorForm => ({ name: '', description: '' });

const createCourseForm = (majors: MajorRecord[] = []): CourseForm => ({
  title: '',
  teacher: '',
  credit: '',
  description: '',
  majorId: majors[0] ? String(majors[0].id) : '',
});

const createMaterialForm = (courses: MaterialRecord[] | CourseRecord[] = []): MaterialForm => ({
  title: '',
  description: '',
  fileUrl: '',
  courseId: courses[0] ? String(courses[0].id) : '',
});

const createSettingsForm = (settings: Record<string, string> = {}): Record<string, string> => ({
  platform_name: settings.platform_name ?? '',
  support_email: settings.support_email ?? '',
  security_note: settings.security_note ?? '',
});

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (!error) {
    return fallback;
  }

  if (typeof error === 'string') {
    return error || fallback;
  }

  const apiError = error as ApiError;
  if (apiError?.message) {
    return apiError.message;
  }

  const maybeResponse = (error as { response?: { data?: { message?: string } } }).response;
  if (maybeResponse?.data?.message) {
    return maybeResponse.data.message;
  }

  return fallback;
};

Page({
  data: {
    tabs,
    activeTab: 'overview' as AdminTab,
    referenceSites: adminReferenceSites,
    globalError: '',
    sectionLoading: {
      overview: false,
      settings: false,
      users: false,
      majors: false,
      courses: false,
      materials: false,
      forum: false,
      statistics: false,
    } as Record<AdminTab, boolean>,
    sectionErrors: {
      overview: '',
      settings: '',
      users: '',
      majors: '',
      courses: '',
      materials: '',
      forum: '',
      statistics: '',
    } as Record<AdminTab, string>,
    loadedTabs: {
      overview: false,
      settings: false,
      users: false,
      majors: false,
      courses: false,
      materials: false,
      forum: false,
      statistics: false,
    } as Record<AdminTab, boolean>,
    metricsCards: [] as MetricCard[],
    dashboardNote: '',
    studentProgress: [] as StudentProgressRow[],
    auditLogs: [] as AuditLogRow[],
    administrators: [] as string[],
    users: [] as AdminUser[],
    majors: [] as MajorRecord[],
    courses: [] as CourseRecord[],
    materials: [] as MaterialRecord[],
    statistics: null as StatisticsOverview | null,
    forumTopics: [] as ForumTopic[],
    forumPosts: [] as ForumPost[],
    forumPostsLoading: false,
    forumPostsError: '',
    selectedTopicId: '',
    settingsForm: createSettingsForm(),
    settingsFormError: '',
    settingsMessage: '',
    settingsSubmitting: false,
    roleOptions: [
      { value: 'student', label: '学员' },
      { value: 'admin', label: '管理员' },
    ],
    userFormVisible: false,
    userForm: createUserForm(),
    userFormError: '',
    userSubmitting: false,
    userRoleIndex: 0,
    updatingUserId: null as number | null,
    majorFormVisible: false,
    majorForm: createMajorForm(),
    majorFormError: '',
    majorSubmitting: false,
    courseFormVisible: false,
    courseForm: createCourseForm(),
    courseFormError: '',
    courseSubmitting: false,
    majorsForCourses: [] as MajorRecord[],
    courseFormMajorIndex: 0,
    materialFormVisible: false,
    materialForm: createMaterialForm(),
    materialFormError: '',
    materialSubmitting: false,
    coursesForMaterials: [] as CourseRecord[],
    materialFormCourseIndex: 0,
    statisticsSearchKeyword: '',
    statisticsSearchLoading: false,
    statisticsSearchError: '',
    statisticsSearchResult: null as AdminSearchResult | null,
  },

  async onShow() {
    await this.initialize();
  },

  async initialize() {
    this.setData({
      globalError: '',
      'sectionLoading.overview': true,
      'sectionErrors.overview': '',
    });

    try {
      await ensureSession();
    } catch (error) {
      const message = getErrorMessage(error, '请先登录后再访问后台管理。');
      this.setData({
        globalError: message,
        'sectionLoading.overview': false,
      });
      return;
    }

    await this.loadOverview();
  },

  switchTab(event: WechatMiniprogram.BaseEvent) {
    const tab = event.currentTarget?.dataset?.tab as AdminTab | undefined;
    if (!tab || tab === this.data.activeTab) {
      return;
    }

    this.setData({ activeTab: tab });

    if (!this.data.loadedTabs[tab]) {
      void this.loadTab(tab);
    }
  },

  async loadTab(tab: AdminTab) {
    switch (tab) {
      case 'overview':
        await this.loadOverview();
        break;
      case 'settings':
        await this.loadSettings();
        break;
      case 'users':
        await this.loadUsers();
        break;
      case 'majors':
        await this.loadMajors();
        break;
      case 'courses':
        await this.loadCourses();
        break;
      case 'materials':
        await this.loadMaterials();
        break;
      case 'forum':
        await this.loadForum();
        break;
      case 'statistics':
        await this.loadStatistics();
        break;
      default:
        break;
    }
  },

  async loadOverview() {
    this.setData({
      'sectionLoading.overview': true,
      'sectionErrors.overview': '',
    });

    try {
      const response = await apiRequest<{
        metrics?: Partial<Record<string, number>>;
        studentProgress?: StudentProgressRow[];
        auditLogs?: AuditLogRow[];
        administrators?: string[];
        securityNote?: string;
      }>({ path: '/admin/dashboard' });

      const metrics = response.metrics ?? {};
      const metricCards: MetricCard[] = [
        { id: 'activeStudents', label: '活跃学员', value: metrics.activeStudents ?? 0 },
        { id: 'tasksCompletedToday', label: '今日完成任务', value: metrics.tasksCompletedToday ?? 0 },
        { id: 'followUpsPending', label: '待跟进提醒', value: metrics.followUpsPending ?? 0 },
        { id: 'systemAlerts', label: '系统告警', value: metrics.systemAlerts ?? 0 },
      ];

      this.setData({
        metricsCards,
        studentProgress: Array.isArray(response.studentProgress) ? response.studentProgress : [],
        auditLogs: Array.isArray(response.auditLogs) ? response.auditLogs : [],
        administrators: Array.isArray(response.administrators) ? response.administrators : [],
        dashboardNote: response.securityNote || '',
        'loadedTabs.overview': true,
      });
    } catch (error) {
      this.setData({
        'sectionErrors.overview': getErrorMessage(error, '无法加载后台概览数据，请稍后重试。'),
      });
    } finally {
      this.setData({ 'sectionLoading.overview': false });
    }
  },

  async loadSettings() {
    this.setData({
      'sectionLoading.settings': true,
      'sectionErrors.settings': '',
      settingsFormError: '',
      settingsMessage: '',
    });

    try {
      const response = await apiRequest<{ settings?: Record<string, string> }>({ path: '/admin/settings' });
      const form = createSettingsForm(response?.settings ?? {});
      this.setData({
        settingsForm: form,
        'loadedTabs.settings': true,
      });
    } catch (error) {
      this.setData({ 'sectionErrors.settings': getErrorMessage(error, '无法加载平台基础信息。') });
    } finally {
      this.setData({ 'sectionLoading.settings': false });
    }
  },

  handleSettingsInput(event: WechatMiniprogram.Input) {
    const field = event.currentTarget?.dataset?.field as string | undefined;
    if (!field) {
      return;
    }

    const value = event.detail?.value ?? '';
    this.setData({
      settingsForm: { ...this.data.settingsForm, [field]: value },
      settingsFormError: '',
      settingsMessage: '',
    });
  },

  async submitSettings() {
    if (this.data.settingsSubmitting) {
      return;
    }

    const platformName = (this.data.settingsForm.platform_name ?? '').trim();
    if (!platformName) {
      this.setData({ settingsFormError: '请填写平台名称。', settingsMessage: '' });
      return;
    }

    const supportEmail = (this.data.settingsForm.support_email ?? '').trim();
    const securityNote = (this.data.settingsForm.security_note ?? '').trim();

    this.setData({
      settingsSubmitting: true,
      settingsFormError: '',
      settingsMessage: '',
    });

    try {
      await apiRequest({
        path: '/admin/settings',
        method: 'PUT',
        data: {
          settings: {
            platform_name: platformName,
            support_email: supportEmail,
            security_note: securityNote,
          },
        },
      });
      this.setData({ settingsMessage: '设置已保存。' });
      wx.showToast({ title: '已保存', icon: 'success' });
      await this.loadOverview();
    } catch (error) {
      this.setData({ settingsFormError: getErrorMessage(error, '保存失败，请稍后重试。') });
    } finally {
      this.setData({ settingsSubmitting: false });
    }
  },

  async loadUsers() {
    this.setData({ 'sectionLoading.users': true, 'sectionErrors.users': '' });

    try {
      const response = await apiRequest<{ users?: AdminUser[] }>({ path: '/admin/users' });
      this.setData({
        users: Array.isArray(response.users) ? response.users : [],
        'loadedTabs.users': true,
      });
    } catch (error) {
      this.setData({ 'sectionErrors.users': getErrorMessage(error, '无法加载用户列表。') });
    } finally {
      this.setData({ 'sectionLoading.users': false });
    }
  },

  openUserForm() {
    const roleIndex = this.data.roleOptions.findIndex((option) => option.value === this.data.userForm.role);
    this.setData({
      userFormVisible: true,
      userFormError: '',
      userRoleIndex: roleIndex >= 0 ? roleIndex : 0,
    });
  },

  closeUserForm() {
    if (this.data.userSubmitting) {
      return;
    }
    this.setData({
      userFormVisible: false,
      userForm: createUserForm(),
      userFormError: '',
      userRoleIndex: 0,
    });
  },

  handleUserInput(event: WechatMiniprogram.Input) {
    const field = event.currentTarget?.dataset?.field as keyof UserForm | undefined;
    if (!field) {
      return;
    }

    const value = event.detail.value ?? '';
    this.setData({
      userForm: { ...this.data.userForm, [field]: value },
      userFormError: '',
    });
  },

  handleUserRolePicker(event: WechatMiniprogram.PickerChange) {
    const index = Number(event.detail.value ?? 0);
    const nextRole = this.data.roleOptions[index]?.value ?? 'student';
    this.setData({
      userRoleIndex: index,
      userForm: { ...this.data.userForm, role: nextRole },
      userFormError: '',
    });
  },

  async submitUserForm() {
    if (this.data.userSubmitting) {
      return;
    }

    const form = this.data.userForm;
    if (!form.username.trim() || !form.password.trim() || !form.displayName.trim()) {
      this.setData({ userFormError: '请完整填写用户名、密码与姓名。' });
      return;
    }

    this.setData({ userSubmitting: true, userFormError: '' });

    try {
      await apiRequest({
        path: '/admin/users',
        method: 'POST',
        data: {
          username: form.username.trim(),
          password: form.password.trim(),
          displayName: form.displayName.trim(),
          email: form.email.trim() || undefined,
          role: form.role,
        },
      });
      wx.showToast({ title: '已创建', icon: 'success' });
      this.closeUserForm();
      await this.loadUsers();
    } catch (error) {
      this.setData({ userFormError: getErrorMessage(error, '创建用户失败，请稍后重试。') });
    } finally {
      this.setData({ userSubmitting: false });
    }
  },

  async handleUserRoleChange(event: WechatMiniprogram.PickerChange) {
    const id = Number(event.currentTarget?.dataset?.id ?? 0);
    if (!id) {
      return;
    }

    const index = Number(event.detail.value ?? 0);
    const role = this.data.roleOptions[index]?.value ?? 'student';

    if (this.data.updatingUserId === id && this.data.users.find((user) => user.id === id)?.role === role) {
      return;
    }

    this.setData({ updatingUserId: id });

    try {
      await apiRequest({ path: `/admin/users/${id}`, method: 'PUT', data: { role } });
      this.setData({
        users: this.data.users.map((user) => (user.id === id ? { ...user, role } : user)),
      });
      wx.showToast({ title: '已更新', icon: 'success' });
    } catch (error) {
      wx.showToast({ title: getErrorMessage(error, '更新角色失败'), icon: 'none' });
    } finally {
      this.setData({ updatingUserId: null });
    }
  },

  async confirmDeleteUser(event: WechatMiniprogram.BaseEvent) {
    const id = Number(event.currentTarget?.dataset?.id ?? 0);
    const name = event.currentTarget?.dataset?.name ?? '';
    if (!id) {
      return;
    }

    const { confirm } = await wx.showModal({
      title: '删除用户',
      content: `确定要删除 ${name || '该用户'} 吗？`,
      confirmText: '删除',
      confirmColor: '#d14343',
    });

    if (!confirm) {
      return;
    }

    try {
      await apiRequest({ path: `/admin/users/${id}`, method: 'DELETE' });
      wx.showToast({ title: '已删除', icon: 'success' });
      await this.loadUsers();
    } catch (error) {
      wx.showToast({ title: getErrorMessage(error, '删除失败，请稍后重试。'), icon: 'none' });
    }
  },

  async loadMajors() {
    this.setData({ 'sectionLoading.majors': true, 'sectionErrors.majors': '' });

    try {
      const response = await apiRequest<{ majors?: MajorRecord[] }>({ path: '/admin/majors' });
      const majors = Array.isArray(response.majors) ? response.majors : [];
      this.setData({
        majors,
        'loadedTabs.majors': true,
      });
      this.syncCourseFormMajor(majors);
    } catch (error) {
      this.setData({ 'sectionErrors.majors': getErrorMessage(error, '无法加载专业信息。') });
    } finally {
      this.setData({ 'sectionLoading.majors': false });
    }
  },

  openMajorForm() {
    this.setData({ majorFormVisible: true, majorFormError: '' });
  },

  closeMajorForm() {
    if (this.data.majorSubmitting) {
      return;
    }
    this.setData({
      majorFormVisible: false,
      majorForm: createMajorForm(),
      majorFormError: '',
    });
  },

  handleMajorInput(event: WechatMiniprogram.Input) {
    const field = event.currentTarget?.dataset?.field as keyof MajorForm | undefined;
    if (!field) {
      return;
    }

    const value = event.detail.value ?? '';
    this.setData({
      majorForm: { ...this.data.majorForm, [field]: value },
      majorFormError: '',
    });
  },

  async submitMajorForm() {
    if (this.data.majorSubmitting) {
      return;
    }

    const form = this.data.majorForm;
    if (!form.name.trim()) {
      this.setData({ majorFormError: '请输入专业名称。' });
      return;
    }

    this.setData({ majorSubmitting: true, majorFormError: '' });

    try {
      await apiRequest({
        path: '/admin/majors',
        method: 'POST',
        data: {
          name: form.name.trim(),
          description: form.description.trim() || undefined,
        },
      });
      wx.showToast({ title: '已创建', icon: 'success' });
      this.closeMajorForm();
      await this.loadMajors();
    } catch (error) {
      this.setData({ majorFormError: getErrorMessage(error, '创建专业失败，请稍后重试。') });
    } finally {
      this.setData({ majorSubmitting: false });
    }
  },

  async confirmDeleteMajor(event: WechatMiniprogram.BaseEvent) {
    const id = Number(event.currentTarget?.dataset?.id ?? 0);
    const name = event.currentTarget?.dataset?.name ?? '';
    if (!id) {
      return;
    }

    const { confirm } = await wx.showModal({
      title: '删除专业',
      content: `确定要删除 ${name || '该专业'} 吗？`,
      confirmText: '删除',
      confirmColor: '#d14343',
    });

    if (!confirm) {
      return;
    }

    try {
      await apiRequest({ path: `/admin/majors/${id}`, method: 'DELETE' });
      wx.showToast({ title: '已删除', icon: 'success' });
      await this.loadMajors();
      if (this.data.loadedTabs.courses) {
        await this.loadCourses();
      }
    } catch (error) {
      wx.showToast({ title: getErrorMessage(error, '删除失败，请稍后重试。'), icon: 'none' });
    }
  },

  syncCourseFormMajor(majors: MajorRecord[]) {
    if (!Array.isArray(majors) || majors.length === 0) {
      this.setData({
        majorsForCourses: [],
        courseFormMajorIndex: 0,
        courseForm: { ...this.data.courseForm, majorId: '' },
      });
      return;
    }

    const currentId = this.data.courseForm.majorId;
    const index = majors.findIndex((major) => String(major.id) === currentId);
    const nextIndex = index >= 0 ? index : 0;
    this.setData({
      majorsForCourses: majors,
      courseFormMajorIndex: nextIndex,
      courseForm: { ...this.data.courseForm, majorId: String(majors[nextIndex].id) },
    });
  },

  async loadCourses() {
    this.setData({ 'sectionLoading.courses': true, 'sectionErrors.courses': '' });

    try {
      if (!this.data.loadedTabs.majors) {
        await this.loadMajors();
      }

      const response = await apiRequest<{ courses?: CourseRecord[] }>({ path: '/admin/courses' });
      const courses = Array.isArray(response.courses) ? response.courses : [];
      this.setData({
        courses,
        coursesForMaterials: courses,
        'loadedTabs.courses': true,
      });
      this.syncMaterialFormCourse(courses);
    } catch (error) {
      this.setData({ 'sectionErrors.courses': getErrorMessage(error, '无法加载课程列表。') });
    } finally {
      this.setData({ 'sectionLoading.courses': false });
    }
  },

  openCourseForm() {
    const majors = this.data.majorsForCourses;
    const nextForm = createCourseForm(majors);
    const index = majors.findIndex((major) => String(major.id) === nextForm.majorId);
    this.setData({
      courseFormVisible: true,
      courseFormError: '',
      courseForm: nextForm,
      courseFormMajorIndex: index >= 0 ? index : 0,
    });
  },

  closeCourseForm() {
    if (this.data.courseSubmitting) {
      return;
    }
    const majors = this.data.majorsForCourses;
    const nextForm = createCourseForm(majors);
    const index = majors.findIndex((major) => String(major.id) === nextForm.majorId);
    this.setData({
      courseFormVisible: false,
      courseFormError: '',
      courseForm: nextForm,
      courseFormMajorIndex: index >= 0 ? index : 0,
    });
  },

  handleCourseInput(event: WechatMiniprogram.Input) {
    const field = event.currentTarget?.dataset?.field as keyof CourseForm | undefined;
    if (!field) {
      return;
    }

    const value = event.detail.value ?? '';
    this.setData({
      courseForm: { ...this.data.courseForm, [field]: value },
      courseFormError: '',
    });
  },

  handleCourseMajorChange(event: WechatMiniprogram.PickerChange) {
    const index = Number(event.detail.value ?? 0);
    const major = this.data.majorsForCourses[index];
    this.setData({
      courseFormMajorIndex: index,
      courseForm: { ...this.data.courseForm, majorId: major ? String(major.id) : '' },
      courseFormError: '',
    });
  },

  async submitCourseForm() {
    if (this.data.courseSubmitting) {
      return;
    }

    const form = this.data.courseForm;
    if (!form.title.trim()) {
      this.setData({ courseFormError: '请输入课程名称。' });
      return;
    }

    if (!form.majorId) {
      this.setData({ courseFormError: '请选择所属专业。' });
      return;
    }

    if (form.credit.trim() && Number.isNaN(Number(form.credit))) {
      this.setData({ courseFormError: '学分请输入数字。' });
      return;
    }

    const creditValue = form.credit.trim() ? Number(form.credit) : undefined;

    this.setData({ courseSubmitting: true, courseFormError: '' });

    try {
      await apiRequest({
        path: '/admin/courses',
        method: 'POST',
        data: {
          title: form.title.trim(),
          teacher: form.teacher.trim() || undefined,
          credit: creditValue,
          description: form.description.trim() || undefined,
          majorId: form.majorId,
        },
      });
      wx.showToast({ title: '已创建', icon: 'success' });
      this.closeCourseForm();
      await this.loadCourses();
    } catch (error) {
      this.setData({ courseFormError: getErrorMessage(error, '创建课程失败，请稍后重试。') });
    } finally {
      this.setData({ courseSubmitting: false });
    }
  },

  async confirmDeleteCourse(event: WechatMiniprogram.BaseEvent) {
    const id = Number(event.currentTarget?.dataset?.id ?? 0);
    const title = event.currentTarget?.dataset?.name ?? '';
    if (!id) {
      return;
    }

    const { confirm } = await wx.showModal({
      title: '删除课程',
      content: `确定要删除 ${title || '该课程'} 吗？`,
      confirmText: '删除',
      confirmColor: '#d14343',
    });

    if (!confirm) {
      return;
    }

    try {
      await apiRequest({ path: `/admin/courses/${id}`, method: 'DELETE' });
      wx.showToast({ title: '已删除', icon: 'success' });
      await this.loadCourses();
    } catch (error) {
      wx.showToast({ title: getErrorMessage(error, '删除失败，请稍后重试。'), icon: 'none' });
    }
  },

  syncMaterialFormCourse(courses: CourseRecord[]) {
    if (!Array.isArray(courses) || courses.length === 0) {
      this.setData({
        coursesForMaterials: [],
        materialFormCourseIndex: 0,
        materialForm: { ...this.data.materialForm, courseId: '' },
      });
      return;
    }

    const currentId = this.data.materialForm.courseId;
    const index = courses.findIndex((course) => String(course.id) === currentId);
    const nextIndex = index >= 0 ? index : 0;
    this.setData({
      coursesForMaterials: courses,
      materialFormCourseIndex: nextIndex,
      materialForm: { ...this.data.materialForm, courseId: String(courses[nextIndex].id) },
    });
  },

  async loadMaterials() {
    this.setData({ 'sectionLoading.materials': true, 'sectionErrors.materials': '' });

    try {
      if (!this.data.loadedTabs.courses) {
        await this.loadCourses();
      }

      const response = await apiRequest<{ materials?: MaterialRecord[] }>({ path: '/admin/materials' });
      this.setData({
        materials: Array.isArray(response.materials) ? response.materials : [],
        'loadedTabs.materials': true,
      });
    } catch (error) {
      this.setData({ 'sectionErrors.materials': getErrorMessage(error, '无法加载资料列表。') });
    } finally {
      this.setData({ 'sectionLoading.materials': false });
    }
  },

  openMaterialForm() {
    const courses = this.data.coursesForMaterials;
    const nextForm = createMaterialForm(courses);
    const index = courses.findIndex((course) => String(course.id) === nextForm.courseId);
    this.setData({
      materialFormVisible: true,
      materialFormError: '',
      materialForm: nextForm,
      materialFormCourseIndex: index >= 0 ? index : 0,
    });
  },

  closeMaterialForm() {
    if (this.data.materialSubmitting) {
      return;
    }
    const courses = this.data.coursesForMaterials;
    const nextForm = createMaterialForm(courses);
    const index = courses.findIndex((course) => String(course.id) === nextForm.courseId);
    this.setData({
      materialFormVisible: false,
      materialFormError: '',
      materialForm: nextForm,
      materialFormCourseIndex: index >= 0 ? index : 0,
    });
  },

  handleMaterialInput(event: WechatMiniprogram.Input) {
    const field = event.currentTarget?.dataset?.field as keyof MaterialForm | undefined;
    if (!field) {
      return;
    }

    const value = event.detail.value ?? '';
    this.setData({
      materialForm: { ...this.data.materialForm, [field]: value },
      materialFormError: '',
    });
  },

  handleMaterialCourseChange(event: WechatMiniprogram.PickerChange) {
    const index = Number(event.detail.value ?? 0);
    const course = this.data.coursesForMaterials[index];
    this.setData({
      materialFormCourseIndex: index,
      materialForm: { ...this.data.materialForm, courseId: course ? String(course.id) : '' },
      materialFormError: '',
    });
  },

  async submitMaterialForm() {
    if (this.data.materialSubmitting) {
      return;
    }

    const form = this.data.materialForm;
    if (!form.title.trim()) {
      this.setData({ materialFormError: '请输入资料标题。' });
      return;
    }

    this.setData({ materialSubmitting: true, materialFormError: '' });

    try {
      await apiRequest({
        path: '/admin/materials',
        method: 'POST',
        data: {
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          fileUrl: form.fileUrl.trim() || undefined,
          courseId: form.courseId || undefined,
        },
      });
      wx.showToast({ title: '已创建', icon: 'success' });
      this.closeMaterialForm();
      await this.loadMaterials();
    } catch (error) {
      this.setData({ materialFormError: getErrorMessage(error, '创建资料失败，请稍后重试。') });
    } finally {
      this.setData({ materialSubmitting: false });
    }
  },

  async confirmDeleteMaterial(event: WechatMiniprogram.BaseEvent) {
    const id = Number(event.currentTarget?.dataset?.id ?? 0);
    const title = event.currentTarget?.dataset?.name ?? '';
    if (!id) {
      return;
    }

    const { confirm } = await wx.showModal({
      title: '删除资料',
      content: `确定要删除 ${title || '该资料'} 吗？`,
      confirmText: '删除',
      confirmColor: '#d14343',
    });

    if (!confirm) {
      return;
    }

    try {
      await apiRequest({ path: `/admin/materials/${id}`, method: 'DELETE' });
      wx.showToast({ title: '已删除', icon: 'success' });
      await this.loadMaterials();
    } catch (error) {
      wx.showToast({ title: getErrorMessage(error, '删除失败，请稍后重试。'), icon: 'none' });
    }
  },

  async loadForum() {
    this.setData({ 'sectionLoading.forum': true, 'sectionErrors.forum': '', forumPostsError: '' });

    try {
      const response = await apiRequest<{ topics?: ForumTopic[] }>({ path: '/admin/forum/topics' });
      const topics = Array.isArray(response.topics) ? response.topics : [];
      let selectedTopicId = this.data.selectedTopicId;
      if (!selectedTopicId && topics.length > 0) {
        selectedTopicId = String(topics[0].id);
      } else if (selectedTopicId && topics.every((topic) => String(topic.id) !== selectedTopicId)) {
        selectedTopicId = topics.length > 0 ? String(topics[0].id) : '';
      }

      this.setData({
        forumTopics: topics,
        selectedTopicId,
        forumPosts: [],
        'loadedTabs.forum': true,
      });

      if (selectedTopicId) {
        await this.loadForumPosts(selectedTopicId);
      }
    } catch (error) {
      this.setData({ 'sectionErrors.forum': getErrorMessage(error, '无法加载论坛数据。') });
    } finally {
      this.setData({ 'sectionLoading.forum': false });
    }
  },

  async loadForumPosts(topicId: string) {
    if (!topicId) {
      this.setData({ forumPosts: [], forumPostsLoading: false });
      return;
    }

    this.setData({ forumPostsLoading: true, forumPostsError: '' });

    try {
      const response = await apiRequest<{ posts?: ForumPost[] }>({
        path: `/admin/forum/topics/${topicId}/posts`,
      });
      this.setData({ forumPosts: Array.isArray(response.posts) ? response.posts : [] });
    } catch (error) {
      this.setData({ forumPostsError: getErrorMessage(error, '无法加载帖子列表。'), forumPosts: [] });
    } finally {
      this.setData({ forumPostsLoading: false });
    }
  },

  handleSelectTopic(event: WechatMiniprogram.BaseEvent) {
    const topicId = event.currentTarget?.dataset?.id;
    if (!topicId || topicId === this.data.selectedTopicId) {
      return;
    }

    this.setData({ selectedTopicId: topicId, forumPostsError: '' });
    void this.loadForumPosts(topicId);
  },

  async confirmDeleteTopic(event: WechatMiniprogram.BaseEvent) {
    const topicId = Number(event.currentTarget?.dataset?.id ?? 0);
    const title = event.currentTarget?.dataset?.name ?? '';
    if (!topicId) {
      return;
    }

    const { confirm } = await wx.showModal({
      title: '删除话题',
      content: `确定要删除 ${title || '该话题'} 吗？`,
      confirmText: '删除',
      confirmColor: '#d14343',
    });

    if (!confirm) {
      return;
    }

    try {
      await apiRequest({ path: `/admin/forum/topics/${topicId}`, method: 'DELETE' });
      wx.showToast({ title: '已删除', icon: 'success' });
      await this.loadForum();
    } catch (error) {
      wx.showToast({ title: getErrorMessage(error, '删除失败，请稍后重试。'), icon: 'none' });
    }
  },

  async confirmDeletePost(event: WechatMiniprogram.BaseEvent) {
    const postId = Number(event.currentTarget?.dataset?.id ?? 0);
    const topicId = this.data.selectedTopicId;
    if (!postId || !topicId) {
      return;
    }

    const { confirm } = await wx.showModal({
      title: '删除回复',
      content: '确定要删除这条回复吗？',
      confirmText: '删除',
      confirmColor: '#d14343',
    });

    if (!confirm) {
      return;
    }

    try {
      await apiRequest({ path: `/admin/forum/posts/${postId}`, method: 'DELETE' });
      wx.showToast({ title: '已删除', icon: 'success' });
      await this.loadForumPosts(topicId);
      await this.loadForum();
    } catch (error) {
      wx.showToast({ title: getErrorMessage(error, '删除失败，请稍后重试。'), icon: 'none' });
    }
  },

  async loadStatistics() {
    this.setData({ 'sectionLoading.statistics': true, 'sectionErrors.statistics': '' });

    try {
      const response = await apiRequest<StatisticsOverview>({ path: '/admin/statistics/overview' });
      this.setData({ statistics: response, 'loadedTabs.statistics': true });
    } catch (error) {
      this.setData({ 'sectionErrors.statistics': getErrorMessage(error, '无法加载统计信息。') });
    } finally {
      this.setData({ 'sectionLoading.statistics': false });
    }
  },

  handleStatisticsKeywordInput(event: WechatMiniprogram.Input) {
    const value = event.detail?.value ?? '';
    this.setData({ statisticsSearchKeyword: value, statisticsSearchError: '' });
  },

  clearStatisticsSearch() {
    if (this.data.statisticsSearchLoading) {
      return;
    }
    this.setData({
      statisticsSearchKeyword: '',
      statisticsSearchResult: null,
      statisticsSearchError: '',
    });
  },

  async submitStatisticsSearch() {
    if (this.data.statisticsSearchLoading) {
      return;
    }

    const keyword = this.data.statisticsSearchKeyword.trim();
    if (!keyword) {
      this.setData({ statisticsSearchResult: null, statisticsSearchError: '请输入要查询的关键词。' });
      return;
    }

    this.setData({ statisticsSearchLoading: true, statisticsSearchError: '' });

    try {
      const result = await apiRequest<AdminSearchResult>({
        path: '/admin/statistics/search',
        data: { keyword },
      });
      const sanitized: AdminSearchResult = {
        users: Array.isArray(result?.users) ? result.users : [],
        majors: Array.isArray(result?.majors) ? result.majors : [],
        courses: Array.isArray(result?.courses) ? result.courses : [],
        materials: Array.isArray(result?.materials) ? result.materials : [],
        forumTopics: Array.isArray(result?.forumTopics) ? result.forumTopics : [],
      };
      this.setData({ statisticsSearchResult: sanitized });
    } catch (error) {
      this.setData({
        statisticsSearchError: getErrorMessage(error, '查询失败，请稍后再试。'),
        statisticsSearchResult: null,
      });
    } finally {
      this.setData({ statisticsSearchLoading: false });
    }
  },

  retrySection(event: WechatMiniprogram.BaseEvent) {
    const tab = event.currentTarget?.dataset?.tab as AdminTab | undefined;
    if (!tab) {
      return;
    }
    void this.loadTab(tab);
  },

  copyLink(event: WechatMiniprogram.BaseEvent) {
    const url = event.currentTarget?.dataset?.url;
    if (!url) {
      return;
    }

    wx.setClipboardData({ data: url })
      .then(() => {
        wx.showToast({ title: '链接已复制', icon: 'success' });
      })
      .catch((error) => {
        console.warn('复制失败', error);
        wx.showToast({ title: '复制失败，请手动复制', icon: 'none' });
      });
  },
});
