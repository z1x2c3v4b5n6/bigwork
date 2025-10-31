import httpClient from './httpClient';

export interface PracticeSetSummary {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  tags: string[];
  questionCount: number;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CreatePracticePayload {
  title: string;
  description?: string;
  difficulty?: string;
  tags?: string[];
  userId?: string;
}

export interface PracticeQuestion {
  id: string;
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
  return (response.data.sets ?? []).map((set, index) => ({
    ...set,
    id: set.id != null ? String(set.id) : String(index + 1),
    questionCount: Number(set.questionCount ?? 0),
  }));
};

export const createPracticeSet = async (payload: CreatePracticePayload): Promise<{ id: string }> => {
  const { userId: _unused, ...rest } = payload;
  const response = await httpClient.post<{ id: number | string }>('/api/practice/sets', rest);
  const id = response.data?.id;
  return { id: id != null ? String(id) : '' };
};

export const fetchPracticeQuestions = async (setId: number | string): Promise<PracticeQuestion[]> => {
  const response = await httpClient.get<{ questions: PracticeQuestion[] }>(`/api/practice/sets/${setId}/questions`);
  return (response.data.questions ?? []).map((question, index) => ({
    ...question,
    id: question.id != null ? String(question.id) : String(index + 1),
  }));
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
): Promise<{ id: string }> => {
  const response = await httpClient.post<{ id: number | string }>(`/api/practice/sets/${setId}/questions`, payload);
  const id = response.data?.id;
  return { id: id != null ? String(id) : '' };
};

export default {
  fetchPracticeSets,
  createPracticeSet,
  fetchPracticeQuestions,
  createPracticeQuestion,
};
