const { leaderboardSeed } = require('../../data/leaderboard.js');
const { apiRequest } = require('../../utils/api.js');
const { ensureSession } = require('../../utils/session.js');

const mapEntry = (entry, index) => Object.assign({}, entry, { rank: index + 1 });

Page({
  data: {
    loading: false,
    errorMessage: '',
    scope: 'global',
    entries: leaderboardSeed.map((entry, index) => mapEntry(entry, index)),
  },

  onShow() {
    this.loadLeaderboard(this.data.scope);
  },

  async loadLeaderboard(scope) {
    if (this.data.loading) {
      return;
    }
    this.setData({ loading: true, errorMessage: '' });

    try {
      await ensureSession();
    } catch (error) {
      const message =
        error?.statusCode === 401
          ? '请先完成登录后再查看排行榜，可在“我的”页登录后刷新。'
          : error?.message || '登录状态校验失败，请稍后再试。';
      this.setData({ loading: false, errorMessage: message });
      return;
    }

    try {
      const response = await apiRequest({ path: `/learning/leaderboard?scope=${scope}` });
      const entries = Array.isArray(response?.leaderboard)
        ? response.leaderboard.map((entry, index) => mapEntry(entry, index))
        : leaderboardSeed.map((entry, index) => mapEntry(entry, index));
      this.setData({ entries, scope });
    } catch (error) {
      const message = error?.message || '排行榜加载失败，请稍后再试。';
      this.setData({ errorMessage: message });
    } finally {
      this.setData({ loading: false });
    }
  },

  handleScopeChange(event) {
    const nextScope = event?.currentTarget?.dataset?.scope;
    if (!nextScope || nextScope === this.data.scope) {
      return;
    }
    this.setData({ scope: nextScope });
    this.loadLeaderboard(nextScope);
  },
});
