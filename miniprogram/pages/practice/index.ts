import {
  practiceSetSeed,
  practiceQuestionSeed,
  type PracticeQuestion,
  type PracticeSetSummary,
} from '../../data/practice';
import { apiRequest, type ApiError } from '../../utils/api';
import { ensureSession } from '../../utils/session';

const createSetForm = () => ({
  title: '',
  description: '',
  difficulty: '基础',
  tags: '',
});

const createQuestionForm = () => ({
  questionText: '',
  answerText: '',
  explanation: '',
  tags: '',
  difficulty: '基础',
});

const difficultyDisplayMap: Record<string, string> = {
  easy: '基础',
  medium: '进阶',
  hard: '冲刺',
};

const difficultyApiMap: Record<string, string> = {
  基础: 'easy',
  进阶: 'medium',
  冲刺: 'hard',
};

const toDisplayDifficulty = (value: string | null | undefined): string => {
  if (!value) {
    return '基础';
  }
  const trimmed = String(value).trim();
  return difficultyDisplayMap[trimmed] || trimmed || '基础';
};

const toApiDifficulty = (value: string | null | undefined): string => {
  if (!value) {
    return 'medium';
  }
  const trimmed = String(value).trim();
  return difficultyApiMap[trimmed] || trimmed || 'medium';
};

const mapSet = (set: PracticeSetSummary): PracticeSetSummary => ({
  ...set,
  difficulty: toDisplayDifficulty(set.difficulty),
  questionCount: Number(set.questionCount ?? 0),
  tags: Array.isArray(set.tags) ? set.tags : [],
});

const mapQuestion = (question: PracticeQuestion, setId: string): PracticeQuestion => ({
  ...question,
  setId,
  difficulty: toDisplayDifficulty(question.difficulty),
  tags: Array.isArray(question.tags) ? question.tags : [],
});

