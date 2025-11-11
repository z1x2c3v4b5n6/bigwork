const { defaultMajors } = require('../../data/courses.js');
const { profileSeed } = require('../../data/profile.js');
const { loadFromStorage, saveToStorage } = require('../../utils/storage.js');

const PROFILE_STORAGE_KEY = 'userProfile';

const resolveMajorName = (majors, majorId) => {
  const found = (majors || []).find((item) => item.id === majorId);
  return found ? found.name : '请选择';
};

Page({
  data: {
    profile: profileSeed,
    majors: defaultMajors,
    successMessage: '',
    errorMessage: '',
    selectedMajorName: resolveMajorName(defaultMajors, profileSeed.majorId),
  },

  onShow() {
    const storedProfile = loadFromStorage(PROFILE_STORAGE_KEY, profileSeed);
    this.setData({
      profile: storedProfile,
      selectedMajorName: resolveMajorName(defaultMajors, storedProfile.majorId),
    });
  },

  handleInput(event) {
    const dataset = (event && event.currentTarget && event.currentTarget.dataset) || {};
    const field = dataset.field;
    if (!field) {
      return;
    }
    const value = (event && event.detail && event.detail.value) || '';
    const nextProfile = Object.assign({}, this.data.profile, { [field]: value });
    this.setData({
      profile: nextProfile,
      selectedMajorName: resolveMajorName(defaultMajors, nextProfile.majorId),
      successMessage: '',
      errorMessage: '',
    });
  },

  handleMajorChange(event) {
    const value = (event && event.detail && event.detail.value) || 0;
    const index = Number(value);
    const major = this.data.majors[index] || { id: '' };
    const majorId = major.id || '';
    const nextProfile = Object.assign({}, this.data.profile, { majorId });
    this.setData({
      profile: nextProfile,
      selectedMajorName: resolveMajorName(defaultMajors, majorId),
      successMessage: '',
      errorMessage: '',
    });
  },

  toggleRole() {
    const currentRole = (this.data.profile && this.data.profile.role) || 'student';
    const nextRole = currentRole === 'admin' ? 'student' : 'admin';
    this.setData({
      profile: Object.assign({}, this.data.profile, { role: nextRole }),
      successMessage: '',
      errorMessage: '',
    });
  },

  saveProfile() {
    const profile = this.data.profile || {};
    if (!profile.name || !String(profile.name).trim()) {
      this.setData({ errorMessage: '请填写姓名' });
      return;
    }

    saveToStorage(PROFILE_STORAGE_KEY, profile);
    this.setData({ successMessage: '资料已更新。', errorMessage: '' });
  },
});
