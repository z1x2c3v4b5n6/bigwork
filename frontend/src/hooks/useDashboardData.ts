import { useQuery } from '@tanstack/react-query';
import { fetchDashboardOverview, getDashboardFallback } from '../services/dashboardService';

export const DASHBOARD_QUERY_KEY = ['dashboard-overview'];

const useDashboardData = () =>
  useQuery({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: fetchDashboardOverview,
    initialData: getDashboardFallback(),
    staleTime: 5 * 60 * 1000,
  });

export default useDashboardData;
