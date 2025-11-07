const { scoreBandGuides, majorRecommendations } = require('../../data/resources.js');

const majorOptions = ['全部热门专业', ...majorRecommendations.map((item) => item.major)];

Page({
  data: {
    scoreBandGuides,
    majorOptions,
    majorIndex: 0,
    displayedRecommendations: majorRecommendations,
    focusedMajor: null,
  },

  handleMajorChange(event) {
    const value = Number(event.detail.value);
    if (Number.isNaN(value)) {
      return;
    }

    if (value === 0) {
      this.setData({
        majorIndex: 0,
        displayedRecommendations: majorRecommendations,
        focusedMajor: null,
      });
      return;
    }

    const target = majorRecommendations[value - 1];
    this.setData({
      majorIndex: value,
      displayedRecommendations: target ? [target] : majorRecommendations,
      focusedMajor: target || null,
    });
  },

  onShareAppMessage() {
    return {
      title: '复试专业课高频题整理表',
      path: '/pages/subjects/index',
    };
  },
});
