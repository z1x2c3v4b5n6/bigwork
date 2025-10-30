import { useQuery } from '@tanstack/react-query';
import { fetchDashboardOverview, getDashboardFallback } from '../services/dashboardService';
import type { AuthUser } from '../context/AuthContext';

export const DASHBOARD_QUERY_KEY = ['dashboard-overview'];

const useDashboardData = (user: AuthUser | null) =>
  useQuery({
    queryKey: [...DASHBOARD_QUERY_KEY, user?.id, user?.role],
    queryFn: () => fetchDashboardOverview({ userId: user!.id, role: user!.role }),
    enabled: Boolean(user?.id),
    initialData: user?.role === 'admin' ? undefined : getDashboardFallback(),
    staleTime: 5 * 60 * 1000,
  });

export default useDashboardData;
