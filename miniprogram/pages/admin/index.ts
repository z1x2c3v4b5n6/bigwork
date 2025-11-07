import { adminMetricsSeed, adminReferenceSites, adminTasksSeed, type AdminTaskItem } from '../../data/admin';

Page({
  data: {
    metrics: adminMetricsSeed,
    referenceSites: adminReferenceSites,
    tasks: adminTasksSeed as AdminTaskItem[],
  },

  copyLink(event: WechatMiniprogram.BaseEvent) {
    const url = event.currentTarget?.dataset?.url;
    if (!url) {
      return;
    }
    wx.setClipboardData({
      data: url,
      success: () => {
        wx.showToast({ title: '链接已复制', icon: 'success' });
      },
    }).catch((error) => {
      console.warn('复制失败', error);
    });
  },
});
