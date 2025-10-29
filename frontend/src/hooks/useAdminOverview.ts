import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCourseDraft,
  fetchAdminOverview,
  publishCourseDraft,
  type AdminOverview,
  type AdminCourse,
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

  const createCourseMutation = useMutation({
    mutationFn: (payload: CreateCourseDraftPayload) => createCourseDraft(payload),
    onSuccess: (draft) => {
      queryClient.setQueryData<AdminOverview | undefined>(ADMIN_OVERVIEW_QUERY_KEY, (previous) => {
        if (!previous) {
          return previous;
        }
        return {
          ...previous,
          courses: [draft, ...previous.courses],
          courseDrafts: [draft, ...previous.courseDrafts],
        };
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_OVERVIEW_QUERY_KEY });
    },
  });

  const publishCourseMutation = useMutation({
    mutationFn: (draftId: string) => publishCourseDraft(draftId),
    onSuccess: (draft) => {
      if (!draft || !(draft as AdminCourse).id) {
        return;
      }
      queryClient.setQueryData<AdminOverview | undefined>(ADMIN_OVERVIEW_QUERY_KEY, (previous) => {
        if (!previous) {
          return previous;
        }
        const drafts = previous.courseDrafts
          .map((item) => (item.id === draft.id ? draft : item))
          .filter((item) => item.status !== 'published');
        const courses = previous.courses.map((item) => (item.id === draft.id ? draft : item));
        return { ...previous, courseDrafts: drafts, courses };
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_OVERVIEW_QUERY_KEY });
    },
  });

  return {
    overviewQuery,
    createCourseMutation,
    publishCourseMutation,
  };
};

export default useAdminOverview;