Page({
  data: {
    sets: practiceSetSeed.map((set) => mapSet(set)) as PracticeSetSummary[],
    selectedSetId: practiceSetSeed[0]?.id ?? '',
    visibleQuestions: practiceQuestionSeed
      .filter((item) => item.setId === (practiceSetSeed[0]?.id ?? ''))
      .map((question) => mapQuestion(question, question.setId)) as PracticeQuestion[],
    setForm: createSetForm(),
    questionForm: createQuestionForm(),
    errorMessage: '',
    successMessage: '',
    loadingSets: false,
    loadingQuestions: false,
    submittingSet: false,
    submittingQuestion: false,
  },

  onShow() {
    void this.loadSets();
  },

  async loadSets() {
    this.setData({ loadingSets: true, errorMessage: '', successMessage: '' });

    try {
      await ensureSession();
    } catch (error) {
      const apiError = error as ApiError;
      const message =
        apiError?.statusCode === 401
          ? '请先登录后再同步题单，可在个人中心完成账号密码登录。'
          : apiError?.message || '无法校验登录状态，请稍后重试。';
      this.setData({ loadingSets: false, errorMessage: message });
      return;
    }

    try {
      const response = await apiRequest<{ sets: PracticeSetSummary[] }>({ path: '/practice/sets' });
      const sets = Array.isArray(response.sets) ? response.sets.map((set) => mapSet(set)) : [];
      const selectedSetId = sets.some((set) => set.id === this.data.selectedSetId)
        ? this.data.selectedSetId
        : sets[0]?.id ?? '';

      this.setData({ sets, selectedSetId });

      if (selectedSetId) {
        await this.loadQuestions(selectedSetId);
      } else {
        this.setData({ visibleQuestions: [] });
      }
    } catch (error) {
      const apiError = error as ApiError;
      this.setData({ errorMessage: apiError?.message || '加载题单失败，请稍后重试。' });
    } finally {
      this.setData({ loadingSets: false });
    }
  },

  async loadQuestions(setId: string) {
    this.setData({ loadingQuestions: true, errorMessage: '', successMessage: '' });

    try {
      const response = await apiRequest<{ questions: PracticeQuestion[] }>({
        path: `/practice/sets/${setId}/questions`,
      });
      const questions = Array.isArray(response.questions)
        ? response.questions.map((question) => mapQuestion(question, setId))
        : [];
      this.setData({ visibleQuestions: questions });
    } catch (error) {
      const apiError = error as ApiError;
      this.setData({ errorMessage: apiError?.message || '加载题目失败，请稍后重试。' });
      this.setData({ visibleQuestions: [] });
    } finally {
      this.setData({ loadingQuestions: false });
    }
  },

  selectSet(event: WechatMiniprogram.BaseEvent) {
    const id = event.currentTarget?.dataset?.id;
    if (!id || id === this.data.selectedSetId) {
      return;
    }
    this.setData({ selectedSetId: id, visibleQuestions: [] });
    void this.loadQuestions(id);
  },

  handleSetInput(event: WechatMiniprogram.Input) {
    const field = event.currentTarget?.dataset?.field as keyof ReturnType<typeof createSetForm> | undefined;
    if (!field) {
      return;
    }
    const value = event.detail.value ?? '';
    this.setData({
      setForm: { ...this.data.setForm, [field]: value },
      errorMessage: '',
      successMessage: '',
    });
  },

  handleQuestionInput(event: WechatMiniprogram.Input) {
    const field = event.currentTarget?.dataset?.field as keyof ReturnType<typeof createQuestionForm> | undefined;
    if (!field) {
      return;
    }
    const value = event.detail.value ?? '';
    this.setData({
      questionForm: { ...this.data.questionForm, [field]: value },
      errorMessage: '',
      successMessage: '',
    });
  },

  async createSet() {
    const form = this.data.setForm;
    if (!form.title || !form.title.trim()) {
      this.setData({ errorMessage: '请输入题单名称' });
      return;
    }

    const tags = form.tags
      .split(/[,，\s]+/)
      .map((tag) => tag.trim())
      .filter(Boolean);

    this.setData({ submittingSet: true, errorMessage: '', successMessage: '' });

    try {
      await apiRequest({
        path: '/practice/sets',
        method: 'POST',
        data: {
          title: form.title.trim(),
          description: form.description?.trim() || null,
          difficulty: toApiDifficulty(form.difficulty),
          tags,
        },
      });

      await this.loadSets();
      this.setData({ setForm: createSetForm(), successMessage: '题单创建成功，请继续添加题目。' });
    } catch (error) {
      const apiError = error as ApiError;
      this.setData({ errorMessage: apiError?.message || '创建题单失败，请稍后重试。' });
    } finally {
      this.setData({ submittingSet: false });
    }
  },

  async createQuestion() {
    const form = this.data.questionForm;
    const setId = this.data.selectedSetId;

    if (!setId) {
      this.setData({ errorMessage: '请先选择题单' });
      return;
    }

    if (!form.questionText || !form.questionText.trim()) {
      this.setData({ errorMessage: '请输入题干内容' });
      return;
    }

    const tags = form.tags
      .split(/[,，\s]+/)
      .map((tag) => tag.trim())
      .filter(Boolean);

    this.setData({ submittingQuestion: true, errorMessage: '', successMessage: '' });

    try {
      await apiRequest({
        path: `/practice/sets/${setId}/questions`,
        method: 'POST',
        data: {
          questionText: form.questionText.trim(),
          answerText: form.answerText?.trim() || null,
          explanation: form.explanation?.trim() || null,
          tags,
          difficulty: toApiDifficulty(form.difficulty),
        },
      });

      await this.loadQuestions(setId);
      this.setData({ questionForm: createQuestionForm(), successMessage: '题目已录入。' });
    } catch (error) {
      const apiError = error as ApiError;
      this.setData({ errorMessage: apiError?.message || '保存题目失败，请稍后重试。' });
    } finally {
      this.setData({ submittingQuestion: false });
    }
  },
});
