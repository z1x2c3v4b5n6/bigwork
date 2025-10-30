import httpClient from './httpClient';

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
  createdAt: string | null;
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
  created_at?: string;
  updated_at?: string;
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

export interface AdminForumTopic {
  id: number;
  title: string;
  description: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AdminForumPost {
  id: number;
  content: string;
  author?: string;
  created_at?: string;
  updated_at?: string;
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

export const fetchAdminDashboard = async (): Promise<AdminDashboardResponse> => {
  const response = await httpClient.get<AdminDashboardResponse>('/api/admin/dashboard');
  return response.data;
};

export const fetchAdminSettings = async (): Promise<Record<string, string>> => {
  const response = await httpClient.get<{ settings: Record<string, string> }>('/api/admin/settings');
  return response.data.settings ?? {};
};

export const updateAdminSettings = async (settings: Record<string, string>) => {
  await httpClient.put('/api/admin/settings', { settings });
};

export const fetchAdminUsers = async (): Promise<AdminUser[]> => {
  const response = await httpClient.get<{ users: AdminUser[] }>('/api/admin/users');
  return response.data.users ?? [];
};

export const createAdminUser = async (payload: {
  username: string;
  password: string;
  displayName: string;
  role?: string;
  email?: string;
}) => {
  await httpClient.post('/api/admin/users', payload);
};

export const updateAdminUser = async (id: number, payload: Partial<Omit<AdminUser, 'id'>>) => {
  await httpClient.put(`/api/admin/users/${id}`, payload);
};

export const deleteAdminUser = async (id: number) => {
  await httpClient.delete(`/api/admin/users/${id}`);
};

export const fetchMajors = async (): Promise<MajorRecord[]> => {
  const response = await httpClient.get<{ majors: MajorRecord[] }>('/api/admin/majors');
  return response.data.majors ?? [];
};

export const createMajor = async (payload: { name: string; description?: string }) => {
  await httpClient.post('/api/admin/majors', payload);
};

export const updateMajor = async (id: number, payload: Partial<MajorRecord>) => {
  await httpClient.put(`/api/admin/majors/${id}`, payload);
};

export const deleteMajor = async (id: number) => {
  await httpClient.delete(`/api/admin/majors/${id}`);
};

export const fetchCourses = async (): Promise<CourseRecord[]> => {
  const response = await httpClient.get<{ courses: CourseRecord[] }>('/api/admin/courses');
  return response.data.courses ?? [];
};

export const createCourse = async (payload: {
  title: string;
  description?: string;
  teacher?: string;
  credit?: number;
  majorId?: number;
}) => {
  await httpClient.post('/api/admin/courses', payload);
};

export const updateCourse = async (id: number, payload: Partial<CourseRecord>) => {
  await httpClient.put(`/api/admin/courses/${id}`, payload);
};

export const deleteCourse = async (id: number) => {
  await httpClient.delete(`/api/admin/courses/${id}`);
};

export const fetchMaterials = async (): Promise<MaterialRecord[]> => {
  const response = await httpClient.get<{ materials: MaterialRecord[] }>('/api/admin/materials');
  return response.data.materials ?? [];
};

export const createMaterial = async (payload: {
  title: string;
  description?: string;
  fileUrl?: string;
  courseId?: number;
}) => {
  await httpClient.post('/api/admin/materials', payload);
};

export const updateMaterial = async (id: number, payload: Partial<MaterialRecord>) => {
  await httpClient.put(`/api/admin/materials/${id}`, payload);
};

export const deleteMaterial = async (id: number) => {
  await httpClient.delete(`/api/admin/materials/${id}`);
};

export const fetchAdminStatistics = async (): Promise<StatisticsOverview> => {
  const response = await httpClient.get<StatisticsOverview>('/api/admin/statistics/overview');
  return response.data;
};

export const searchAdminData = async (keyword: string) => {
  const response = await httpClient.get<{
    users: AdminUser[];
    majors: MajorRecord[];
    courses: CourseRecord[];
    materials: MaterialRecord[];
    forumTopics: { id: number; title: string; description: string | null }[];
  }>('/api/admin/statistics/search', { params: { keyword } });
  return response.data;
};

export const fetchAdminForumTopics = async (): Promise<AdminForumTopic[]> => {
  const response = await httpClient.get<{ topics: AdminForumTopic[] }>('/api/admin/forum/topics');
  return response.data.topics ?? [];
};

export const fetchAdminForumPosts = async (topicId: number): Promise<AdminForumPost[]> => {
  const response = await httpClient.get<{ posts: AdminForumPost[] }>(`/api/admin/forum/topics/${topicId}/posts`);
  return response.data.posts ?? [];
};

export const deleteAdminForumTopic = async (topicId: number) => {
  await httpClient.delete(`/api/admin/forum/topics/${topicId}`);
};

export const deleteAdminForumPost = async (postId: number) => {
  await httpClient.delete(`/api/admin/forum/posts/${postId}`);
};

export default {
  fetchAdminDashboard,
  fetchAdminSettings,
  updateAdminSettings,
  fetchAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  fetchMajors,
  createMajor,
  updateMajor,
  deleteMajor,
  fetchCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  fetchMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  fetchAdminStatistics,
  searchAdminData,
  fetchAdminForumTopics,
  fetchAdminForumPosts,
  deleteAdminForumTopic,
  deleteAdminForumPost,
};
