import httpClient from './httpClient';

export interface AdminStat {
  label: string;
  value: string;
  helper: string;
  trend: string;
}

export interface AdminHighlight {
  title: string;
  detail: string;
}

export interface ReviewQueueItem {
  id: string;
  title: string;
  description: string;
  priority: '高' | '中' | '低';
}

export interface CourseDraft {
  id: string;
  name: string;
  category: string;
  status: '待发布' | '已发布' | '待完善';
  teacher: string;
  updatedAt: string;
  releaseWindow?: string;
}

export interface AdminOverview {
  lastSyncAt: string;
  stats: AdminStat[];
  aiHighlights: AdminHighlight[];
  reviewQueue: ReviewQueueItem[];
  courseDrafts: CourseDraft[];
}

const adminOverviewEndpoint = import.meta.env.VITE_ADMIN_OVERVIEW_ENDPOINT ?? '/api/admin/overview';
const adminCoursesEndpoint = import.meta.env.VITE_ADMIN_COURSES_ENDPOINT ?? '/api/admin/courses';
const adminSyncEndpoint = import.meta.env.VITE_ADMIN_SYNC_ENDPOINT ?? '/api/admin/sync';

export const fetchAdminOverview = async (): Promise<AdminOverview> => {
  const response = await httpClient.get<AdminOverview>(adminOverviewEndpoint);
  return response.data;
};

export interface CreateCourseDraftPayload {
  name: string;
  category: string;
  teacher: string;
  releaseWindow?: string;
}

export const createCourseDraft = async (payload: CreateCourseDraftPayload): Promise<CourseDraft> => {
  const response = await httpClient.post<CourseDraft>(adminCoursesEndpoint, payload);
  return response.data;
};

export const publishCourseDraft = async (draftId: string): Promise<CourseDraft> => {
  const response = await httpClient.post<CourseDraft>(`${adminCoursesEndpoint}/${draftId}/publish`);
  return response.data;
};

export const triggerAdminSync = async (): Promise<{ lastSyncAt: string }> => {
  const response = await httpClient.post<{ lastSyncAt: string }>(adminSyncEndpoint);
  return response.data;
};
