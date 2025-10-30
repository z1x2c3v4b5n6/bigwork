import httpClient from './httpClient';

export interface PracticeSetSummary {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  tags: string[];
  questionCount: number;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface PracticeQuestion {
  id: number;
  questionText: string;
  answerText: string;
  explanation: string;
  tags: string[];
  difficulty: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export const fetchPracticeSets = async (): Promise<PracticeSetSummary[]> => {
  const response = await httpClient.get<{ sets: PracticeSetSummary[] }>('/api/practice/sets');
  return response.data.sets ?? [];
};

export const createPracticeSet = async (payload: {
  title: string;
  description?: string;
  difficulty?: string;
  tags?: string[];
}): Promise<{ id: number }> => {
  const response = await httpClient.post<{ id: number }>('/api/practice/sets', payload);
  return response.data;
};

export const fetchPracticeQuestions = async (setId: number | string): Promise<PracticeQuestion[]> => {
  const response = await httpClient.get<{ questions: PracticeQuestion[] }>(`/api/practice/sets/${setId}/questions`);
  return response.data.questions ?? [];
};

export const createPracticeQuestion = async (
  setId: number | string,
  payload: {
    questionText: string;
    answerText?: string;
    explanation?: string;
    tags?: string[];
    difficulty?: string;
  },
): Promise<{ id: number }> => {
  const response = await httpClient.post<{ id: number }>(`/api/practice/sets/${setId}/questions`, payload);
  return response.data;
};

export default {
  fetchPracticeSets,
  createPracticeSet,
  fetchPracticeQuestions,
  createPracticeQuestion,
};
