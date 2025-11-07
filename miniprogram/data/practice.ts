export interface PracticeSetSummary {
  id: string;
  title: string;
  description: string;
  difficulty: '基础' | '进阶' | '冲刺' | string;
  tags: string[];
  questionCount: number;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface PracticeQuestion {
  id: string;
  setId: string;
  questionText: string;
  answerText: string;
  explanation: string;
  tags: string[];
  difficulty: '基础' | '进阶' | '冲刺' | string;
  createdAt: string | null;
  updatedAt: string | null;
}

export const practiceSetSeed: PracticeSetSummary[] = [
  {
    id: 'set_math',
    title: '数学一选择题强化',
    description: '聚焦线性代数与概率统计高频考点，覆盖 2010-2023 年真题。',
    difficulty: '进阶',
    tags: ['数学一', '真题', '强化'],
    questionCount: 60,
    createdAt: '2024-03-28T09:00:00.000Z',
    updatedAt: '2024-04-10T09:00:00.000Z',
  },
  {
    id: 'set_politics',
    title: '政治主观题热点预测',
    description: '围绕共同富裕、科技自立等热点整理答题模板。',
    difficulty: '冲刺',
    tags: ['政治', '热点', '押题'],
    questionCount: 24,
    createdAt: '2024-03-20T10:00:00.000Z',
    updatedAt: '2024-04-09T10:00:00.000Z',
  },
  {
    id: 'set_english',
    title: '英语翻译与写作精练',
    description: '精选真题翻译与大小作文题，附批改要点。',
    difficulty: '基础',
    tags: ['英语一', '写作', '翻译'],
    questionCount: 12,
    createdAt: '2024-03-05T08:00:00.000Z',
    updatedAt: '2024-04-08T08:00:00.000Z',
  },
];

export const practiceQuestionSeed: PracticeQuestion[] = [
  {
    id: 'q_math_001',
    setId: 'set_math',
    questionText: '设 A 为 3×3 矩阵，特征值分别为 1,2,3，求 det(2A)。',
    answerText: 'det(2A) = 2^3 det(A) = 8 × 6 = 48。',
    explanation: '可利用行列式数乘性质：det(kA) = k^n det(A)。',
    tags: ['线性代数', '行列式'],
    difficulty: '进阶',
    createdAt: '2024-03-28T09:00:00.000Z',
    updatedAt: '2024-03-28T09:00:00.000Z',
  },
  {
    id: 'q_politics_001',
    setId: 'set_politics',
    questionText: '结合共同富裕目标，谈谈如何理解高质量发展。',
    answerText: '高质量发展是满足人民美好生活需要的发展，坚持以人民为中心，实现机会公平与共享发展成果。',
    explanation: '从“以人民为中心”“新发展理念”“共同富裕路径”三个层面展开。',
    tags: ['时政', '理论联系实际'],
    difficulty: '冲刺',
    createdAt: '2024-03-20T10:00:00.000Z',
    updatedAt: '2024-03-20T10:00:00.000Z',
  },
  {
    id: 'q_english_001',
    setId: 'set_english',
    questionText: '翻译：持续的技术创新是企业核心竞争力的来源。',
    answerText: 'Continuous technological innovation is the source of a company\'s core competitiveness.',
    explanation: '“核心竞争力”可译为 core competitiveness 或 competitive edge。',
    tags: ['翻译', '句式'],
    difficulty: '基础',
    createdAt: '2024-03-05T08:00:00.000Z',
    updatedAt: '2024-03-05T08:00:00.000Z',
  },
];
