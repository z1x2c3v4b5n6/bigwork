import { boutiqueWorkshops } from '../../data/courses';
import type { CourseProgress } from '../../data/dashboard';
import { apiRequest, type ApiError } from '../../utils/api';
import { ensureSession } from '../../utils/session';

interface MajorOption {
  id: string;
  name: string;
  description?: string | null;
}

interface CourseForm {
  title: string;
  teacher: string;
  category: string;
  progress: number;
  nextTask: string;
  description: string;
  majorId: string;
  tagsInput: string;
  mathSubjects: string[];
  englishSubjects: string[];
  visibleMajorIds: string[];
}

const mathSubjectOptions = ['数学一', '数学二', '数学三', '不考数学'];
const englishSubjectOptions = ['英语一', '英语二', '不考英语'];

const createEmptyForm = (majors: MajorOption[] = []): CourseForm => {
  const defaultMajorId = majors[0]?.id ?? '';
  return {
    title: '',
    teacher: '',
    category: '公共课',
    progress: 0,
    nextTask: '',
    description: '',
    majorId: defaultMajorId,
    tagsInput: '',
    mathSubjects: [],
    englishSubjects: [],
    visibleMajorIds: defaultMajorId ? [defaultMajorId] : [],
  };
};

const resolveMajorName = (majorId: string, majors: MajorOption[]) =>
  majors.find((major) => major.id === majorId)?.name ?? '请选择';

const normalizeList = (values: string[] | string | undefined | null): string[] => {
  if (Array.isArray(values)) {
    return Array.from(
      new Set(values.map((value) => String(value ?? '').trim()).filter((value) => value.length > 0)),
    );
  }
  if (typeof values === 'string') {
    return values
      .split(/[，,]/)
      .map((value) => value.trim())
      .filter((value) => value.length > 0);
  }
  return [];
};

const normalizeCourse = (course: CourseProgress): CourseProgress => ({
  ...course,
  tags: Array.isArray(course.tags) ? course.tags : [],
  suitability: course.suitability
    ? {
        mathSubjects: normalizeList(course.suitability.mathSubjects),
        englishSubjects: normalizeList(course.suitability.englishSubjects),
        majors: normalizeList(course.suitability.majors),
        majorIds: normalizeList(course.suitability.majorIds),
        scoreMin: course.suitability.scoreMin ?? undefined,
        scoreMax: course.suitability.scoreMax ?? undefined,
      }
    : undefined,
});

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
    mathSubjectOptions,
    englishSubjectOptions,
  },

  onShow() {
    void this.loadPage();
  },

  async loadPage() {
    this.setData({
      loading: true,
      errorMessage: '',
      successMessage: '',
      formErrorMessage: '',
    });

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
      const currentForm = this.data.form;
      const form = currentForm.majorId
        ? { ...currentForm }
        : createEmptyForm(majors);
      if (!form.visibleMajorIds || form.visibleMajorIds.length === 0) {
        form.visibleMajorIds = form.majorId ? [form.majorId] : [];
      }
      const selectedMajorName = resolveMajorName(form.majorId, majors);

      this.setData({
        courses: coursesResponse.map(normalizeCourse),
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
    if (!Array.isArray(response.courses)) {
      return [];
    }
    return response.courses.map(normalizeCourse);
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
    const field = event.currentTarget?.dataset?.field as keyof CourseForm | undefined;
    if (!field) {
      return;
    }
    const value = event.detail.value;
    const nextValue = field === 'progress' ? Number(value) : value;
    this.setData({
      form: { ...this.data.form, [field]: nextValue } as CourseForm,
      errorMessage: '',
      successMessage: '',
      formErrorMessage: '',
    });
  },

  handleMajorChange(event: WechatMiniprogram.PickerChange) {
    const index = Number(event.detail.value ?? 0);
    const nextMajor = this.data.majors[index]?.id ?? '';
    const visibleMajorIds = this.data.form.visibleMajorIds.includes(nextMajor)
      ? this.data.form.visibleMajorIds
      : nextMajor
      ? Array.from(new Set([...this.data.form.visibleMajorIds, nextMajor]))
      : this.data.form.visibleMajorIds;
    this.setData({
      form: { ...this.data.form, majorId: nextMajor, visibleMajorIds },
      selectedMajorName: resolveMajorName(nextMajor, this.data.majors),
      errorMessage: '',
      successMessage: '',
      formErrorMessage: '',
    });
  },

  handleCheckboxChange(event: WechatMiniprogram.CheckboxGroupChange) {
    const field = event.currentTarget?.dataset?.field as keyof CourseForm | undefined;
    if (!field) {
      return;
    }
    const values = Array.isArray(event.detail?.value) ? event.detail.value : [];
    this.setData({
      form: { ...this.data.form, [field]: values } as CourseForm,
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
    const tags = normalizeList(form.tagsInput);
    const mathSubjects = normalizeList(form.mathSubjects);
    const englishSubjects = normalizeList(form.englishSubjects);
    const visibleMajorIdsRaw = normalizeList(form.visibleMajorIds);
    const includeOthers = visibleMajorIdsRaw.includes('__other__');
    const visibleMajorIds = visibleMajorIdsRaw.filter((value) => value !== '__other__');
    const visibleMajorNames = visibleMajorIds
      .map((id) => resolveMajorName(id, this.data.majors))
      .filter((name) => name && name !== '请选择');
    if (includeOthers && !visibleMajorNames.includes('其他专业')) {
      visibleMajorNames.push('其他专业');
    }

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
          tags: tags.length > 0 ? tags : undefined,
          mathSubjects: mathSubjects.length > 0 ? mathSubjects : undefined,
          englishSubjects: englishSubjects.length > 0 ? englishSubjects : undefined,
          visibleMajorIds: visibleMajorIds.length > 0 ? visibleMajorIds : undefined,
          visibleMajorNames: visibleMajorNames.length > 0 ? visibleMajorNames : undefined,
        },
      });

      const refreshed = await this.fetchCourses();
      const nextForm = createEmptyForm(this.data.majors);

      this.setData({
        courses: refreshed.map(normalizeCourse),
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
