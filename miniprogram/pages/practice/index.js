const { practiceSetSeed, practiceQuestionSeed } = require('../../data/practice');
const { loadFromStorage, saveToStorage } = require('../../utils/storage');

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

const normalizeSets = (sets) =>
  sets.map((set) => ({
    ...set,
    id: set.id || `set_${Date.now()}`,
    questionCount: Number(typeof set.questionCount === 'number' ? set.questionCount : 0),
  }));

const normalizeQuestions = (questions) =>
  questions.map((question) => ({
    ...question,
    id: question.id || `question_${Date.now()}`,
  }));

const firstSetId = () => (practiceSetSeed.length > 0 && practiceSetSeed[0].id) || '';

Page({
  data: {
    sets: practiceSetSeed,
    questions: practiceQuestionSeed,
    selectedSetId: firstSetId(),
    visibleQuestions: practiceQuestionSeed.filter((item) => item.setId === firstSetId()),
    setForm: createSetForm(),
    questionForm: createQuestionForm(),
    errorMessage: '',
    successMessage: '',
  },

  onShow() {
    const savedSets = normalizeSets(loadFromStorage(SET_STORAGE_KEY, practiceSetSeed));
    const savedQuestions = normalizeQuestions(loadFromStorage(QUESTION_STORAGE_KEY, practiceQuestionSeed));

    const defaultSetId = (savedSets.length > 0 && savedSets[0].id) || '';
    const selectedSetId = savedSets.some((item) => item.id === this.data.selectedSetId)
      ? this.data.selectedSetId
      : defaultSetId;

    this.setData({
      sets: savedSets,
      questions: savedQuestions,
      selectedSetId,
      visibleQuestions: savedQuestions.filter((question) => question.setId === selectedSetId),
    });
  },

  selectSet(event) {
    const target = event && event.currentTarget;
    const dataset = target && target.dataset;
    const id = dataset && dataset.id;
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

  handleSetInput(event) {
    const target = event && event.currentTarget;
    const dataset = target && target.dataset;
    const field = dataset && dataset.field;
    if (!field) {
      return;
    }
    const detail = event && event.detail;
    const value = (detail && detail.value) || '';
    this.setData({
      setForm: { ...this.data.setForm, [field]: value },
      errorMessage: '',
      successMessage: '',
    });
  },

  handleQuestionInput(event) {
    const target = event && event.currentTarget;
    const dataset = target && target.dataset;
    const field = dataset && dataset.field;
    if (!field) {
      return;
    }
    const detail = event && event.detail;
    const value = (detail && detail.value) || '';
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

    const set = {
      id: `set_${Date.now()}`,
      title: form.title.trim(),
      description: (form.description && form.description.trim()) || '尚未填写简介',
      difficulty: form.difficulty || '基础',
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

    const question = {
      id: `question_${Date.now()}`,
      setId,
      questionText: form.questionText.trim(),
      answerText: (form.answerText && form.answerText.trim()) || '请在刷题后补充答案',
      explanation: (form.explanation && form.explanation.trim()) || '建议整理思路、补充解析。',
      tags,
      difficulty: form.difficulty || '基础',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const questions = [question, ...this.data.questions];
    const sets = this.data.sets.map((set) => {
      if (set.id !== setId) {
        return set;
      }
      const count = Number(typeof set.questionCount === 'number' ? set.questionCount : 0) + 1;
      return {
        ...set,
        questionCount: count,
        updatedAt: new Date().toISOString(),
      };
    });

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
