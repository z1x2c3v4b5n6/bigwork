import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AuthUser } from '../context/AuthContext';
import {
  createForumComment,
  createForumTopic,
  fetchForumTopics,
  toggleForumLike,
  type ForumTopic,
} from '../services/forumService';

export const FORUM_QUERY_KEY = ['forum-topics'];

const useForum = (user: AuthUser | null) => {
  const queryClient = useQueryClient();

  const topicsQuery = useQuery({
    queryKey: [...FORUM_QUERY_KEY, user?.id],
    queryFn: () => fetchForumTopics(user?.id),
    enabled: Boolean(user?.id),
    staleTime: 60 * 1000,
  });

  const createTopicMutation = useMutation({
    mutationFn: (payload: { title: string; content: string; tags?: string[] }) =>
      createForumTopic({ authorId: user!.id, ...payload }),
    onSuccess: (created) => {
      queryClient.setQueryData<ForumTopic[] | undefined>([...FORUM_QUERY_KEY, user?.id], (previous) => {
        if (!previous) {
          return [created];
        }
        return [created, ...previous];
      });
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: (payload: { topicId: string; content: string }) =>
      createForumComment({ topicId: payload.topicId, authorId: user!.id, content: payload.content }),
    onSuccess: (comment, { topicId }) => {
      queryClient.setQueryData<ForumTopic[] | undefined>([...FORUM_QUERY_KEY, user?.id], (previous) => {
        if (!previous) {
          return previous;
        }
        return previous.map((topic) =>
          topic.id === topicId ? { ...topic, comments: [...topic.comments, comment] } : topic,
        );
      });
    },
  });

  const toggleLikeMutation = useMutation({
    mutationFn: (topicId: string) => toggleForumLike({ topicId, userId: user!.id }),
    onSuccess: ({ topicId, likes, likedByUser }) => {
      queryClient.setQueryData<ForumTopic[] | undefined>([...FORUM_QUERY_KEY, user?.id], (previous) => {
        if (!previous) {
          return previous;
        }
        return previous.map((topic) =>
          topic.id === topicId ? { ...topic, likes, likedByUser } : topic,
        );
      });
    },
  });

  return { topicsQuery, createTopicMutation, createCommentMutation, toggleLikeMutation };
};

export default useForum;
