const { scoreBandGuides, weeklyPlan, emergencyResponses } = require('../../data/resources.js');

const errorMarkingSteps = [
  'Step 1：听原音并打字记录，标出停顿与重复位置。',
  'Step 2：对照导师或官方推荐表达，找出语法与词汇的可替换项。',
  'Step 3：用不同颜色标注“必须修正”和“可以升级”的句子。',
  'Step 4：重新录制核对修正项，如仍存在问题则回到 Step 2。',
];

const confidenceReminders = [
  '每天至少保留 10 分钟“轻松输出时间”，讲电影剧情或日常趣事维持语感。',
  '遇到追问时先复述问题赢得 3 秒缓冲，例如：“If I understand correctly, you are asking about …”。',
  '搭配手机录音 + AI 评测工具，量化发音分数并追踪波动趋势。',
];

Page({
  data: {
    scoreBandGuides,
    weeklyPlan,
    emergencyResponses,
    errorMarkingSteps,
    confidenceReminders,
  },

  onShareAppMessage() {
    return {
      title: '英语口语快速复盘清单',
      path: '/pages/english/index',
    };
  },
});
