import httpClient from './httpClient';
import type { PracticeSet } from '../data/dashboard';

const practiceEndpoint = import.meta.env.VITE_PRACTICE_ENDPOINT ?? '/api/practice';

export const fetchPracticeSets = async (userId: string): Promise<PracticeSet[]> => {
  const response = await httpClient.get<PracticeSet[]>(practiceEndpoint, {
    params: { userId },
  });
  return response.data;
};

export interface CreatePracticePayload {
  userId: string;
  name: string;
  duration?: number;
  focus?: string;
  difficulty?: PracticeSet['difficulty'];
}

export const createPracticeSet = async (payload: CreatePracticePayload): Promise<PracticeSet> => {
  const response = await httpClient.post<PracticeSet>(practiceEndpoint, payload);
  return response.data;
};

export interface PracticeQuestion {
  id: string;
  practiceSetId: string;
  questionType: 'single' | 'multiple';
  stem: string;
  options: string[];
  correctOptions: number[];
  explanation: string;
  knowledgePoint: string;
}

export const fetchPracticeQuestions = async (setId: string): Promise<PracticeQuestion[]> => {
  const response = await httpClient.get<PracticeQuestion[]>(`${practiceEndpoint}/${setId}/questions`);
  return response.data;
};

export interface SubmitAttemptPayload {
  userId: string;
  answers: { questionId: string; selected: number[] }[];
}

export interface PracticeAttemptResult {
  attemptId: string;
  accuracy: number;
  score: number;
  summary: string;
  detail: { questionId: string; selected: number[]; correct: number[]; isCorrect: boolean }[];
}

export const submitPracticeAttempt = async (
  setId: string,
  payload: SubmitAttemptPayload,
): Promise<PracticeAttemptResult> => {
  const response = await httpClient.post<PracticeAttemptResult>(`${practiceEndpoint}/${setId}/attempt`, payload);
  return response.data;
};
