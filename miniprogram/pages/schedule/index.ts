import { scheduleSeed, type ScheduleItem } from '../../data/dashboard';
import { apiRequest, type ApiError } from '../../utils/api';
import { ensureSession } from '../../utils/session';

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
    loading: false,
    submitting: false,
    formVisible: false,
    formErrorMessage: '',
  },

  onShow() {
    void this.loadSchedule();
  },

  async loadSchedule() {
    this.setData({ loading: true, errorMessage: '', successMessage: '', formErrorMessage: '' });

    try {
      await ensureSession();
    } catch (error) {
      const apiError = error as ApiError;
      const message =
        apiError?.statusCode === 401
          ? '请先在个人中心完成登录后，再同步学习日程。'
          : apiError?.message || '无法校验登录状态，请稍后重试。';
      this.setData({ loading: false, errorMessage: message });
      return;
    }

    try {
      const response = await apiRequest<{ schedule: ScheduleItem[] }>({ path: '/learning/schedule' });
      const items = Array.isArray(response.schedule) ? response.schedule : [];
      this.setData({ schedule: normalizeSchedule(items) });
    } catch (error) {
      const apiError = error as ApiError;
      this.setData({ errorMessage: apiError?.message || '加载学习日程失败，请稍后重试。' });
    } finally {
      this.setData({ loading: false });
    }
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

  handleInput(event: WechatMiniprogram.Input) {
    const field = event.currentTarget?.dataset?.field as keyof FormState | undefined;
    if (!field) {
      return;
    }
    const value = event.detail.value ?? '';
    this.setData({
      form: { ...this.data.form, [field]: value },
      errorMessage: '',
      successMessage: '',
      formErrorMessage: '',
    });
  },

  handleDateChange(event: WechatMiniprogram.PickerChange) {
    const field = event.currentTarget?.dataset?.field as keyof FormState | undefined;
    if (!field) {
      return;
    }
    const value = event.detail.value ?? '';
    this.setData({
      form: { ...this.data.form, [field]: value },
      errorMessage: '',
      successMessage: '',
      formErrorMessage: '',
    });
  },

  handleTimeChange(event: WechatMiniprogram.PickerChange) {
    const field = event.currentTarget?.dataset?.field as keyof FormState | undefined;
    if (!field) {
      return;
    }
    const value = event.detail.value ?? '';
    this.setData({
      form: { ...this.data.form, [field]: value },
      errorMessage: '',
      successMessage: '',
      formErrorMessage: '',
    });
  },

  async createSchedule() {
    const form = this.data.form;
    if (!form.title || !form.title.trim()) {
      this.setData({ formErrorMessage: '请输入日程标题' });
      return;
    }

    if (!form.startDate || !form.startTime || !form.endDate || !form.endTime) {
      this.setData({ formErrorMessage: '请选择开始与结束时间' });
      return;
    }

    const tags = form.tags
      .split(/[,，\s]+/)
      .map((tag) => tag.trim())
      .filter(Boolean);

    this.setData({ submitting: true, errorMessage: '', successMessage: '', formErrorMessage: '' });

    try {
      await apiRequest({
        path: '/learning/schedule',
        method: 'POST',
        data: {
          title: form.title.trim(),
          type: form.type?.trim() || '自习',
          start: `${form.startDate} ${form.startTime}`,
          end: `${form.endDate} ${form.endTime}`,
          allDay: false,
          location: form.location?.trim() || null,
          focus: form.focus?.trim() || null,
          tags,
        },
      });

      await this.loadSchedule();
      this.setData({ form: createForm(), successMessage: '日程已创建。', formVisible: false, formErrorMessage: '' });
    } catch (error) {
      const apiError = error as ApiError;
      const message = apiError?.message || '创建日程失败，请稍后重试。';
      this.setData({ formErrorMessage: message, errorMessage: message });
    } finally {
      this.setData({ submitting: false });
    }
  },
});
