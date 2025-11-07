export interface UserProfile {
  id: string;
  role: 'student' | 'admin';
  name: string;
  email: string;
  phone: string;
  organization: string;
  goal: string;
  majorId: string;
  bio: string;
  avatar?: string;
}

export const profileSeed: UserProfile = {
  id: 'user_demo',
  role: 'student',
  name: '张同学',
  email: 'zhang@example.com',
  phone: '138****1234',
  organization: '华中科技大学',
  goal: '冲刺 985 计算机专硕, 坚持晨读打卡',
  majorId: 'cs408',
  bio: '本科计算机科学与技术，擅长算法与数据结构，目标进入互联网大厂。',
  avatar: '',
};
