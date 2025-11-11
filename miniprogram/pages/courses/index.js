const {
  defaultMajors,
  seedCourseTemplates,
  boutiqueWorkshops,
  toCourseProgress,
} = require('../../data/courses.js');
const { loadFromStorage, saveToStorage } = require('../../utils/storage.js');

const COURSE_STORAGE_KEY = 'courses';

const createEmptyForm = () => ({
  title: '',
  teacher: '',
  category: '公共课',
  progress: 0,
  nextTask: '',
  description: '',
  majorId: (defaultMajors[0] && defaultMajors[0].id) || '',
});

const resolveMajorName = (majorId) => {
  const major = (defaultMajors || []).find((item) => item.id === majorId);
  return major ? major.name : '请选择';
};

Page({
  data: {
    courses: toCourseProgress(seedCourseTemplates),
    form: createEmptyForm(),
    majors: defaultMajors,
    workshops: boutiqueWorkshops,
    errorMessage: '',
    successMessage: '',
    selectedMajorName: resolveMajorName(createEmptyForm().majorId),
  },

  onShow() {
    const savedCourses = loadFromStorage(
      COURSE_STORAGE_KEY,
      toCourseProgress(seedCourseTemplates)
    );
    const currentForm = this.data.form || createEmptyForm();
    this.setData({
      courses: savedCourses,
      selectedMajorName: resolveMajorName(currentForm.majorId),
    });
  },

  handleInput(event) {
    const dataset = (event && event.currentTarget && event.currentTarget.dataset) || {};
    const field = dataset.field;
    if (!field) {
      return;
    }

    const value = event && event.detail ? event.detail.value : '';
    const nextForm = Object.assign({}, this.data.form);
    nextForm[field] = field === 'progress' ? Number(value) : value;
    this.setData({
      form: nextForm,
      errorMessage: '',
      successMessage: '',
    });
  },

  handleMajorChange(event) {
    const value = event && event.detail ? event.detail.value : 0;
    const index = Number(value || 0);
    const nextMajor = (this.data.majors && this.data.majors[index] && this.data.majors[index].id) || '';
    this.setData({
      form: Object.assign({}, this.data.form, { majorId: nextMajor }),
      selectedMajorName: resolveMajorName(nextMajor),
      errorMessage: '',
      successMessage: '',
    });
  },

  submitCourse() {
    const form = this.data.form || createEmptyForm();
    if (!form.title || !String(form.title).trim()) {
      this.setData({ errorMessage: '请输入课程名称' });
      return;
    }

    if (!form.majorId) {
      this.setData({ errorMessage: '请选择所属专业' });
      return;
    }

    const normalizedProgress = Math.min(100, Math.max(0, Number(form.progress) || 0));

    const newCourse = {
      id: `course_${Date.now()}`,
      title: String(form.title).trim(),
      category: form.category ? String(form.category).trim() : '公共课',
      teacher: form.teacher ? String(form.teacher).trim() : '待定讲师',
      progress: normalizedProgress,
      nextTask: form.nextTask ? String(form.nextTask).trim() : '请为课程设置复习任务',
    };

    const updatedCourses = [newCourse].concat(this.data.courses || []);
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
