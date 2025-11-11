const { getApiConfig } = require('./config.js');
const { getStoredSession } = require('./utils/session.js');

App({
  globalData: {
    sessionUser: getStoredSession(),
  },

  onLaunch() {
    const apiConfig = getApiConfig();
    const session = this.globalData.sessionUser;
    console.log('复试资料小程序已启动，当前 API 基地址：', apiConfig.baseUrl);
    if (session) {
      console.log('检测到已登录用户：', `${session.name} (${session.role})`);
    }
  },

  setSessionUser(user) {
    this.globalData.sessionUser = user;
  },
});
