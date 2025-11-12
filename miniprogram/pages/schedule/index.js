const { scheduleSeed } = require('../../data/dashboard.js');
const { loadFromStorage, saveToStorage } = require('../../utils/storage.js');

const SCHEDULE_STORAGE_KEY = 'scheduleItems';

const pad = (value) => (value < 10 ? `0${value}` : `${value}`);

const toTimestamp = (value) => {
  if (!value) {
    return Date.now();
  }
  const candidate = String(value).includes('T') ? value : String(value).replace(' ', 'T');
  const date = new Date(candidate);
  return Number.isNaN(date.getTime()) ? Date.now() : date.getTime();
};

const formatDisplayTime = (value) => {
  const timestamp = toTimestamp(value);
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const formatDate = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const formatTime = (date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

const createForm = () => {
  const now = new Date();
  const end = new Date(now.getTime() + 60 * 60 * 1000);
  return {
    title: '',
    type: '自习',
    startDate: formatDate(now),
    startTime: formatTime(now),
    endDate: formatDate(end),
    endTime: formatTime(end),
    location: '',
    focus: '',
    tags: '',
  };
};

const normalizeSchedule = (items) => {
  return (items || [])
    .map((item) => {
      const startTimestamp = toTimestamp(item.start);
      return {
        id: item.id || `schedule_${startTimestamp}`,
        title: item.title || '学习任务',
        type: item.type || '自习',
        start: formatDisplayTime(item.start),
        end: formatDisplayTime(item.end),
        location: item.location,
        focus: item.focus,
        tags: Array.isArray(item.tags) ? item.tags : [],
        _timestamp: startTimestamp,
      };
    })
    .sort((a, b) => a._timestamp - b._timestamp)
    .map((item) => {
      const clone = Object.assign({}, item);
      delete clone._timestamp;
      return clone;
    });
};

Page({
  data: {
    schedule: normalizeSchedule(scheduleSeed),
    form: createForm(),
    errorMessage: '',
    successMessage: '',
    loading: false,
    submitting: false,
    formVisible: false,
    formErrorMessage: '',
  },

  onShow() {
    const saved = loadFromStorage(SCHEDULE_STORAGE_KEY, scheduleSeed);
    this.setData({
      schedule: normalizeSchedule(saved),
      errorMessage: '',
      successMessage: '',
      formErrorMessage: '',
    });
  },

  toggleFormVisibility() {
    const nextVisible = !this.data.formVisible;
    if (!nextVisible && this.data.submitting) {
      return;
    }
    if (nextVisible) {
      this.setData({ formVisible: true, formErrorMessage: '', successMessage: '' });
      return;
    }

    this.setData({ formVisible: false, form: createForm(), formErrorMessage: '', successMessage: '' });
  },

  cancelForm() {
    if (this.data.submitting) {
      return;
    }

    this.setData({ formVisible: false, form: createForm(), formErrorMessage: '', successMessage: '' });
  },

  handleInput(event) {
    const dataset = (event && event.currentTarget && event.currentTarget.dataset) || {};
    const field = dataset.field;
    if (!field) {
      return;
    }
    const value = (event && event.detail && event.detail.value) || '';
    this.setData({
      form: Object.assign({}, this.data.form, { [field]: value }),
      errorMessage: '',
      successMessage: '',
      formErrorMessage: '',
    });
  },

  handleDateChange(event) {
    const dataset = (event && event.currentTarget && event.currentTarget.dataset) || {};
    const field = dataset.field;
    const value = (event && event.detail && event.detail.value) || '';
    if (!field) {
      return;
    }
    this.setData({
      form: Object.assign({}, this.data.form, { [field]: value }),
      errorMessage: '',
      successMessage: '',
      formErrorMessage: '',
    });
  },

  handleTimeChange(event) {
    const dataset = (event && event.currentTarget && event.currentTarget.dataset) || {};
    const field = dataset.field;
    const value = (event && event.detail && event.detail.value) || '';
    if (!field) {
      return;
    }
    this.setData({
      form: Object.assign({}, this.data.form, { [field]: value }),
      errorMessage: '',
      successMessage: '',
      formErrorMessage: '',
    });
  },

  createSchedule() {
    const form = this.data.form || {};
    if (!form.title || !String(form.title).trim()) {
      this.setData({ formErrorMessage: '请输入日程标题' });
      return;
    }

    if (!form.startDate || !form.startTime || !form.endDate || !form.endTime) {
      this.setData({ formErrorMessage: '请选择开始与结束时间' });
      return;
    }

    const tags = String(form.tags || '')
      .split(/[,，\s]+/)
      .map((tag) => tag.trim())
      .filter(Boolean);

    this.setData({ submitting: true, errorMessage: '', successMessage: '', formErrorMessage: '' });

    const scheduleItem = {
      id: `schedule_${Date.now()}`,
      title: String(form.title).trim(),
      type: form.type && String(form.type).trim() ? form.type.trim() : '自习',
      start: `${form.startDate} ${form.startTime}`,
      end: `${form.endDate} ${form.endTime}`,
      location: form.location && String(form.location).trim() ? form.location.trim() : undefined,
      focus: form.focus && String(form.focus).trim() ? form.focus.trim() : undefined,
      tags,
    };

    const schedule = normalizeSchedule([scheduleItem].concat(this.data.schedule || []));
    saveToStorage(SCHEDULE_STORAGE_KEY, schedule);

    this.setData({
      schedule,
      form: createForm(),
      successMessage: '日程已创建。',
      errorMessage: '',
      formVisible: false,
      formErrorMessage: '',
      submitting: false,
    });
  },
});
