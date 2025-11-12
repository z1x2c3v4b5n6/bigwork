const { dailyTaskSeed } = require('../../data/checkin.js');
const { apiRequest } = require('../../utils/api.js');
const {
  initializeDailyTask,
  markTaskCompletedToday,
  reloadDailyTask,
} = require('../../utils/checkin.js');
const { ensureSession } = require('../../utils/session.js');

const createInitialState = () => ({
  task: dailyTaskSeed,
  streak: 0,
  completedToday: false,
});

Page({
  data: {
    loading: false,
    completing: false,
    generatingPoster: false,
    errorMessage: '',
    posterTempPath: '',
    status: createInitialState(),
  },

  onShow() {
    this.refreshTask(false);
  },

  async refreshTask(forceReload = false) {
    if (this.data.loading) {
      return;
    }
    this.setData({ loading: true, errorMessage: '' });

    let pendingMessage = '';
    try {
      await ensureSession();
    } catch (error) {
      pendingMessage =
        error?.statusCode === 401
          ? '请先完成登录后再查看打卡任务，可在“我的”页使用账号密码登录。'
          : error?.message || '登录状态校验失败，请稍后再试。';
    }

    try {
      const status = forceReload ? await reloadDailyTask() : await initializeDailyTask();
      this.setData({ status, posterTempPath: '' });
      if (pendingMessage) {
        this.setData({ errorMessage: pendingMessage });
      }
    } catch (error) {
      const message = error?.message || '加载今日任务失败，请稍后重试。';
      this.setData({ errorMessage: message });
    } finally {
      this.setData({ loading: false });
      wx.stopPullDownRefresh();
    }
  },

  onPullDownRefresh() {
    this.refreshTask(true);
  },

  handleRefreshTap(event) {
    const force = Boolean(event?.currentTarget?.dataset?.force);
    this.refreshTask(force);
  },

  async completeTask() {
    if (this.data.completing || this.data.status.completedToday) {
      return;
    }

    const task = this.data.status.task;
    if (!task) {
      return;
    }

    this.setData({ completing: true, errorMessage: '' });

    try {
      await ensureSession();
      await apiRequest({
        path: '/learning/daily-task/complete',
        method: 'POST',
        data: { taskId: task.id },
      });
      const nextState = markTaskCompletedToday(task);
      this.setData({
        status: { task, completedToday: true, streak: nextState.streak },
        posterTempPath: '',
      });
      wx.showToast({ title: '打卡成功', icon: 'success' });
    } catch (error) {
      const message = error?.message || '打卡上报失败，请稍后再试。';
      this.setData({ errorMessage: message });
    } finally {
      this.setData({ completing: false });
    }
  },

  async sharePoster() {
    if (this.data.generatingPoster) {
      return;
    }

    if (this.data.posterTempPath) {
      this.previewPoster();
      return;
    }

    this.setData({ generatingPoster: true, errorMessage: '' });
    await this.drawPoster();
  },

  drawPoster() {
    return new Promise((resolve) => {
      const query = wx.createSelectorQuery();
      query
        .in(this)
        .select('#daily-share-canvas')
        .fields({ node: true, size: true })
        .exec((res) => {
          const canvasNode = res?.[0]?.node;
          const size = res?.[0];
          if (!canvasNode || !size) {
            this.setData({
              generatingPoster: false,
              errorMessage: '无法初始化海报画布，请稍后重试。',
            });
            resolve();
            return;
          }

          const windowInfo = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
          const dpr = windowInfo.pixelRatio || 2;
          canvasNode.width = size.width * dpr;
          canvasNode.height = size.height * dpr;
          const context = canvasNode.getContext('2d');
          context.scale(dpr, dpr);

          this.renderPoster(context, size.width, size.height);

          wx.canvasToTempFilePath(
            {
              canvas: canvasNode,
              success: (fileResult) => {
                this.setData({ posterTempPath: fileResult.tempFilePath, generatingPoster: false });
                this.previewPoster();
                resolve();
              },
              fail: () => {
                this.setData({
                  generatingPoster: false,
                  errorMessage: '生成分享海报失败，请稍后再试。',
                });
                resolve();
              },
            },
            this,
          );
        });
    });
  },

  renderPoster(context, width, height) {
    const padding = 24;
    const radius = 20;
    const gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#0C4A6E');
    gradient.addColorStop(1, '#0891B2');

    const drawRoundedRect = (x, y, w, h, r) => {
      context.beginPath();
      context.moveTo(x + r, y);
      context.lineTo(x + w - r, y);
      context.quadraticCurveTo(x + w, y, x + w, y + r);
      context.lineTo(x + w, y + h - r);
      context.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      context.lineTo(x + r, y + h);
      context.quadraticCurveTo(x, y + h, x, y + h - r);
      context.lineTo(x, y + r);
      context.quadraticCurveTo(x, y, x + r, y);
      context.closePath();
    };

    context.fillStyle = '#0F172A';
    drawRoundedRect(0, 0, width, height, radius);
    context.fill();

    context.fillStyle = gradient;
    drawRoundedRect(padding, padding, width - padding * 2, height - padding * 2, radius);
    context.fill();

    context.fillStyle = '#E2E8F0';
    context.font = '20px sans-serif';
    context.fillText('今日学习打卡', padding + 24, padding + 48);

    const { task, streak } = this.data.status;
    context.fillStyle = '#F8FAFC';
    context.font = '28px sans-serif';
    context.fillText(task.title, padding + 24, padding + 96);

    context.fillStyle = '#F1F5F9';
    context.font = '18px sans-serif';
    context.fillText(task.description, padding + 24, padding + 130, width - padding * 2 - 48);

    context.fillStyle = '#FACC15';
    context.font = '22px sans-serif';
    context.fillText(`目标：${task.targetText}`, padding + 24, padding + 170);

    context.fillStyle = '#F1F5F9';
    context.font = '18px sans-serif';
    context.fillText(`连续打卡 ${streak} 天`, padding + 24, padding + 205);

    const date = new Date();
    const dateText = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate(),
    ).padStart(2, '0')}`;
    context.fillStyle = 'rgba(15, 23, 42, 0.36)';
    context.font = '16px sans-serif';
    context.fillText(dateText, padding + 24, height - padding - 32);
  },

  previewPoster() {
    if (!this.data.posterTempPath) {
      return;
    }
    wx.previewImage({ urls: [this.data.posterTempPath] });
  },
});
