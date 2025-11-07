import { scheduleSeed, type ScheduleItem } from '../../data/dashboard';
import { loadFromStorage, saveToStorage } from '../../utils/storage';

const SCHEDULE_STORAGE_KEY = 'scheduleItems';

const createForm = () => ({
  title: '',
  type: '自习',
  start: '',
  end: '',
  location: '',
  focus: '',
  tags: '',
});

const normalizeSchedule = (items: ScheduleItem[]): ScheduleItem[] =>
  items
    .map((item) => ({
      ...item,
      id: item.id || `schedule_${Date.now()}`,
      title: item.title || '学习任务',
      type: item.type || '自习',
      start: item.start || new Date().toISOString(),
      end: item.end || new Date().toISOString(),
      tags: item.tags || [],
    }))
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

Page({
  data: {
    schedule: scheduleSeed as ScheduleItem[],
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

  createSchedule() {
    const form = this.data.form;
    if (!form.title || !form.title.trim()) {
      this.setData({ errorMessage: '请输入日程标题' });
      return;
    }

    if (!form.start || !form.end) {
      this.setData({ errorMessage: '请填写开始与结束时间' });
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
      start: form.start,
      end: form.end,
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
