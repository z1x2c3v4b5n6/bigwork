import { getApiConfig } from './config';
import { getStoredSession, type SessionUser } from './utils/session';
import { initializeDailyTask } from './utils/checkin';

type GlobalData = {
  sessionUser: SessionUser | null;
};

const globalData: GlobalData = {
  sessionUser: getStoredSession(),
};

const redirectToLoginPage = () => {
  wx.nextTick(() => {
    wx.switchTab({
      url: '/pages/profile/index',
      fail(error) {
        console.warn('初始化跳转至登录页失败', error);
      },
    });
  });
};

const showDailyTaskModal = async () => {
  try {
    const status = await initializeDailyTask();
    const { task, streak, completedToday } = status;
    const content = `今日任务：${task.targetText}\n${task.description}\n当前连续打卡 ${streak} 天`;
    wx.showModal({
      title: '今日学习任务',
      content,
      confirmText: completedToday ? '查看打卡' : '去完成',
      cancelText: '稍后',
      success(result) {
        if (result.confirm) {
          wx.navigateTo({ url: '/pages/checkin/index' }).catch((error) => {
            console.warn('跳转打卡页失败', error);
          });
        }
      },
    });
  } catch (error) {
    console.warn('展示打卡任务失败', error);
  }
};

App({
  globalData,

  onLaunch() {
    const apiConfig = getApiConfig();
    const session = globalData.sessionUser;
    console.log('复试资料小程序已启动，当前 API 基地址：', apiConfig.baseUrl);
    if (session) {
      console.log('检测到已登录用户：', session.name, `(${session.role})`);
      void showDailyTaskModal();
      return;
    }
    console.log('未检测到登录用户，跳转至登录页。');
    redirectToLoginPage();
    void showDailyTaskModal();
  },

  setSessionUser(this: any, user: SessionUser | null) {
    this.globalData.sessionUser = user;
    globalData.sessionUser = user;
  },
});
