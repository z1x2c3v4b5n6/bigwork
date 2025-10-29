import httpClient from './httpClient';
import type { AuthUser } from '../context/AuthContext';

export interface MajorOption {
  id: string;
  name: string;
  description?: string;
}

export const fetchUserProfile = async (userId: string): Promise<AuthUser> => {
  const response = await httpClient.get<AuthUser>(`/api/users/${userId}`);
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
): Promise<AuthUser> => {
  const response = await httpClient.patch<AuthUser>(`/api/users/${userId}`, payload);
  return response.data;
};

export const fetchMajors = async (): Promise<MajorOption[]> => {
  const response = await httpClient.get<MajorOption[]>('/api/majors');
  return response.data;
};
