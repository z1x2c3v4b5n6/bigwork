import { practiceSetSeed, practiceQuestionSeed, type PracticeQuestion, type PracticeSetSummary } from '../../data/practice';
import { loadFromStorage, saveToStorage } from '../../utils/storage';

const SET_STORAGE_KEY = 'practiceSets';
const QUESTION_STORAGE_KEY = 'practiceQuestions';

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

const normalizeSets = (sets: PracticeSetSummary[]): PracticeSetSummary[] =>
  sets.map((set) => ({
    ...set,
    id: set.id || `set_${Date.now()}`,
    questionCount: Number(set.questionCount ?? 0),
  }));

const normalizeQuestions = (questions: PracticeQuestion[]): PracticeQuestion[] =>
  questions.map((question) => ({
    ...question,
    id: question.id || `question_${Date.now()}`,
  }));

Page({
  data: {
    sets: practiceSetSeed as PracticeSetSummary[],
    questions: practiceQuestionSeed as PracticeQuestion[],
    selectedSetId: practiceSetSeed[0]?.id ?? '',
    visibleQuestions: practiceQuestionSeed.filter((item) => item.setId === (practiceSetSeed[0]?.id ?? '')) as PracticeQuestion[],
    setForm: createSetForm(),
    questionForm: createQuestionForm(),
    errorMessage: '',
    successMessage: '',
  },

  onShow() {
    const savedSets = loadFromStorage<PracticeSetSummary[]>(SET_STORAGE_KEY, practiceSetSeed);
    const savedQuestions = loadFromStorage<PracticeQuestion[]>(QUESTION_STORAGE_KEY, practiceQuestionSeed);

    const sets = normalizeSets(savedSets);
    const questions = normalizeQuestions(savedQuestions);
    const defaultSetId = sets[0]?.id ?? '';
    const selectedSetId = sets.some((item) => item.id === this.data.selectedSetId)
      ? this.data.selectedSetId
      : defaultSetId;

    this.setData({
      sets,
      questions,
      selectedSetId,
      visibleQuestions: questions.filter((question) => question.setId === selectedSetId),
    });
  },

  selectSet(event: WechatMiniprogram.BaseEvent) {
    const id = event.currentTarget?.dataset?.id;
    if (!id) {
      return;
    }
    this.setData({
      selectedSetId: id,
      visibleQuestions: this.data.questions.filter((question) => question.setId === id),
      errorMessage: '',
      successMessage: '',
    });
  },

  handleSetInput(event: WechatMiniprogram.Input) {
    const field = event.currentTarget?.dataset?.field;
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
    const field = event.currentTarget?.dataset?.field;
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

  createSet() {
    const form = this.data.setForm;
    if (!form.title || !form.title.trim()) {
      this.setData({ errorMessage: '请输入题单名称' });
      return;
    }

    const tags = form.tags
      .split(/[,，\s]+/)
      .map((tag) => tag.trim())
      .filter(Boolean);

    const set: PracticeSetSummary = {
      id: `set_${Date.now()}`,
      title: form.title.trim(),
      description: form.description?.trim() || '尚未填写简介',
      difficulty: (form.difficulty as PracticeSetSummary['difficulty']) || '基础',
      tags,
      questionCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const sets = [set, ...this.data.sets];
    saveToStorage(SET_STORAGE_KEY, sets);
    this.setData({
      sets,
      selectedSetId: set.id,
      visibleQuestions: [],
      setForm: createSetForm(),
      successMessage: '题单创建成功，请继续添加题目。',
      errorMessage: '',
    });
  },

  createQuestion() {
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

    const question: PracticeQuestion = {
      id: `question_${Date.now()}`,
      setId,
      questionText: form.questionText.trim(),
      answerText: form.answerText?.trim() || '请在刷题后补充答案',
      explanation: form.explanation?.trim() || '建议整理思路、补充解析。',
      tags,
      difficulty: (form.difficulty as PracticeQuestion['difficulty']) || '基础',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const questions = [question, ...this.data.questions];
    const sets = this.data.sets.map((set) =>
      set.id === setId
        ? { ...set, questionCount: Number(set.questionCount ?? 0) + 1, updatedAt: new Date().toISOString() }
        : set,
    );

    saveToStorage(QUESTION_STORAGE_KEY, questions);
    saveToStorage(SET_STORAGE_KEY, sets);

    this.setData({
      questions,
      sets,
      visibleQuestions: questions.filter((item) => item.setId === setId),
      questionForm: createQuestionForm(),
      successMessage: '题目已录入。',
      errorMessage: '',
    });
  },
});
