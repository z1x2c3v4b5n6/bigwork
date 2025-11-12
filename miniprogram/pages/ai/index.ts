import { apiRequest, type ApiError } from '../../utils/api';
import { ensureSession } from '../../utils/session';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAtIso: string;
  createdAtText: string;
}

interface AiSuggestion {
  id: string;
  title: string;
  description: string;
  sampleQuestion: string;
}

interface AiCourseRecommendation {
  title: string;
  teacher: string;
  highlight: string;
}

interface AiMaterialRecommendation {
  title: string;
  type: string;
  url: string;
  description: string;
}

interface AiConversationPreview {
  id: string;
  question: string;
  answer: string;
  createdAt: string | null;
  createdAtText: string;
}

type AiOverviewResponse = {
  suggestions?: AiSuggestion[];
  recentConversations?: AiConversationPreview[];
  recommendedCourses?: AiCourseRecommendation[];
  recommendedMaterials?: AiMaterialRecommendation[];
};

const fallbackSuggestions: AiSuggestion[] = [
  {
    id: 'english',
    title: '英语写作突破',
    description: '梳理写作模板与高分表达，匹配历年真题训练。',
    sampleQuestion: '如何整理英语作文模板，写作时更快进入状态？',
  },
  {
    id: 'algorithm',
    title: '算法与 408 提升',
    description: '围绕 408 高频考点强化，补齐数据结构薄弱环节。',
    sampleQuestion: '408 数据结构与算法刷题应该如何安排顺序？',
  },
  {
    id: 'interview',
    title: '复试面试准备',
    description: '模拟导师追问场景，完善结构化自我介绍。',
    sampleQuestion: '复试面试自我介绍需要包含哪些重点？',
  },
];

const fallbackCourseRecommendations: AiCourseRecommendation[] = [
  {
    title: '英语写作冲刺训练营',
    teacher: '王老师',
    highlight: '系统整理万能开头、结尾模板，配合真题限时演练。',
  },
  {
    title: '408 高频考点刷题班',
    teacher: '张老师',
    highlight: '按知识点拆分题型，补齐图论与动态规划薄弱环节。',
  },
  {
    title: '复试面试模拟工作坊',
    teacher: '教研团队',
    highlight: '模拟导师追问场景，打磨结构化自我介绍。',
  },
];

const fallbackMaterialRecommendations: AiMaterialRecommendation[] = [
  {
    title: '英语作文万能句型速查表',
    type: '资料',
    url: '',
    description: '精选 30 句高频万能句，支持临场快速套用。',
  },
  {
    title: '线代必背公式与易错点',
    type: '资料',
    url: '',
    description: '覆盖矩阵运算、特征值等核心考点，附典型例题。',
  },
  {
    title: '复试热点答题模板',
    type: '资料',
    url: '',
    description: '按时政主题整理的结构化答题模板，便于速记。',
  },
];

