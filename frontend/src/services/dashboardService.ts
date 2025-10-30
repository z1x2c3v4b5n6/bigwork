import httpClient from './httpClient';
import {
  CourseProgress,
  DashboardFallbackData,
  DashboardStat,
  PracticeSet,
  ScheduleItem,
  dashboardFallback,
} from '../data/dashboard';
import type { UserRole } from '../context/AuthContext';
import type { AdminCourse } from './adminService';

export interface AdminFocusSummary {
  courseDrafts: AdminCourse[];
  reviewQueue: { id: string; title: string; content: string; createdAt?: string }[];
  recentRegistrations: { id: string; name: string; majorName: string; createdAt?: string }[];
  dataQuality: { majors: number; practiceSets: number; forumTopics: number };
}

export interface DashboardOverview {
  role: UserRole;
  userName: string;
  stats: DashboardStat[];
  courses: CourseProgress[];
  practiceSets: PracticeSet[];
  schedule: ScheduleItem[];
  recommendation: string;
  adminFocus?: AdminFocusSummary;
}

const dashboardEndpoint = import.meta.env.VITE_DASHBOARD_ENDPOINT ?? '/api/learning/dashboard';

const mergeWithFallback = (payload: DashboardOverview | undefined): DashboardOverview => {
  const fallback = dashboardFallback;
  if (!payload || payload.role === 'student') {
    const stats = payload?.stats?.length
      ? payload.stats.map((stat) => ({
          ...stat,
          accent:
            stat.accent ??
            fallback.stats.find((item) => item.id === stat.id)?.accent ??
            fallback.stats[0].accent,
        }))
      : fallback.stats;

    return {
      role: payload?.role ?? 'student',
      userName: payload?.userName ?? fallback.userName,
      stats,
      courses: payload?.courses && payload.courses.length > 0 ? payload.courses : fallback.courses,
      practiceSets:
        payload?.practiceSets && payload.practiceSets.length > 0
          ? payload.practiceSets
          : fallback.practiceSets,
      schedule: payload?.schedule && payload.schedule.length > 0 ? payload.schedule : fallback.schedule,
      recommendation: payload?.recommendation ?? fallback.recommendation,
    };
  }

  return payload;
};

export const fetchDashboardOverview = async (
  params: { userId: string; role: UserRole },
): Promise<DashboardOverview> => {
  const response = await httpClient.get<DashboardOverview>(dashboardEndpoint, {
    params,
  });
  return mergeWithFallback(response.data);
};

export const getDashboardFallback = (): DashboardOverview => mergeWithFallback(undefined);
