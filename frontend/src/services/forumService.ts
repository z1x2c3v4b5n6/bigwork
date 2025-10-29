import httpClient from './httpClient';

export interface ForumAuthor {
  id: string;
  name: string;
  avatar: string;
}

export interface ForumComment {
  id: string;
  content: string;
  createdAt?: string;
  author: ForumAuthor;
}

export interface ForumTopic {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt?: string;
  needsModeration: boolean;
  likes: number;
  likedByUser: boolean;
  author: ForumAuthor;
  comments: ForumComment[];
}

const forumEndpoint = import.meta.env.VITE_FORUM_ENDPOINT ?? '/api/forum/topics';

export const fetchForumTopics = async (userId?: string): Promise<ForumTopic[]> => {
  const response = await httpClient.get<ForumTopic[]>(forumEndpoint, {
    params: userId ? { userId } : undefined,
  });
  return response.data;
};

export const createForumTopic = async (payload: {
  authorId: string;
  title: string;
  content: string;
  tags?: string[];
}): Promise<ForumTopic> => {
  const response = await httpClient.post<ForumTopic>(forumEndpoint, payload);
  return response.data;
};

export const createForumComment = async (payload: {
  topicId: string;
  authorId: string;
  content: string;
}): Promise<ForumComment> => {
  const response = await httpClient.post<ForumComment>(`${forumEndpoint}/${payload.topicId}/comments`, {
    authorId: payload.authorId,
    content: payload.content,
  });
  return response.data;
};

export const toggleForumLike = async (payload: {
  topicId: string;
  userId: string;
}): Promise<{ topicId: string; likes: number; likedByUser: boolean }> => {
  const response = await httpClient.post<{ likes: number; likedByUser: boolean }>(
    `${forumEndpoint}/${payload.topicId}/likes`,
    { userId: payload.userId },
  );
  return { topicId: payload.topicId, ...response.data };
};
