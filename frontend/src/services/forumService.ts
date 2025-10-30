import httpClient from './httpClient';

export interface ForumTopic {
  id: number;
  title: string;
  description: string;
  author: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ForumPost {
  id: number;
  content: string;
  author: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export const fetchForumTopics = async (): Promise<ForumTopic[]> => {
  const response = await httpClient.get<{ topics: ForumTopic[] }>('/api/forum/topics');
  return response.data.topics ?? [];
};

export const createForumTopic = async (payload: { title: string; description?: string }): Promise<ForumTopic> => {
  const response = await httpClient.post<{ id: number; title: string }>('/api/forum/topics', payload);
  return { id: response.data.id, title: response.data.title, description: payload.description ?? '', author: '', createdAt: null, updatedAt: null };
};

export const fetchForumPosts = async (topicId: number | string): Promise<ForumPost[]> => {
  const response = await httpClient.get<{ posts: ForumPost[] }>(`/api/forum/topics/${topicId}/posts`);
  return response.data.posts ?? [];
};

export const createForumPost = async (
  topicId: number | string,
  payload: { content: string },
): Promise<{ id: number }> => {
  const response = await httpClient.post<{ id: number }>(`/api/forum/topics/${topicId}/posts`, payload);
  return response.data;
};

export default {
  fetchForumTopics,
  createForumTopic,
  fetchForumPosts,
  createForumPost,
};
