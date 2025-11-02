import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import forumService, { ForumTopic } from '../services/forumService';

export const FORUM_QUERY_KEY = ['forum-topics'];

const useForum = (enabled: boolean) => {
  const queryClient = useQueryClient();

  const topicsQuery = useQuery({
    queryKey: FORUM_QUERY_KEY,
    queryFn: forumService.fetchForumTopics,
    enabled,
    staleTime: 60 * 1000,
  });

  const createTopicMutation = useMutation({
    mutationFn: forumService.createForumTopic,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: FORUM_QUERY_KEY });
    },
  });

  const toggleLikeMutation = useMutation({
    mutationFn: (topicId: string) => forumService.toggleTopicLike(topicId),
    onSuccess: ({ topicId, likes, likedByUser }) => {
      queryClient.setQueryData<ForumTopic[] | undefined>(FORUM_QUERY_KEY, (previous) => {
        if (!previous) {
          return previous;
        }
        return previous.map((topic) =>
          topic.id === topicId ? { ...topic, likes, likedByUser } : topic,
        );
      });
    },
  });

  return { topicsQuery, createTopicMutation, toggleLikeMutation };
};

export default useForum;
