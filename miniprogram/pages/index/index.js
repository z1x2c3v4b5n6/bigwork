Page({
  data: {
    toolkitEntries: [
      {
        title: '复试自我介绍模板',
        description: '分数段策略 + 中英双语模板，60 秒内定制专属稿件。',
        path: '/pages/intro/index',
      },
      {
        title: '专业课高频题整理表',
        description: '20 个热门专业的考点、追问与院校推荐一页掌握。',
        path: '/pages/subjects/index',
      },
      {
        title: '英语口语快速复盘',
        description: '7 天快冲计划与突发应对模板，稳住口语发挥。',
        path: '/pages/english/index',
      },
    ],
  },

  onShareAppMessage() {
    return {
      title: '研招复试冲刺工具箱',
      path: '/pages/index/index',
    };
  },
});
