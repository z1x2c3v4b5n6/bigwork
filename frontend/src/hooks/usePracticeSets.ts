import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PracticeSet } from '../data/dashboard';
import { createPracticeSet, fetchPracticeSets, type CreatePracticePayload } from '../services/practiceService';
import { getDashboardFallback } from '../services/dashboardService';
import { DASHBOARD_QUERY_KEY } from './useDashboardData';

export const PRACTICE_QUERY_KEY = ['practice-sets'];

const usePracticeSets = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: PRACTICE_QUERY_KEY,
    queryFn: fetchPracticeSets,
    initialData: getDashboardFallback().practiceSets,
    staleTime: 2 * 60 * 1000,
  });

  const mutation = useMutation({
    mutationFn: (payload: CreatePracticePayload) => createPracticeSet(payload),
    onSuccess: (created) => {
      queryClient.setQueryData<PracticeSet[]>(PRACTICE_QUERY_KEY, (previous) =>
        previous ? [created, ...previous] : [created],
      );
      queryClient.setQueryData(DASHBOARD_QUERY_KEY, (previous: unknown) => {
        if (!previous || typeof previous !== 'object') {
          return previous;
        }
        const dashboard = previous as { practiceSets?: PracticeSet[] };
        const nextSets = [created, ...(dashboard.practiceSets ?? [])];
        return { ...previous, practiceSets: nextSets };
      });
    },
  });

  return {
    ...query,
    createPractice: mutation.mutateAsync,
    isCreating: mutation.isPending,
  };
};

export default usePracticeSets;
