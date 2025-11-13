import httpClient from './httpClient';
import type { AuthUser } from '../context/AuthContext';

export interface MajorOption {
  id: string;
  name: string;
  description?: string;
  subjectTags?: string[];
}

export type UserProfile = AuthUser & {
  phone?: string | null;
  organization?: string | null;
  goal?: string | null;
  majorId?: string | null;
  majorName?: string | null;
  bio?: string | null;
};

export const fetchUserProfile = async (userId: string): Promise<UserProfile> => {
  const response = await httpClient.get<UserProfile>(`/api/users/${userId}`);
  return response.data;
};

export const updateUserProfile = async (
  userId: string,
  payload: Partial<{
    name: string;
    email: string;
    phone: string;
    organization: string;
    goal: string;
    avatar: string;
    bio: string;
    majorId: string | null;
  }>,
): Promise<UserProfile> => {
  const response = await httpClient.patch<UserProfile>(`/api/users/${userId}`, payload);
  return response.data;
};

export const fetchMajors = async (): Promise<MajorOption[]> => {
  const response = await httpClient.get<MajorOption[]>('/api/majors');
  return response.data;
};

export const updateExamProfile = async (
  userId: string,
  payload: Partial<{
    totalScore: number | null;
    targetMajor: string | null;
    mathSubject: string | null;
    englishSubject: string | null;
    majorId: string | null;
    majorTags: string[];
  }> = {},
): Promise<UserProfile> => {
  const response = await httpClient.put<{ profile?: UserProfile }>(
    `/api/users/${userId}/exam-profile`,
    payload,
  );
  if (response.data.profile) {
    return response.data.profile;
  }
  return fetchUserProfile(userId);
};
