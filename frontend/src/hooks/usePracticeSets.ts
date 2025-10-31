import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PracticeSet } from '../data/dashboard';
import {
  createPracticeSet,
  fetchPracticeSets,
  type CreatePracticePayload,
  type PracticeSetSummary,
} from '../services/practiceService';
import { getDashboardFallback } from '../services/dashboardService';
import { DASHBOARD_QUERY_KEY } from './useDashboardData';
import type { AuthUser } from '../context/AuthContext';

export const PRACTICE_QUERY_KEY = ['practice-sets'];

const mapPracticeSetToSummary = (set: PracticeSet): PracticeSetSummary => {
  const tags = set.focus
    ? set.focus
        .split(/[、,，·\s]+/)
        .map((token) => token.trim())
        .filter(Boolean)
    : [];

  return {
    id: set.id,
    title: set.name,
    description: set.latestSummary ?? set.focus ?? '系统推荐题单',
    difficulty: set.difficulty ?? '基础',
    tags,
    questionCount: set.questions,
    createdAt: set.lastAttempt ?? null,
    updatedAt: set.lastAttempt ?? null,
  };
};

const usePracticeSets = (user: AuthUser | null) => {
  const queryClient = useQueryClient();
  const fallbackData = useMemo<PracticeSetSummary[]>(() => {
    if (!user || user.role === 'admin') {
      return [];
    }

    const fallback = getDashboardFallback();
    return fallback.practiceSets.map(mapPracticeSetToSummary);
  }, [user?.id, user?.role]);

  const query = useQuery({
    queryKey: [...PRACTICE_QUERY_KEY, user?.id],
    queryFn: fetchPracticeSets,
    enabled: Boolean(user?.id && user.role === 'student'),
    initialData: fallbackData,
    staleTime: 2 * 60 * 1000,
  });

  const mutation = useMutation({
    mutationFn: (payload: Omit<CreatePracticePayload, 'userId'>) =>
      createPracticeSet({ ...payload, userId: user!.id }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [...PRACTICE_QUERY_KEY, user?.id] }),
        queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY }),
      ]);
    },
  });

  return {
    ...query,
    createPractice: mutation.mutateAsync,
    isCreating: mutation.isPending,
  };
};

export default usePracticeSets;
