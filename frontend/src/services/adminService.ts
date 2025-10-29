import httpClient from './httpClient';

export interface AdminTotals {
  students: number;
  majors: number;
  courses: number;
  materials: number;
  forumTopics: number;
}

export interface AdminCourse {
  id: string;
  title: string;
  category: string;
  teacher: string;
  progress: number;
  status: string;
  majorName?: string;
  releaseWindow?: string;
}

export interface AdminMaterial {
  id: string;
  title: string;
  type: string;
  url: string;
  description: string;
  courseId: string;
  courseName: string;
  createdAt?: string;
}

export interface AdminForumItem {
  id: string;
  title: string;
  needsModeration: boolean;
  commentCount: number;
  createdAt?: string;
}

export interface AdminUserItem {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  majorName: string;
  createdAt?: string;
}

export interface AdminOverview {
  totals: AdminTotals;
  majors: { id: string; name: string }[];
  courses: AdminCourse[];
  courseDrafts: AdminCourse[];
  materials: AdminMaterial[];
  forum: AdminForumItem[];
  users: AdminUserItem[];
}

const adminOverviewEndpoint = import.meta.env.VITE_ADMIN_OVERVIEW_ENDPOINT ?? '/api/admin/overview';
const adminCoursesEndpoint = import.meta.env.VITE_ADMIN_COURSES_ENDPOINT ?? '/api/admin/courses';
const majorsEndpoint = import.meta.env.VITE_MAJORS_ENDPOINT ?? '/api/majors';
const materialsEndpoint = import.meta.env.VITE_MATERIALS_ENDPOINT ?? '/api/materials';

export const fetchAdminOverview = async (): Promise<AdminOverview> => {
  const response = await httpClient.get<AdminOverview>(adminOverviewEndpoint);
  return response.data;
};

export interface CreateCourseDraftPayload {
  name: string;
  category: string;
  teacher: string;
  majorId?: string;
  releaseWindow?: string;
  summary?: string;
}

export const createCourseDraft = async (payload: CreateCourseDraftPayload): Promise<AdminCourse> => {
  const response = await httpClient.post<AdminCourse>(adminCoursesEndpoint, payload);
  return response.data;
};

export const publishCourseDraft = async (draftId: string): Promise<AdminCourse> => {
  const response = await httpClient.post<AdminCourse>(`${adminCoursesEndpoint}/${draftId}/publish`);
  return response.data;
};

export const createMajor = async (payload: { name: string; description?: string }) => {
  const response = await httpClient.post<{ id: string; name: string; description?: string }>(majorsEndpoint, payload);
  return response.data;
};

export interface CreateMaterialPayload {
  courseId: string;
  title: string;
  type: string;
  url?: string;
  description?: string;
}

export const createMaterial = async (payload: CreateMaterialPayload): Promise<AdminMaterial> => {
  const response = await httpClient.post<AdminMaterial>(materialsEndpoint, payload);
  return response.data;
};
