import httpClient from './httpClient';
import {
  CourseProgress,
  DashboardFallbackData,
  DashboardStat,
  PracticeSet,
  ScheduleItem,
  dashboardFallback,
} from '../data/dashboard';

export interface DashboardOverview {
  userName: string;
  stats: DashboardStat[];
  courses: CourseProgress[];
  practiceSets: PracticeSet[];
  schedule: ScheduleItem[];
  recommendation: string;
}

const dashboardEndpoint = import.meta.env.VITE_DASHBOARD_ENDPOINT ?? '/api/dashboard';

const mergeWithFallback = (payload: Partial<DashboardOverview> | undefined): DashboardOverview => {
  const fallback = dashboardFallback;

  const mergeStats = (stats?: DashboardStat[]): DashboardStat[] => {
    if (!stats || stats.length === 0) {
      return fallback.stats;
    }

    return stats.map((stat) => {
      const fallbackStat = fallback.stats.find((item) => item.id === stat.id);
      return {
        ...fallbackStat,
        ...stat,
        accent: stat.accent ?? fallbackStat?.accent ?? fallback.stats[0].accent,
      } as DashboardStat;
    });
  };

  return {
    userName: payload?.userName ?? fallback.userName,
    stats: mergeStats(payload?.stats),
    courses: payload?.courses && payload.courses.length > 0 ? payload.courses : fallback.courses,
    practiceSets:
      payload?.practiceSets && payload.practiceSets.length > 0
        ? payload.practiceSets
        : fallback.practiceSets,
    schedule: payload?.schedule && payload.schedule.length > 0 ? payload.schedule : fallback.schedule,
    recommendation: payload?.recommendation ?? fallback.recommendation,
  };
};

export const fetchDashboardOverview = async (): Promise<DashboardOverview> => {
  const response = await httpClient.get<Partial<DashboardOverview>>(dashboardEndpoint);
  return mergeWithFallback(response.data);
};

export const getDashboardFallback = (): DashboardFallbackData => dashboardFallback;
