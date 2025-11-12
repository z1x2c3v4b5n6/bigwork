export interface LeaderboardEntrySeed {
  id: string;
  name: string;
  university: string;
  progress: number;
  hours: number;
}

export const leaderboardSeed: LeaderboardEntrySeed[] = [
  {
    id: 'seed-top-01',
    name: '张晨',
    university: '华中科技大学',
    progress: 92,
    hours: 48,
  },
  {
    id: 'seed-top-02',
    name: '李雪',
    university: '北京邮电大学',
    progress: 88,
    hours: 45,
  },
  {
    id: 'seed-top-03',
    name: '陈凯',
    university: '电子科技大学',
    progress: 84,
    hours: 42,
  },
];
