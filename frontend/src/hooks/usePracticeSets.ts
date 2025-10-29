import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PracticeSet } from '../data/dashboard';
import {
  createPracticeSet,
  fetchPracticeSets,
  type CreatePracticePayload,
} from '../services/practiceService';
import { getDashboardFallback } from '../services/dashboardService';
import { DASHBOARD_QUERY_KEY } from './useDashboardData';
import type { AuthUser } from '../context/AuthContext';

export const PRACTICE_QUERY_KEY = ['practice-sets'];

const usePracticeSets = (user: AuthUser | null) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...PRACTICE_QUERY_KEY, user?.id],
    queryFn: () => fetchPracticeSets(user!.id),
    enabled: Boolean(user?.id && user.role === 'student'),
    initialData: user?.role === 'admin' ? [] : getDashboardFallback().practiceSets,
    staleTime: 2 * 60 * 1000,
  });

  const mutation = useMutation({
    mutationFn: (payload: Omit<CreatePracticePayload, 'userId'>) =>
      createPracticeSet({ ...payload, userId: user!.id }),
    onSuccess: (created) => {
      queryClient.setQueryData<PracticeSet[]>([...PRACTICE_QUERY_KEY, user?.id], (previous) =>
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
