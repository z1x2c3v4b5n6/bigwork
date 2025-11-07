import { defaultMajors } from '../../data/courses';
import { profileSeed, type UserProfile } from '../../data/profile';
import { loadFromStorage, saveToStorage } from '../../utils/storage';

const PROFILE_STORAGE_KEY = 'userProfile';

Page({
  data: {
    profile: profileSeed as UserProfile,
    majors: defaultMajors,
    successMessage: '',
    errorMessage: '',
    selectedMajorName: defaultMajors.find((item) => item.id === profileSeed.majorId)?.name ?? '请选择',
  },

  onShow() {
    const storedProfile = loadFromStorage<UserProfile>(PROFILE_STORAGE_KEY, profileSeed);
    this.setData({
      profile: storedProfile,
      selectedMajorName: defaultMajors.find((item) => item.id === storedProfile.majorId)?.name ?? '请选择',
    });
  },

  handleInput(event: WechatMiniprogram.Input) {
    const field = event.currentTarget?.dataset?.field;
    if (!field) {
      return;
    }
    const value = event.detail.value ?? '';
    const nextProfile = { ...this.data.profile, [field]: value } as UserProfile;
    this.setData({
      profile: nextProfile,
      selectedMajorName: defaultMajors.find((item) => item.id === nextProfile.majorId)?.name ?? '请选择',
      successMessage: '',
      errorMessage: '',
    });
  },

  handleMajorChange(event: WechatMiniprogram.PickerChange) {
    const index = Number(event.detail.value ?? 0);
    const majorId = this.data.majors[index]?.id ?? '';
    this.setData({
      profile: { ...this.data.profile, majorId },
      selectedMajorName: defaultMajors.find((item) => item.id === majorId)?.name ?? '请选择',
      successMessage: '',
      errorMessage: '',
    });
  },

  toggleRole() {
    const nextRole = this.data.profile.role === 'admin' ? 'student' : 'admin';
    this.setData({
      profile: { ...this.data.profile, role: nextRole },
      successMessage: '',
      errorMessage: '',
    });
  },

  saveProfile() {
    const profile = this.data.profile;
    if (!profile.name || !profile.name.trim()) {
      this.setData({ errorMessage: '请填写姓名' });
      return;
    }

    saveToStorage(PROFILE_STORAGE_KEY, profile);
    this.setData({ successMessage: '资料已更新。', errorMessage: '' });
  },
});
