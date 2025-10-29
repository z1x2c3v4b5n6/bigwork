import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCourseDraft,
  fetchAdminOverview,
  publishCourseDraft,
  triggerAdminSync,
  type AdminOverview,
  type CourseDraft,
  type CreateCourseDraftPayload,
} from '../services/adminService';

export const ADMIN_OVERVIEW_QUERY_KEY = ['admin-overview'];

const useAdminOverview = () => {
  const queryClient = useQueryClient();

  const overviewQuery = useQuery({
    queryKey: ADMIN_OVERVIEW_QUERY_KEY,
    queryFn: fetchAdminOverview,
    staleTime: 60 * 1000,
  });

  const syncMutation = useMutation({
    mutationFn: () => triggerAdminSync(),
    onSuccess: (data) => {
      queryClient.setQueryData<AdminOverview | undefined>(ADMIN_OVERVIEW_QUERY_KEY, (previous) =>
        previous ? { ...previous, lastSyncAt: data.lastSyncAt } : previous,
      );
    },
  });

  const createCourseMutation = useMutation({
    mutationFn: (payload: CreateCourseDraftPayload) => createCourseDraft(payload),
    onSuccess: (draft) => {
      queryClient.setQueryData<AdminOverview | undefined>(ADMIN_OVERVIEW_QUERY_KEY, (previous) =>
        previous ? { ...previous, courseDrafts: [draft, ...previous.courseDrafts] } : previous,
      );
    },
  });

  const publishCourseMutation = useMutation({
    mutationFn: (draftId: string) => publishCourseDraft(draftId),
    onSuccess: (draft) => {
      if (!draft || !(draft as CourseDraft).id) {
        return;
      }
      queryClient.setQueryData<AdminOverview | undefined>(ADMIN_OVERVIEW_QUERY_KEY, (previous) => {
        if (!previous) {
          return previous;
        }
        const drafts = previous.courseDrafts.map((item) => (item.id === draft.id ? draft : item));
        return { ...previous, courseDrafts: drafts };
      });
    },
  });

  return {
    overviewQuery,
    syncMutation,
    createCourseMutation,
    publishCourseMutation,
  };
};

export default useAdminOverview;
