import { apiRequest } from '../utils/api';

export interface AdminDashboardMetrics {
  activeStudents: number;
  tasksCompletedToday: number;
  followUpsPending: number;
  systemAlerts: number;
}

export interface StudentProgressRow {
  id: number;
  name: string;
  university: string;
  studyHours: number;
  completion: number;
}

export interface AuditLogRow {
  id: number;
  title: string;
  description: string;
  actor?: string;
  created_at?: string | null;
}

export interface AdminDashboardResponse {
  metrics: AdminDashboardMetrics;
  studentProgress: StudentProgressRow[];
  auditLogs: AuditLogRow[];
  administrators: string[];
  securityNote?: string;
}

export interface AdminUser {
  id: number;
  username: string;
  displayName: string;
  role: string;
  email: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface MajorRecord {
  id: number;
  name: string;
  description: string | null;
}

export interface CourseRecord {
  id: number;
  title: string;
  description: string | null;
  teacher: string | null;
  credit: number | null;
  majorId: number | null;
  majorName: string | null;
}

export interface MaterialRecord {
  id: number;
  title: string;
  description: string | null;
  fileUrl: string | null;
  courseId: number | null;
  courseTitle: string | null;
}

export interface ForumTopic {
  id: number;
  title: string;
  description: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ForumPost {
  id: number;
  content: string;
  author?: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface StatisticsOverview {
  totalUsers: number;
  totalMajors: number;
  totalCourses: number;
  totalMaterials: number;
  totalPracticeSets: number;
  totalForumPosts: number;
  lastUpdatedAt: string | null;
}

export interface AdminSearchResult {
  users: AdminUser[];
  majors: MajorRecord[];
  courses: CourseRecord[];
  materials: MaterialRecord[];
  forumTopics: { id: number; title: string; description: string | null }[];
}

const toNumber = (value: unknown): number => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const toNullableNumber = (value: unknown): number | null => {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const toStringSafe = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
};

const toNullableString = (value: unknown): string | null => {
  const str = toStringSafe(value).trim();
  return str ? str : null;
};

export const fetchAdminDashboard = async (): Promise<AdminDashboardResponse> => {
  const response = await apiRequest<Partial<AdminDashboardResponse>>({ path: '/admin/dashboard' });
  const metricsSource = (response?.metrics ?? {}) as Partial<AdminDashboardMetrics>;
  const metrics: AdminDashboardMetrics = {
    activeStudents: toNumber(metricsSource.activeStudents),
    tasksCompletedToday: toNumber(metricsSource.tasksCompletedToday),
    followUpsPending: toNumber(metricsSource.followUpsPending),
    systemAlerts: toNumber(metricsSource.systemAlerts),
  };

  const studentProgress: StudentProgressRow[] = Array.isArray(response?.studentProgress)
    ? response.studentProgress.map((item) => ({
        id: Number(item.id) || 0,
        name: toStringSafe((item as any).name || (item as any).displayName || ''),
        university: toStringSafe((item as any).university || (item as any).targetUniversity || ''),
        studyHours: toNumber((item as any).studyHours ?? (item as any).weeklyStudyHours),
        completion: toNumber((item as any).completion ?? (item as any).completionRate),
      }))
    : [];

  const auditLogs: AuditLogRow[] = Array.isArray(response?.auditLogs)
    ? response.auditLogs.map((item) => ({
        id: Number(item.id) || 0,
        title: toStringSafe((item as any).title || (item as any).action || ''),
        description: toStringSafe((item as any).description || (item as any).detail || ''),
        actor: toNullableString((item as any).actor || (item as any).actor_name) || undefined,
        created_at: toNullableString((item as any).created_at || (item as any).createdAt) || null,
      }))
    : [];

  const administrators: string[] = Array.isArray(response?.administrators)
    ? response.administrators
        .map((name) => toStringSafe(name).trim())
        .filter((name) => Boolean(name))
    : [];

  return {
    metrics,
    studentProgress,
    auditLogs,
    administrators,
    securityNote: toNullableString(response?.securityNote) || undefined,
  };
};

export const fetchAdminSettings = async (): Promise<Record<string, string>> => {
  const response = await apiRequest<{ settings?: Record<string, unknown> }>({ path: '/admin/settings' });
  const settings = response?.settings ?? {};
  const result: Record<string, string> = {};
  Object.keys(settings).forEach((key) => {
    const value = settings[key];
    if (value !== undefined && value !== null) {
      result[key] = toStringSafe(value);
    }
  });
  return result;
};

export const updateAdminSettings = async (settings: Record<string, string>) => {
  await apiRequest({ path: '/admin/settings', method: 'PUT', data: { settings } });
};

export const fetchAdminUsers = async (): Promise<AdminUser[]> => {
  const response = await apiRequest<{ users?: any[] }>({ path: '/admin/users' });
  const rows = Array.isArray(response?.users) ? response.users : [];
  return rows.map((row) => ({
    id: Number(row.id) || 0,
    username: toStringSafe(row.username),
    displayName: toStringSafe(row.displayName || row.display_name || row.username),
    role: toStringSafe(row.role || row.user_role || 'student'),
    email: toNullableString(row.email),
    created_at: toNullableString(row.created_at || row.createdAt) || null,
    updated_at: toNullableString(row.updated_at || row.updatedAt) || null,
  }));
};

export const createAdminUser = async (payload: {
  username: string;
  password: string;
  displayName: string;
  email?: string;
  role?: string;
}) => {
  await apiRequest({ path: '/admin/users', method: 'POST', data: payload });
};

export const updateAdminUser = async (id: number, payload: Partial<AdminUser>) => {
  await apiRequest({ path: `/admin/users/${id}`, method: 'PUT', data: payload });
};

export const deleteAdminUser = async (id: number) => {
  await apiRequest({ path: `/admin/users/${id}`, method: 'DELETE' });
};

export const fetchMajors = async (): Promise<MajorRecord[]> => {
  const response = await apiRequest<{ majors?: any[] }>({ path: '/admin/majors' });
  const rows = Array.isArray(response?.majors) ? response.majors : [];
  return rows.map((row) => ({
    id: Number(row.id) || 0,
    name: toStringSafe(row.name || row.title || '未命名专业'),
    description: toNullableString(row.description || row.detail || row.intro),
  }));
};

export const createMajor = async (payload: { name: string; description?: string }) => {
  await apiRequest({ path: '/admin/majors', method: 'POST', data: payload });
};

export const deleteMajor = async (id: number) => {
  await apiRequest({ path: `/admin/majors/${id}`, method: 'DELETE' });
};

export const fetchCourses = async (): Promise<CourseRecord[]> => {
  const response = await apiRequest<{ courses?: any[] }>({ path: '/admin/courses' });
  const rows = Array.isArray(response?.courses) ? response.courses : [];
  return rows.map((row) => ({
    id: Number(row.id) || 0,
    title: toStringSafe(row.title || row.name || '未命名课程'),
    description: toNullableString(row.description || row.detail || row.intro),
    teacher: toNullableString(row.teacher || row.instructor) || null,
    credit: toNullableNumber(row.credit),
    majorId: toNullableNumber(row.majorId || row.major_id),
    majorName: toNullableString(row.majorName || row.major_name),
  }));
};

export const createCourse = async (payload: {
  title: string;
  description?: string;
  teacher?: string;
  credit?: number;
  majorId?: number;
}) => {
  await apiRequest({ path: '/admin/courses', method: 'POST', data: payload });
};

export const deleteCourse = async (id: number) => {
  await apiRequest({ path: `/admin/courses/${id}`, method: 'DELETE' });
};

export const fetchMaterials = async (): Promise<MaterialRecord[]> => {
  const response = await apiRequest<{ materials?: any[] }>({ path: '/admin/materials' });
  const rows = Array.isArray(response?.materials) ? response.materials : [];
  return rows.map((row) => ({
    id: Number(row.id) || 0,
    title: toStringSafe(row.title || row.name || '未命名资料'),
    description: toNullableString(row.description || row.detail || row.intro),
    fileUrl: toNullableString(row.fileUrl || row.file_url || row.url),
    courseId: toNullableNumber(row.courseId || row.course_id),
    courseTitle: toNullableString(row.courseTitle || row.course_title),
  }));
};

export const createMaterial = async (payload: {
  title: string;
  description?: string;
  fileUrl?: string;
  courseId?: number;
}) => {
  await apiRequest({ path: '/admin/materials', method: 'POST', data: payload });
};

export const deleteMaterial = async (id: number) => {
  await apiRequest({ path: `/admin/materials/${id}`, method: 'DELETE' });
};

export const fetchForumTopics = async (): Promise<ForumTopic[]> => {
  const response = await apiRequest<{ topics?: any[] }>({ path: '/admin/forum/topics' });
  const rows = Array.isArray(response?.topics) ? response.topics : [];
  return rows.map((row) => ({
    id: Number(row.id) || 0,
    title: toStringSafe(row.title || row.name || '未命名话题'),
    description: toNullableString(row.description || row.detail),
    created_at: toNullableString(row.created_at || row.createdAt) || null,
    updated_at: toNullableString(row.updated_at || row.updatedAt) || null,
  }));
};

export const fetchForumPosts = async (topicId: string | number): Promise<ForumPost[]> => {
  const response = await apiRequest<{ posts?: any[] }>({
    path: `/admin/forum/topics/${topicId}/posts`,
  });
  const rows = Array.isArray(response?.posts) ? response.posts : [];
  return rows.map((row) => ({
    id: Number(row.id) || 0,
    content: toStringSafe(row.content || row.body || ''),
    author: toNullableString(row.author || row.author_name) || undefined,
    created_at: toNullableString(row.created_at || row.createdAt) || null,
    updated_at: toNullableString(row.updated_at || row.updatedAt) || null,
  }));
};

export const deleteForumTopic = async (topicId: number) => {
  await apiRequest({ path: `/admin/forum/topics/${topicId}`, method: 'DELETE' });
};

export const deleteForumPost = async (postId: number) => {
  await apiRequest({ path: `/admin/forum/posts/${postId}`, method: 'DELETE' });
};

export const fetchAdminStatistics = async (): Promise<StatisticsOverview> => {
  const response = await apiRequest<Partial<StatisticsOverview>>({ path: '/admin/statistics/overview' });
  return {
    totalUsers: toNumber(response?.totalUsers),
    totalMajors: toNumber(response?.totalMajors),
    totalCourses: toNumber(response?.totalCourses),
    totalMaterials: toNumber(response?.totalMaterials),
    totalPracticeSets: toNumber(response?.totalPracticeSets),
    totalForumPosts: toNumber(response?.totalForumPosts),
    lastUpdatedAt: toNullableString(response?.lastUpdatedAt) || null,
  };
};

export const searchAdminData = async (keyword: string): Promise<AdminSearchResult> => {
  const response = await apiRequest<Partial<AdminSearchResult>>({
    path: '/admin/statistics/search',
    data: { keyword },
  });
  return {
    users: Array.isArray(response?.users)
      ? response.users.map((user: any) => ({
          id: Number(user.id) || 0,
          username: toStringSafe(user.username),
          displayName: toStringSafe(user.displayName || user.display_name || user.username),
          role: toStringSafe(user.role || 'student'),
          email: toNullableString(user.email),
          created_at: toNullableString(user.created_at || user.createdAt) || null,
          updated_at: toNullableString(user.updated_at || user.updatedAt) || null,
        }))
      : [],
    majors: Array.isArray(response?.majors)
      ? response.majors.map((major: any) => ({
          id: Number(major.id) || 0,
          name: toStringSafe(major.name || major.title || '未命名专业'),
          description: toNullableString(major.description || major.detail || major.intro),
        }))
      : [],
    courses: Array.isArray(response?.courses)
      ? response.courses.map((course: any) => ({
          id: Number(course.id) || 0,
          title: toStringSafe(course.title || course.name || '未命名课程'),
          description: toNullableString(course.description || course.detail || course.intro),
          teacher: toNullableString(course.teacher || course.instructor) || null,
          credit: toNullableNumber(course.credit),
          majorId: toNullableNumber(course.majorId || course.major_id),
          majorName: toNullableString(course.majorName || course.major_name),
        }))
      : [],
    materials: Array.isArray(response?.materials)
      ? response.materials.map((material: any) => ({
          id: Number(material.id) || 0,
          title: toStringSafe(material.title || material.name || '未命名资料'),
          description: toNullableString(material.description || material.detail || material.intro),
          fileUrl: toNullableString(material.fileUrl || material.file_url || material.url),
          courseId: toNullableNumber(material.courseId || material.course_id),
          courseTitle: toNullableString(material.courseTitle || material.course_title),
        }))
      : [],
    forumTopics: Array.isArray(response?.forumTopics)
      ? response.forumTopics.map((topic: any) => ({
          id: Number(topic.id) || 0,
          title: toStringSafe(topic.title || topic.name || '未命名话题'),
          description: toNullableString(topic.description || topic.detail),
        }))
      : [],
  };
};
