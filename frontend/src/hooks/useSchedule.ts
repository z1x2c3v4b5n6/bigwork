import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ScheduleItem } from '../data/dashboard';
import { createScheduleItem, fetchSchedule, type CreateSchedulePayload } from '../services/scheduleService';
import { getDashboardFallback } from '../services/dashboardService';
import { DASHBOARD_QUERY_KEY } from './useDashboardData';

export const SCHEDULE_QUERY_KEY = ['study-schedule'];

const useSchedule = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: SCHEDULE_QUERY_KEY,
    queryFn: fetchSchedule,
    initialData: getDashboardFallback().schedule,
    staleTime: 2 * 60 * 1000,
  });

  const mutation = useMutation({
    mutationFn: (payload: CreateSchedulePayload) => createScheduleItem(payload),
    onSuccess: (created) => {
      queryClient.setQueryData<ScheduleItem[]>(SCHEDULE_QUERY_KEY, (previous) =>
        previous ? [created, ...previous] : [created],
      );
      queryClient.setQueryData(DASHBOARD_QUERY_KEY, (previous: unknown) => {
        if (!previous || typeof previous !== 'object') {
          return previous;
        }
        const dashboard = previous as { schedule?: ScheduleItem[] };
        const nextSchedule = [created, ...(dashboard.schedule ?? [])].slice(0, 6);
        return { ...previous, schedule: nextSchedule };
      });
    },
  });

  return {
    ...query,
    createSchedule: mutation.mutateAsync,
    isCreating: mutation.isPending,
  };
};

export default useSchedule;
