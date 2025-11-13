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
import type { CourseRecord } from './adminService';

export interface AdminFocusSummary {
  courseDrafts: CourseRecord[];
  reviewQueue: { id: string; title: string; content: string; createdAt?: string }[];
  recentRegistrations: { id: string; name: string; majorName: string; createdAt?: string }[];
  dataQuality: { majors: number; practiceSets: number; forumTopics: number };
}

export interface InstitutionBrochurePreview {
  id: string;
  title: string;
  summary: string;
  publishedAt: string;
  link?: string;
}

export interface FollowedInstitutionSummary {
  id: string;
  name: string;
  shortName: string;
  location: string;
  tags: string[];
  officialWebsite: string;
  focus: string;
  followerCount: number;
  historicalData: { year: number; enrollment: number | null; scoreLine: number | null; note?: string }[];
  latestBrochure: InstitutionBrochurePreview | null;
  brochures: InstitutionBrochurePreview[];
  lastUpdatedAt?: string | null;
}

export interface DashboardPushMessage {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  type?: string;
  action?: { label: string; url: string } | null;
}

export interface SubjectHighlight {
  combination: string;
  recommendedMajors: string[];
  suggestion: string;
}

export interface DashboardOverview {
  role: UserRole;
  userName: string;
  stats: DashboardStat[];
  courses: CourseProgress[];
  practiceSets: PracticeSet[];
  schedule: ScheduleItem[];
  recommendation: string;
  pushMessages?: DashboardPushMessage[];
  followedInstitutions?: FollowedInstitutionSummary[];
  subjectHighlights?: SubjectHighlight[];
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
      pushMessages:
        payload?.pushMessages && payload.pushMessages.length > 0
          ? payload.pushMessages
          : fallback.pushMessages ?? [],
      followedInstitutions:
        payload?.followedInstitutions ?? fallback.followedInstitutions ?? [],
      subjectHighlights:
        payload?.subjectHighlights && payload.subjectHighlights.length > 0
          ? payload.subjectHighlights
          : fallback.subjectHighlights ?? [],
    };
  }

  return {
    ...payload,
    pushMessages: payload?.pushMessages ?? [],
    followedInstitutions: payload?.followedInstitutions ?? [],
    subjectHighlights: payload?.subjectHighlights ?? [],
  };
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
