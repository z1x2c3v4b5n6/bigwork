import httpClient from './httpClient';
import type {
  FollowedInstitutionSummary,
  InstitutionBrochurePreview,
} from './dashboardService';
import type { ExamProfile, InstitutionProfile } from '../context/AuthContext';

export interface InstitutionDirectoryItem extends FollowedInstitutionSummary {
  isFollowed: boolean;
}

export interface InstitutionDirectoryResponse {
  institutions: InstitutionDirectoryItem[];
}

export interface FollowedInstitutionResponse {
  institutions: FollowedInstitutionSummary[];
}

export interface FollowInstitutionPayload {
  institutionId: string;
  isFollowed: boolean;
  followerCount: number;
}

export interface PublishBrochurePayload {
  title: string;
  summary?: string;
  link?: string;
  publishedAt?: string;
  featured?: boolean;
  status?: 'published' | 'offline';
}

export interface PublishBrochureResponse {
  brochure: InstitutionBrochurePreview;
}

export interface InstitutionMineResponse {
  institutionId: string | null;
  profile: InstitutionProfile | null;
  brochures: InstitutionBrochurePreview[];
  followerCount: number;
  examProfile: ExamProfile | null;
}

export const fetchInstitutionDirectory = async (): Promise<InstitutionDirectoryItem[]> => {
  const { data } = await httpClient.get<InstitutionDirectoryResponse>('/api/institutions');
  return data.institutions;
};

export const fetchFollowedInstitutions = async (): Promise<FollowedInstitutionSummary[]> => {
  const { data } = await httpClient.get<FollowedInstitutionResponse>('/api/institutions/followed');
  return data.institutions;
};

export const toggleFollowInstitution = async (
  institutionId: string,
  follow: boolean,
): Promise<FollowInstitutionPayload> => {
  const { data } = await httpClient.post<FollowInstitutionPayload>(
    `/api/institutions/${institutionId}/follow`,
    { follow },
  );
  return data;
};

export const publishInstitutionBrochure = async (
  payload: PublishBrochurePayload,
): Promise<InstitutionBrochurePreview> => {
  const { data } = await httpClient.post<PublishBrochureResponse>('/api/institutions/brochures', payload);
  return data.brochure;
};

export const fetchMyInstitutionProfile = async (): Promise<InstitutionMineResponse> => {
  const { data } = await httpClient.get<InstitutionMineResponse>('/api/institutions/mine');
  return data;
};
