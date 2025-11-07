export interface ForumReply {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface ForumTopic {
  id: string;
  title: string;
  description: string;
  likes: number;
  likedByUser: boolean;
  replies: ForumReply[];
  createdAt: string;
}

export const forumSeed: ForumTopic[] = [
  {
    id: 'topic_001',
    title: '英语一阅读 80+ 的刷题节奏',
    description: '想请教大家如何在 2 个月内把阅读正确率提升到 80% 以上？',
    likes: 23,
    likedByUser: false,
    createdAt: '2024-04-09T09:30:00.000Z',
    replies: [
      {
        id: 'reply_001',
        author: '李学长',
        content: '每天 1 篇外刊精读，配合真题句子翻译，保持语感。',
        createdAt: '2024-04-09T10:12:00.000Z',
      },
      {
        id: 'reply_002',
        author: '英语助教',
        content: '建议搭配长难句精讲和逻辑题型拆解，先保准确率再提速度。',
        createdAt: '2024-04-09T11:02:00.000Z',
      },
    ],
  },
  {
    id: 'topic_002',
    title: '调剂简历需要准备哪些材料？',
    description: '初试成绩一般，考虑调剂，简历和个人陈述有哪些注意点？',
    likes: 18,
    likedByUser: true,
    createdAt: '2024-04-08T14:40:00.000Z',
    replies: [
      {
        id: 'reply_003',
        author: '学业规划师',
        content: '提前准备成绩单、获奖证书、科研/实习证明，突出匹配度。',
        createdAt: '2024-04-08T15:10:00.000Z',
      },
    ],
  },
  {
    id: 'topic_003',
    title: '数学一 3 月复盘清单分享',
    description: '整理了 3 月份的错题分类清单和阶段测试情况，欢迎交流。',
    likes: 12,
    likedByUser: false,
    createdAt: '2024-04-07T20:05:00.000Z',
    replies: [],
  },
];
