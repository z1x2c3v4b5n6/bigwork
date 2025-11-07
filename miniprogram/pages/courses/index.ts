import { defaultMajors, seedCourseTemplates, boutiqueWorkshops, toCourseProgress } from '../../data/courses';
import type { CourseProgress } from '../../data/dashboard';
import { loadFromStorage, saveToStorage } from '../../utils/storage';

const COURSE_STORAGE_KEY = 'courses';

const createEmptyForm = () => ({
  title: '',
  teacher: '',
  category: '公共课',
  progress: 0,
  nextTask: '',
  description: '',
  majorId: defaultMajors[0]?.id ?? '',
});

const resolveMajorName = (majorId: string) => defaultMajors.find((major) => major.id === majorId)?.name ?? '请选择';

Page({
  data: {
    courses: toCourseProgress(seedCourseTemplates) as CourseProgress[],
    form: createEmptyForm(),
    majors: defaultMajors,
    workshops: boutiqueWorkshops,
    errorMessage: '',
    successMessage: '',
    selectedMajorName: resolveMajorName(createEmptyForm().majorId),
  },

  onShow() {
    const saved = loadFromStorage<CourseProgress[]>(COURSE_STORAGE_KEY, toCourseProgress(seedCourseTemplates));
    const currentForm = this.data.form;
    this.setData({ courses: saved, selectedMajorName: resolveMajorName(currentForm.majorId) });
  },

  handleInput(event: WechatMiniprogram.Input) {
    const field = event.currentTarget?.dataset?.field;
    if (!field) {
      return;
    }
    const value = event.detail.value;
    const nextForm = { ...this.data.form } as Record<string, unknown>;
    nextForm[field] = field === 'progress' ? Number(value) : value;
    this.setData({ form: nextForm, errorMessage: '', successMessage: '' });
  },

  handleMajorChange(event: WechatMiniprogram.PickerChange) {
    const index = Number(event.detail.value ?? 0);
    const nextMajor = this.data.majors[index]?.id ?? '';
    this.setData({
      form: { ...this.data.form, majorId: nextMajor },
      selectedMajorName: resolveMajorName(nextMajor),
      errorMessage: '',
      successMessage: '',
    });
  },

  submitCourse() {
    const form = this.data.form;
    if (!form.title || !form.title.trim()) {
      this.setData({ errorMessage: '请输入课程名称' });
      return;
    }

    if (!form.majorId) {
      this.setData({ errorMessage: '请选择所属专业' });
      return;
    }

    const normalizedProgress = Math.min(100, Math.max(0, Number(form.progress) || 0));

    const newCourse: CourseProgress = {
      id: `course_${Date.now()}`,
      title: form.title.trim(),
      category: form.category?.trim() || '公共课',
      teacher: form.teacher?.trim() || '待定讲师',
      progress: normalizedProgress,
      nextTask: form.nextTask?.trim() || '请为课程设置复习任务',
    };

    const updatedCourses = [newCourse, ...this.data.courses];

    saveToStorage(COURSE_STORAGE_KEY, updatedCourses);

    const nextForm = createEmptyForm();

    this.setData({
      courses: updatedCourses,
      form: nextForm,
      selectedMajorName: resolveMajorName(nextForm.majorId),
      successMessage: '课程已保存，可在列表顶部查看。',
      errorMessage: '',
    });
  },
});
