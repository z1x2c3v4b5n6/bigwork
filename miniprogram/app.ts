import { getApiConfig } from './config';
import { getStoredSession, type SessionUser } from './utils/session';

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

App({
  globalData,

  onLaunch() {
    const apiConfig = getApiConfig();
    const session = globalData.sessionUser;
    console.log('复试资料小程序已启动，当前 API 基地址：', apiConfig.baseUrl);
    if (session) {
      console.log('检测到已登录用户：', session.name, `(${session.role})`);
      return;
    }
    console.log('未检测到登录用户，跳转至登录页。');
    redirectToLoginPage();
  },

  setSessionUser(this: any, user: SessionUser | null) {
    this.globalData.sessionUser = user;
    globalData.sessionUser = user;
  },
});
