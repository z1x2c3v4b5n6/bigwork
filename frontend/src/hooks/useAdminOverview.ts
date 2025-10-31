import { useQuery } from '@tanstack/react-query';
import adminService, { AdminDashboardResponse } from '../services/adminService';

export const ADMIN_OVERVIEW_QUERY_KEY = ['admin-overview'];

const useAdminOverview = () => {
  const overviewQuery = useQuery<AdminDashboardResponse>({
    queryKey: ADMIN_OVERVIEW_QUERY_KEY,
    queryFn: adminService.fetchAdminDashboard,
    staleTime: 60 * 1000,
  });

  return { overviewQuery };
};

export default useAdminOverview;
