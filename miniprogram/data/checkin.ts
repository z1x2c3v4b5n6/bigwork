export interface DailyTaskSeed {
  id: string;
  title: string;
  description: string;
  targetText: string;
  estimatedMinutes: number;
}

export const dailyTaskSeed: DailyTaskSeed = {
  id: 'seed-task-001',
  title: '刷题巩固',
  description: '完成 20 道算法练习题并总结薄弱点。',
  targetText: '刷题 20 题',
  estimatedMinutes: 60,
};
