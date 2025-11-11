import { getApiConfig } from './config';
import { getStoredSession, type SessionUser } from './utils/session';

type GlobalData = {
  sessionUser: SessionUser | null;
};

App<GlobalData>({
  globalData: {
    sessionUser: getStoredSession(),
  },

  onLaunch() {
    const apiConfig = getApiConfig();
    const session = this.globalData.sessionUser;
    console.log('复试资料小程序已启动，当前 API 基地址：', apiConfig.baseUrl);
    if (session) {
      console.log('检测到已登录用户：', session.name, `(${session.role})`);
    }
  },

  setSessionUser(user: SessionUser | null) {
    this.globalData.sessionUser = user;
  },
});