const formatTimestamp = (input: string | number | Date): string => {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const pad = (value: number) => String(value).padStart(2, '0');
  const now = new Date();

  if (now.getFullYear() === date.getFullYear()) {
    if (now.getMonth() === date.getMonth() && now.getDate() === date.getDate()) {
      return `今天 ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (
      yesterday.getFullYear() === date.getFullYear() &&
      yesterday.getMonth() === date.getMonth() &&
      yesterday.getDate() === date.getDate()
    ) {
      return `昨天 ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    }
  }

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(
    date.getMinutes(),
  )}`;
};

const createMessage = (role: 'user' | 'assistant', content: string): ChatMessage => {
  const now = new Date();
  return {
    id: `${role}-${now.getTime()}-${Math.random().toString(16).slice(2)}`,
    role,
    content,
    createdAtIso: now.toISOString(),
    createdAtText: formatTimestamp(now),
  };
};

Page({
  data: {
    inputValue: '',
    loading: false,
    errorMessage: '',
    overviewLoading: false,
    overviewError: '',
    messages: [] as ChatMessage[],
    suggestions: fallbackSuggestions,
    recentConversations: [] as AiConversationPreview[],
    recommendedCourses: fallbackCourseRecommendations,
    recommendedMaterials: fallbackMaterialRecommendations,
  },

  async onShow() {
    await this.initialize();
  },

  async initialize() {
    this.setData({ errorMessage: '', overviewError: '' });
    await this.loadOverview();
  },

  async loadOverview() {
    this.setData({ overviewLoading: true, overviewError: '' });

    try {
      const response = await apiRequest<AiOverviewResponse>({ path: '/ai/overview' });

      const suggestions = Array.isArray(response.suggestions) && response.suggestions.length
        ? response.suggestions.map((item, index) => ({
            id: item.id || `suggestion-${index}`,
            title: item.title || fallbackSuggestions[index % fallbackSuggestions.length].title,
            description: item.description || fallbackSuggestions[index % fallbackSuggestions.length].description,
            sampleQuestion:
              item.sampleQuestion || fallbackSuggestions[index % fallbackSuggestions.length].sampleQuestion,
          }))
        : fallbackSuggestions;

      const recentConversations = Array.isArray(response.recentConversations)
        ? response.recentConversations
            .filter((item) => typeof item?.question === 'string' && item.question.trim())
            .map((item, index) => ({
              id: item.id ? String(item.id) : `recent-${index}`,
              question: item.question.trim(),
              answer: item.answer || '',
              createdAt: item.createdAt || null,
              createdAtText:
                item.createdAtText || (item.createdAt ? formatTimestamp(item.createdAt) : ''),
            }))
        : [];

      const recommendedCourses = Array.isArray(response.recommendedCourses) && response.recommendedCourses.length
        ? response.recommendedCourses
        : fallbackCourseRecommendations;

      const recommendedMaterials =
        Array.isArray(response.recommendedMaterials) && response.recommendedMaterials.length
          ? response.recommendedMaterials
          : fallbackMaterialRecommendations;

      this.setData({
        suggestions,
        recentConversations,
        recommendedCourses,
        recommendedMaterials,
      });
    } catch (error) {
      const apiError = error as ApiError;
      const message =
        apiError?.statusCode === 401
          ? '登录后可查看个性化推荐，可在“我的”页登录后重试。'
          : apiError?.message || '获取 AI 助手概览失败，请稍后再试。';

      this.setData({
        overviewError: message,
        suggestions: fallbackSuggestions,
        recentConversations: [],
        recommendedCourses: fallbackCourseRecommendations,
        recommendedMaterials: fallbackMaterialRecommendations,
      });
    } finally {
      this.setData({ overviewLoading: false });
    }
  },

  handleInput(event: WechatMiniprogram.Input) {
    this.setData({ inputValue: event.detail.value ?? '' });
  },

  async sendMessage() {
    const question = this.data.inputValue.trim();
    if (!question || this.data.loading) {
      return;
    }

    const userMessage = createMessage('user', question);
    const nextMessages = [...this.data.messages, userMessage];
    this.setData({
      loading: true,
      inputValue: '',
      errorMessage: '',
      messages: nextMessages,
    });

    try {
      await ensureSession();
    } catch (error) {
      const apiError = error as ApiError;
      const message =
        apiError?.statusCode === 401
          ? '登录后可使用 AI 助手，可在“我的”页登录后重试。'
          : apiError?.message || '登录状态校验失败，请稍后再试。';
      this.setData({ loading: false, errorMessage: message });
      return;
    }

    try {
      const response = await apiRequest<{ answer: string }>({
        path: '/ai/ask',
        method: 'POST',
        data: { question },
      });
      const answerText = response?.answer || '暂未获取到答案，请稍后再试。';
      const assistantMessage = createMessage('assistant', answerText);
      const newRecent: AiConversationPreview = {
        id: assistantMessage.id,
        question,
        answer: answerText,
        createdAt: assistantMessage.createdAtIso,
        createdAtText: assistantMessage.createdAtText,
      };
      const dedupedRecent = [newRecent, ...this.data.recentConversations]
        .filter((item, index, array) => array.findIndex((entry) => entry.question === item.question) === index)
        .slice(0, 5);

      this.setData({
        messages: [...nextMessages, assistantMessage],
        loading: false,
        recentConversations: dedupedRecent,
      });
      void this.loadOverview();
    } catch (error) {
      const apiError = error as ApiError;
      const message = apiError?.message || 'AI 助手暂时不可用，请稍后再试。';
      this.setData({ loading: false, errorMessage: message });
    }
  },

  applySuggestion(event: WechatMiniprogram.BaseEvent) {
    const question = (event.currentTarget?.dataset?.question as string | undefined) ?? '';
    if (!question) {
      return;
    }
    this.setData({ inputValue: question });
    void this.sendMessage();
  },

  copyLink(event: WechatMiniprogram.BaseEvent) {
    const url = (event.currentTarget?.dataset?.url as string | undefined) ?? '';
    if (!url) {
      wx.showToast({ title: '暂无链接', icon: 'none' });
      return;
    }

    wx.setClipboardData({
      data: url,
      success: () => {
        wx.showToast({ title: '链接已复制', icon: 'success' });
      },
      fail: () => {
        wx.showToast({ title: '复制失败', icon: 'none' });
      },
    });
  },

  resend(event: WechatMiniprogram.BaseEvent) {
    const question = event.currentTarget?.dataset?.question;
    if (!question) {
      return;
    }
    this.setData({ inputValue: question });
    void this.sendMessage();
  },
});
