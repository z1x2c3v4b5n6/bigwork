const { scoreBandGuides, bilingualTemplate, rehearsalChecklist } = require('../../data/resources.js');

Page({
  data: {
    scoreBandGuides,
    bilingualTemplate,
    rehearsalChecklist,
  },

  onShareAppMessage() {
    return {
      title: '复试自我介绍模板（含中英文）',
      path: '/pages/intro/index',
    };
  },
});
