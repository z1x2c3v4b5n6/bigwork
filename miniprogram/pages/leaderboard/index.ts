import { leaderboardSeed, type LeaderboardEntrySeed } from '../../data/leaderboard';
import { apiRequest, type ApiError } from '../../utils/api';
import { ensureSession } from '../../utils/session';

export type LeaderboardScope = 'global' | 'campus';

export interface LeaderboardEntry extends LeaderboardEntrySeed {
  rank: number;
}

const mapEntry = (entry: LeaderboardEntrySeed, index: number): LeaderboardEntry => ({
  ...entry,
  rank: index + 1,
});

Page({
  data: {
    loading: false,
    errorMessage: '',
    scope: 'global' as LeaderboardScope,
    entries: leaderboardSeed.map((entry, index) => mapEntry(entry, index)),
  },

  onShow() {
    void this.loadLeaderboard(this.data.scope);
  },

  async loadLeaderboard(scope: LeaderboardScope) {
    if (this.data.loading) {
      return;
    }
    this.setData({ loading: true, errorMessage: '' });

    try {
      await ensureSession();
    } catch (error) {
      const apiError = error as ApiError;
      const message =
        apiError?.statusCode === 401
          ? '请先完成登录后再查看排行榜，可在“我的”页登录后刷新。'
          : apiError?.message || '登录状态校验失败，请稍后再试。';
      this.setData({ loading: false, errorMessage: message });
      return;
    }

    try {
      const response = await apiRequest<{ leaderboard: LeaderboardEntrySeed[] }>({
        path: `/learning/leaderboard?scope=${scope}`,
      });
      const entries = Array.isArray(response.leaderboard)
        ? response.leaderboard.map((entry, index) => mapEntry(entry, index))
        : leaderboardSeed.map((entry, index) => mapEntry(entry, index));
      this.setData({ entries, scope });
    } catch (error) {
      const apiError = error as ApiError;
      const message = apiError?.message || '排行榜加载失败，请稍后再试。';
      this.setData({ errorMessage: message });
    } finally {
      this.setData({ loading: false });
    }
  },

  handleScopeChange(event: WechatMiniprogram.BaseEvent) {
    const nextScope = event.currentTarget?.dataset?.scope as LeaderboardScope | undefined;
    if (!nextScope || nextScope === this.data.scope) {
      return;
    }
    this.setData({ scope: nextScope });
    void this.loadLeaderboard(nextScope);
  },
});
