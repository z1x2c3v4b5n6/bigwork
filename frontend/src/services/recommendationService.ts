import httpClient from './httpClient';

export interface UniversityRecommendationItem {
  id: string;
  name: string;
  province: string;
  level: string;
  category: string;
  tags: string[];
  scoreWindow: string;
  highlights: string;
  matchLevel: '稳妥' | '冲刺' | '保底' | '高风险';
  matchReason: string;
  interviewFocus: string[];
}

export interface InterviewTimelineStep {
  stage: string;
  items: string[];
}

export interface InterviewResourceItem {
  name: string;
  url: string;
  description: string;
}

export interface InterviewPreparationPayload {
  timeline: InterviewTimelineStep[];
  suggestions: string[];
  focusTopics: string[];
  resources: InterviewResourceItem[];
}

export interface UniversityRecommendationResponse {
  totalScore: number;
  scoreBand: string;
  summary: string;
  strategy: string[];
  recommendedUniversities: UniversityRecommendationItem[];
  interviewPreparation: InterviewPreparationPayload;
}

export const recommendUniversities = async (payload: {
  totalScore: number;
  targetMajor?: string;
}): Promise<UniversityRecommendationResponse> => {
  const { data } = await httpClient.post<UniversityRecommendationResponse>(
    '/api/learning/recommendations/universities',
    payload,
  );
  return data;
};
