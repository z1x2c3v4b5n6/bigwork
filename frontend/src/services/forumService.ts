import httpClient from './httpClient';

export interface ForumTopic {
  id: string;
  title: string;
  description: string;
  author: string;
  createdAt: string | null;
  updatedAt: string | null;
  replies: number;
  likes: number;
  likedByMe: boolean;
}

export interface ForumPost {
  id: string;
  content: string;
  author: string;
  createdAt: string | null;
  updatedAt: string | null;
  canDelete: boolean;
  isAuthor: boolean;
}

export const fetchForumTopics = async (): Promise<ForumTopic[]> => {
  const response = await httpClient.get<{ topics: ForumTopic[] }>('/api/forum/topics');
  return (response.data.topics ?? []).map((topic) => ({
    ...topic,
    id: topic.id != null ? String(topic.id) : '',
    replies: Number(topic.replies ?? 0),
    likes: Number(topic.likes ?? 0),
    likedByMe: Boolean(topic.likedByMe),
  }));
};

export const createForumTopic = async (payload: { title: string; description?: string }): Promise<ForumTopic> => {
  const response = await httpClient.post<{ id: number | string; title: string }>(
    '/api/forum/topics',
    payload,
  );
  return {
    id: response.data.id != null ? String(response.data.id) : '',
    title: response.data.title,
    description: payload.description ?? '',
    author: '',
    createdAt: null,
    updatedAt: null,
    replies: 0,
    likes: 0,
    likedByMe: false,
  };
};

export const fetchForumPosts = async (topicId: number | string): Promise<ForumPost[]> => {
  const response = await httpClient.get<{ posts: ForumPost[] }>(`/api/forum/topics/${topicId}/posts`);
  return (response.data.posts ?? []).map((post) => ({
    ...post,
    id: post.id != null ? String(post.id) : '',
    canDelete: Boolean(post.canDelete),
    isAuthor: Boolean(post.isAuthor),
  }));
};

export const createForumPost = async (
  topicId: number | string,
  payload: { content: string },
): Promise<{ id: string }> => {
  const response = await httpClient.post<{ id: number | string }>(`/api/forum/topics/${topicId}/posts`, payload);
  const id = response.data?.id;
  return { id: id != null ? String(id) : '' };
};

export const toggleTopicLike = async (
  topicId: number | string,
): Promise<{ likes: number; liked: boolean }> => {
  const response = await httpClient.post<{ likes: number; liked: boolean }>(`/api/forum/topics/${topicId}/likes`, {});
  return { likes: Number(response.data.likes ?? 0), liked: Boolean(response.data.liked) };
};

export const deleteForumPost = async (topicId: number | string, postId: number | string): Promise<void> => {
  await httpClient.delete(`/api/forum/topics/${topicId}/posts/${postId}`);
};

export default {
  fetchForumTopics,
  createForumTopic,
  fetchForumPosts,
  createForumPost,
  toggleTopicLike,
  deleteForumPost,
};
