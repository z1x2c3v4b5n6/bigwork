import httpClient from './httpClient';
import type { PracticeSet } from '../data/dashboard';

const practiceEndpoint = import.meta.env.VITE_PRACTICE_ENDPOINT ?? '/api/practice';

export const fetchPracticeSets = async (): Promise<PracticeSet[]> => {
  const response = await httpClient.get<PracticeSet[]>(practiceEndpoint);
  return response.data;
};

export interface CreatePracticePayload {
  name: string;
  questions?: number;
  duration?: number;
  focus?: string;
  difficulty?: PracticeSet['difficulty'];
}

export const createPracticeSet = async (payload: CreatePracticePayload): Promise<PracticeSet> => {
  const response = await httpClient.post<PracticeSet>(practiceEndpoint, payload);
  return response.data;
};
