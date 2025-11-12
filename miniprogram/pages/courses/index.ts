import { boutiqueWorkshops } from '../../data/courses';
import type { CourseProgress } from '../../data/dashboard';
import { apiRequest, type ApiError } from '../../utils/api';
import { ensureSession } from '../../utils/session';

interface MajorOption {
  id: string;
  name: string;
  description?: string | null;
}

const createEmptyForm = (majors: MajorOption[] = []) => ({
  title: '',
  teacher: '',
  category: '公共课',
  progress: 0,
  nextTask: '',
  description: '',
  majorId: majors[0]?.id ?? '',
});

const resolveMajorName = (majorId: string, majors: MajorOption[]) =>
  majors.find((major) => major.id === majorId)?.name ?? '请选择';

Page({
  data: {
    courses: [] as CourseProgress[],
    form: createEmptyForm(),
    majors: [] as MajorOption[],
    workshops: boutiqueWorkshops,
    errorMessage: '',
    successMessage: '',
    loading: false,
    submitting: false,
    selectedMajorName: '请选择',
    formVisible: false,
    formErrorMessage: '',
  },

  onShow() {
    void this.loadPage();
  },

  async loadPage() {
    this.setData({ loading: true, errorMessage: '', successMessage: '', formErrorMessage: '' });

    try {
      await ensureSession();
    } catch (error) {
      const apiError = error as ApiError;
      const message =
        apiError?.statusCode === 401
          ? '请先登录后再访问课程体系，可在个人中心输入账号密码。'
          : apiError?.message || '无法校验登录状态，请稍后重试。';
      this.setData({ loading: false, errorMessage: message });
      return;
    }

    try {
      const [coursesResponse, majorsResponse] = await Promise.all([
        this.fetchCourses(),
        this.fetchMajors(),
      ]);

      const majors = majorsResponse.length > 0 ? majorsResponse : this.data.majors;
      const form = this.data.form.majorId
        ? this.data.form
        : createEmptyForm(majors);
      const selectedMajorName = resolveMajorName(form.majorId, majors);

      this.setData({
        courses: coursesResponse,
        majors,
        form,
        selectedMajorName,
      });
    } catch (error) {
      const apiError = error as ApiError;
      const message = apiError?.message || '加载课程数据失败，请稍后重试。';
      this.setData({ errorMessage: message });
    } finally {
      this.setData({ loading: false });
    }
  },

  async fetchCourses(): Promise<CourseProgress[]> {
    const response = await apiRequest<{ courses: CourseProgress[] }>({
      path: '/learning/courses',
    });
    return Array.isArray(response.courses) ? response.courses : [];
  },

  async fetchMajors(): Promise<MajorOption[]> {
    try {
      const majors = await apiRequest<MajorOption[]>({ path: '/majors' });
      return majors
        .map((major) => ({
          id: major.id != null ? String(major.id) : '',
          name: major.name || '未命名专业',
          description: major.description ?? null,
        }))
        .filter((major) => major.id);
    } catch (error) {
      const apiError = error as ApiError;
      console.warn('加载专业列表失败，将使用现有选项', apiError?.message || error);
      return [];
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

    const nextForm = createEmptyForm(this.data.majors);
    this.setData({
      formVisible: false,
      form: nextForm,
      selectedMajorName: resolveMajorName(nextForm.majorId, this.data.majors),
      formErrorMessage: '',
    });
  },

  cancelForm() {
    if (this.data.submitting) {
      return;
    }

    const nextForm = createEmptyForm(this.data.majors);
    this.setData({
      formVisible: false,
      form: nextForm,
      selectedMajorName: resolveMajorName(nextForm.majorId, this.data.majors),
      formErrorMessage: '',
      successMessage: '',
    });
  },

  handleInput(event: WechatMiniprogram.Input) {
    const field = event.currentTarget?.dataset?.field as keyof typeof this.data.form | undefined;
    if (!field) {
      return;
    }
    const value = event.detail.value;
    const key = field;
    const nextValue = key === 'progress' ? Number(value) : value;
    this.setData({
      form: { ...this.data.form, [key]: nextValue } as typeof this.data.form,
      errorMessage: '',
      successMessage: '',
      formErrorMessage: '',
    });
  },

  handleMajorChange(event: WechatMiniprogram.PickerChange) {
    const index = Number(event.detail.value ?? 0);
    const nextMajor = this.data.majors[index]?.id ?? '';
    this.setData({
      form: { ...this.data.form, majorId: nextMajor },
      selectedMajorName: resolveMajorName(nextMajor, this.data.majors),
      errorMessage: '',
      successMessage: '',
      formErrorMessage: '',
    });
  },

  async submitCourse() {
    const form = this.data.form;
    if (!form.title || !form.title.trim()) {
      this.setData({ formErrorMessage: '请输入课程名称' });
      return;
    }

    if (!form.majorId) {
      this.setData({ formErrorMessage: '请选择所属专业' });
      return;
    }

    const normalizedProgress = Math.min(100, Math.max(0, Number(form.progress) || 0));

    this.setData({ submitting: true, errorMessage: '', successMessage: '', formErrorMessage: '' });

    try {
      await apiRequest({
        path: '/learning/courses',
        method: 'POST',
        data: {
          title: form.title.trim(),
          teacher: form.teacher?.trim() || '待定讲师',
          category: form.category?.trim() || '公共课',
          progress: normalizedProgress,
          nextTask: form.nextTask?.trim() || null,
          description: form.description?.trim() || null,
          majorId: form.majorId,
        },
      });

      const refreshed = await this.fetchCourses();
      const nextForm = createEmptyForm(this.data.majors);

      this.setData({
        courses: refreshed,
        form: nextForm,
        selectedMajorName: resolveMajorName(nextForm.majorId, this.data.majors),
        successMessage: '课程已保存，可在列表顶部查看。',
        formVisible: false,
        formErrorMessage: '',
      });
    } catch (error) {
      const apiError = error as ApiError;
      const message = apiError?.message || '保存课程失败，请稍后重试。';
      this.setData({ formErrorMessage: message, errorMessage: message });
    } finally {
      this.setData({ submitting: false });
    }
  },
});
