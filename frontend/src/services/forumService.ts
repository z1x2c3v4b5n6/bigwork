import httpClient from './httpClient';

export interface ForumAuthor {
  id: string | null;
  name: string;
  avatar?: string | null;
}

export interface ForumTopic {
  id: string;
  title: string;
  description: string;
  tags: string[];
  author: ForumAuthor;
  createdAt: string | null;
  updatedAt: string | null;
  replies: number;
  likes: number;
  likedByUser: boolean;
}

export interface ForumComment {
  id: string;
  content: string;
  author: ForumAuthor;
  createdAt: string | null;
  updatedAt: string | null;
  canDelete: boolean;
  isAuthor: boolean;
}

const buildAuthor = (name?: string | null): ForumAuthor => {
  const displayName = name?.trim() || '匿名用户';
  const initial = displayName.charAt(0) || '访';
  return {
    id: null,
    name: displayName,
    avatar: /^[a-z0-9+\/_-]+$/i.test(displayName) ? null : initial,
  };
};

export const fetchForumTopics = async (): Promise<ForumTopic[]> => {
  const response = await httpClient.get<{ topics: Array<Record<string, unknown>> }>('/api/forum/topics');
  const topics = response.data.topics ?? [];

  return topics.map((topic, index) => {
    const id = topic.id != null ? String(topic.id) : String(index + 1);
    const tags = Array.isArray(topic.tags)
      ? (topic.tags as unknown[]).map((tag) => String(tag))
      : typeof topic.tags === 'string'
      ? topic.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [];

    return {
      id,
      title: String(topic.title ?? '未命名话题'),
      description: String(topic.description ?? ''),
      tags,
      author: buildAuthor(topic.author as string | undefined),
      createdAt: (topic.createdAt ?? topic.created_at ?? null) as string | null,
      updatedAt: (topic.updatedAt ?? topic.updated_at ?? null) as string | null,
      replies: Number(topic.replies ?? 0),
      likes: Number(topic.likes ?? 0),
      likedByUser: Boolean(topic.likedByUser ?? topic.liked ?? false),
    } satisfies ForumTopic;
  });
};

export const createForumTopic = async (payload: {
  title: string;
  description?: string;
  tags?: string[];
}): Promise<{ id: string; title: string; tags: string[] }> => {
  const response = await httpClient.post<{ id: number | string; title: string; tags?: string[] }>(
    '/api/forum/topics',
    payload,
  );
  const id = response.data.id != null ? String(response.data.id) : '';
  const tags = Array.isArray(response.data.tags)
    ? response.data.tags.map((tag) => String(tag))
    : payload.tags ?? [];
  return { id, title: response.data.title, tags };
};

export const fetchForumPosts = async (topicId: number | string): Promise<ForumComment[]> => {
  const response = await httpClient.get<{ posts: Array<Record<string, unknown>> }>(
    `/api/forum/topics/${topicId}/posts`,
  );
  const posts = response.data.posts ?? [];

  return posts.map((post, index) => {
    const id = post.id != null ? String(post.id) : String(index + 1);
    return {
      id,
      content: String(post.content ?? ''),
      author: buildAuthor(post.author as string | undefined),
      createdAt: (post.createdAt ?? post.created_at ?? null) as string | null,
      updatedAt: (post.updatedAt ?? post.updated_at ?? null) as string | null,
      canDelete: Boolean(post.canDelete),
      isAuthor: Boolean(post.isAuthor),
    } satisfies ForumComment;
  });
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
): Promise<{ topicId: string; likes: number; likedByUser: boolean }> => {
  const response = await httpClient.post<{ likes: number; liked: boolean }>(`/api/forum/topics/${topicId}/likes`, {});
  return { topicId: String(topicId), likes: Number(response.data.likes ?? 0), likedByUser: Boolean(response.data.liked) };
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
