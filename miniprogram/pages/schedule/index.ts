import { scheduleSeed, type ScheduleItem } from '../../data/dashboard';
import { loadFromStorage, saveToStorage } from '../../utils/storage';

const SCHEDULE_STORAGE_KEY = 'scheduleItems';

interface FormState {
  title: string;
  type: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  location: string;
  focus: string;
  tags: string;
}

const pad = (value: number) => (value < 10 ? `0${value}` : `${value}`);

const toTimestamp = (value: string | undefined | null): number => {
  if (!value) {
    return Date.now();
  }
  const candidate = value.includes('T') ? value : value.replace(' ', 'T');
  const parsed = new Date(candidate);
  return Number.isNaN(parsed.getTime()) ? Date.now() : parsed.getTime();
};

const formatDisplayTime = (value: string | undefined | null): string => {
  const timestamp = toTimestamp(value);
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
};

const formatDate = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const formatTime = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

const createForm = (): FormState => {
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

const normalizeSchedule = (items: ScheduleItem[]): ScheduleItem[] =>
  items
    .map((item) => {
      const startTimestamp = toTimestamp(item.start);
      return {
        ...item,
        id: item.id || `schedule_${startTimestamp}`,
        title: item.title || '学习任务',
        type: item.type || '自习',
        start: formatDisplayTime(item.start),
        end: formatDisplayTime(item.end),
        tags: Array.isArray(item.tags) ? item.tags : [],
        _timestamp: startTimestamp,
      } as ScheduleItem & { _timestamp: number };
    })
    .sort((a, b) => a._timestamp - b._timestamp)
    .map(({ _timestamp, ...rest }) => rest);

Page({
  data: {
    schedule: normalizeSchedule(scheduleSeed) as ScheduleItem[],
    form: createForm(),
    errorMessage: '',
    successMessage: '',
  },

  onShow() {
    const saved = loadFromStorage<ScheduleItem[]>(SCHEDULE_STORAGE_KEY, scheduleSeed);
    this.setData({ schedule: normalizeSchedule(saved) });
  },

  handleInput(event: WechatMiniprogram.Input) {
    const field = event.currentTarget?.dataset?.field;
    if (!field) {
      return;
    }
    const value = event.detail.value ?? '';
    this.setData({
      form: { ...this.data.form, [field]: value },
      errorMessage: '',
      successMessage: '',
    });
  },

  handleDateChange(event: WechatMiniprogram.PickerChange) {
    const field = event.currentTarget?.dataset?.field;
    if (!field) {
      return;
    }
    const value = event.detail.value ?? '';
    this.setData({
      form: { ...this.data.form, [field]: value },
      errorMessage: '',
      successMessage: '',
    });
  },

  handleTimeChange(event: WechatMiniprogram.PickerChange) {
    const field = event.currentTarget?.dataset?.field;
    if (!field) {
      return;
    }
    const value = event.detail.value ?? '';
    this.setData({
      form: { ...this.data.form, [field]: value },
      errorMessage: '',
      successMessage: '',
    });
  },

  createSchedule() {
    const form = this.data.form;
    if (!form.title || !form.title.trim()) {
      this.setData({ errorMessage: '请输入日程标题' });
      return;
    }

    if (!form.startDate || !form.startTime || !form.endDate || !form.endTime) {
      this.setData({ errorMessage: '请选择开始与结束时间' });
      return;
    }

    const tags = form.tags
      .split(/[,，\s]+/)
      .map((tag) => tag.trim())
      .filter(Boolean);

    const scheduleItem: ScheduleItem = {
      id: `schedule_${Date.now()}`,
      title: form.title.trim(),
      type: form.type?.trim() || '自习',
      start: `${form.startDate} ${form.startTime}`,
      end: `${form.endDate} ${form.endTime}`,
      location: form.location?.trim() || undefined,
      focus: form.focus?.trim() || undefined,
      tags,
    };

    const schedule = normalizeSchedule([scheduleItem, ...this.data.schedule]);
    saveToStorage(SCHEDULE_STORAGE_KEY, schedule);

    this.setData({
      schedule,
      form: createForm(),
      successMessage: '日程已创建。',
      errorMessage: '',
    });
  },
});
