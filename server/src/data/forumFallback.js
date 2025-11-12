const formatDateTime = (date = new Date()) => {
  const target = date instanceof Date ? new Date(date.getTime()) : new Date(date);
  if (Number.isNaN(target.getTime())) {
    return formatDateTime(new Date());
  }
  const year = target.getFullYear();
  const month = `${target.getMonth() + 1}`.padStart(2, '0');
  const day = `${target.getDate()}`.padStart(2, '0');
  const hours = `${target.getHours()}`.padStart(2, '0');
  const minutes = `${target.getMinutes()}`.padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const baseTopics = [
  {
    id: 'fallback-topic-001',
    title: '复试经验互助打卡',
    description: '分享复试流程、面试礼仪与导师追问应对技巧，互相鼓劲。',
    tags: ['复试', '经验'],
    author: '研路助教',
    createdAt: '2024-04-10 09:30',
    updatedAt: '2024-04-10 09:30',
  },
  {
    id: 'fallback-topic-002',
    title: '每日学习打卡计划',
    description: '记录今日任务完成情况与复盘心得，保持连续打卡更有动力。',
    tags: ['打卡', '规划'],
    author: '学习小伙伴',
    createdAt: '2024-04-09 08:20',
    updatedAt: '2024-04-11 07:45',
  },
  {
    id: 'fallback-topic-003',
    title: '院校调剂信息共享',
    description: '同步各院校调剂通知、资料要求与沟通经验，避免错过机会。',
    tags: ['调剂', '院校'],
    author: '信息观察员',
    createdAt: '2024-04-08 12:00',
    updatedAt: '2024-04-10 18:10',
  },
];

const postsByTopic = new Map([
  [
    'fallback-topic-001',
    [
      {
        id: 'fallback-post-1001',
        content: '今日模拟面试主要练了科研介绍，导师追问项目细节时要记得强调结果。',
        author: '研路助教',
        authorId: 'fallback-admin',
        createdAt: '2024-04-10 10:15',
      },
      {
        id: 'fallback-post-1002',
        content: '推荐准备两套自我介绍：学术型和实践型，根据导师提问灵活切换。',
        author: '学习小伙伴',
        authorId: 'fallback-student-1',
        createdAt: '2024-04-10 11:05',
      },
    ],
  ],
  [
    'fallback-topic-002',
    [
      {
        id: 'fallback-post-2001',
        content: '今天刷题 20 道，晚上复盘错题并更新错题本，继续加油。',
        author: '学习小伙伴',
        authorId: 'fallback-student-2',
        createdAt: '2024-04-09 22:05',
      },
    ],
  ],
  [
    'fallback-topic-003',
    [
      {
        id: 'fallback-post-3001',
        content: '东南大学控制工程复试线上面试环节重点问科研经历，可准备 PPT。',
        author: '信息观察员',
        authorId: 'fallback-student-3',
        createdAt: '2024-04-08 15:22',
      },
    ],
  ],
]);

const likesByTopic = new Map([
  ['fallback-topic-001', new Set(['fallback-student-1', 'fallback-student-2'])],
  ['fallback-topic-002', new Set(['fallback-student-2'])],
  ['fallback-topic-003', new Set(['fallback-student-3'])],
]);

let topicSequence = 4000;
let postSequence = 6000;

const initialBaseTopics = baseTopics.map((topic) => ({
  id: topic.id,
  title: topic.title,
  description: topic.description,
  tags: Array.isArray(topic.tags) ? [...topic.tags] : [],
  author: topic.author,
  createdAt: topic.createdAt,
  updatedAt: topic.updatedAt,
}));

const clonePosts = (collection) => collection.map((post) => ({ ...post }));

const initialPostsSnapshot = new Map(
  Array.from(postsByTopic.entries(), ([topicId, posts]) => [topicId, clonePosts(posts)]),
);

const initialLikesSnapshot = new Map(
  Array.from(likesByTopic.entries(), ([topicId, likes]) => [topicId, new Set(likes)]),
);

const initialSequences = { topic: topicSequence, post: postSequence };

const cloneTopic = (topic) => ({
  id: topic.id,
  title: topic.title,
  description: topic.description,
  tags: Array.isArray(topic.tags) ? [...topic.tags] : [],
  author: topic.author,
  createdAt: topic.createdAt,
  updatedAt: topic.updatedAt,
});

const listTopics = () => baseTopics.map((topic) => cloneTopic(topic));

const findTopic = (topicId) => baseTopics.find((topic) => topic.id === topicId) || null;

const ensureTopicExists = (topicId) => {
  let topic = findTopic(topicId);
  if (!topic) {
    return null;
  }
  return topic;
};

const listPosts = (topicId) => {
  const records = postsByTopic.get(topicId);
  if (!records) {
    return [];
  }
  return records.map((post) => ({ ...post }));
};

const createTopic = ({ title, description, tags, author }) => {
  const id = `fallback-topic-${++topicSequence}`;
  const now = formatDateTime();
  const record = {
    id,
    title,
    description,
    tags: Array.isArray(tags) ? [...tags] : [],
    author: author || '匿名用户',
    createdAt: now,
    updatedAt: now,
  };
  baseTopics.unshift(record);
  postsByTopic.set(id, []);
  likesByTopic.set(id, new Set());
  return cloneTopic(record);
};

const resolveAuthorName = (sessionUser) => {
  if (!sessionUser) {
    return '匿名用户';
  }
  const names = [sessionUser.display_name, sessionUser.displayName, sessionUser.name, sessionUser.username];
  for (const name of names) {
    if (typeof name === 'string' && name.trim()) {
      return name.trim();
    }
  }
  return '匿名用户';
};

const createPost = (topicId, { content, sessionUser }) => {
  const topic = ensureTopicExists(topicId);
  if (!topic) {
    return null;
  }
  const collection = postsByTopic.get(topicId) || [];
  const id = `fallback-post-${++postSequence}`;
  const record = {
    id,
    content,
    author: resolveAuthorName(sessionUser),
    authorId: sessionUser?.id != null ? String(sessionUser.id) : 'fallback-guest',
    createdAt: formatDateTime(),
  };
  collection.push(record);
  postsByTopic.set(topicId, collection);
  topic.updatedAt = formatDateTime();
  return { ...record };
};

const deletePost = (topicId, postId, sessionUser) => {
  const topic = ensureTopicExists(topicId);
  if (!topic) {
    return false;
  }
  const collection = postsByTopic.get(topicId) || [];
  const index = collection.findIndex((post) => post.id === postId);
  if (index === -1) {
    return false;
  }
  const post = collection[index];
  const isOwner = sessionUser?.id != null && String(sessionUser.id) === post.authorId;
  const isAdmin = sessionUser && ['admin', 'superadmin'].includes(String(sessionUser.role || '').toLowerCase());
  if (!isOwner && !isAdmin) {
    return false;
  }
  collection.splice(index, 1);
  postsByTopic.set(topicId, collection);
  topic.updatedAt = formatDateTime();
  return true;
};

const toggleLike = (topicId, userId) => {
  const topic = ensureTopicExists(topicId);
  if (!topic) {
    return { likes: 0, liked: false };
  }
  const collection = likesByTopic.get(topicId) || new Set();
  const key = String(userId);
  if (collection.has(key)) {
    collection.delete(key);
    likesByTopic.set(topicId, collection);
    return { likes: collection.size, liked: false };
  }
  collection.add(key);
  likesByTopic.set(topicId, collection);
  return { likes: collection.size, liked: true };
};

const getTopicSummary = (topicId, userId = null) => {
  const topic = ensureTopicExists(topicId);
  if (!topic) {
    return null;
  }
  const likeSet = likesByTopic.get(topicId) || new Set();
  const likes = likeSet.size || 0;
  const replies = (postsByTopic.get(topicId) || []).length;
  const liked = userId != null ? likeSet.has(String(userId)) : false;
  return { likes, replies, liked };
};

module.exports = {
  listTopics,
  getTopicSummary,
  listPosts,
  createTopic,
  createPost,
  deletePost,
  toggleLike,
  resolveAuthorName,
  __resetForumFallbackState: () => {
    baseTopics.length = 0;
    initialBaseTopics.forEach((topic) =>
      baseTopics.push({
        id: topic.id,
        title: topic.title,
        description: topic.description,
        tags: [...topic.tags],
        author: topic.author,
        createdAt: topic.createdAt,
        updatedAt: topic.updatedAt,
      }),
    );

    postsByTopic.clear();
    initialPostsSnapshot.forEach((posts, topicId) => {
      postsByTopic.set(topicId, clonePosts(posts));
    });

    likesByTopic.clear();
    initialLikesSnapshot.forEach((likes, topicId) => {
      likesByTopic.set(topicId, new Set(likes));
    });

    topicSequence = initialSequences.topic;
    postSequence = initialSequences.post;
  },
};
