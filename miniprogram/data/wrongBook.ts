export interface WrongQuestionSeed {
  id: string;
  question: string;
  answer: string;
  analysis: string;
  updatedAt: string;
}

export const wrongQuestionSeed: WrongQuestionSeed[] = [
  {
    id: 'wrong-001',
    question: '设有序表长度为 n，使用二分查找的平均时间复杂度是多少？',
    answer: 'O(log n)',
    analysis: '二分查找每次将查找范围缩小一半，因此平均时间复杂度为对数级。',
    updatedAt: '2024-03-01T09:30:00',
  },
  {
    id: 'wrong-002',
    question: '在操作系统中，进程与线程的最大区别是什么？',
    answer: '进程是资源分配的基本单位，而线程是 CPU 调度的基本单位。',
    analysis: '线程运行在进程空间内，多个线程共享进程资源。',
    updatedAt: '2024-03-03T21:00:00',
  },
];
