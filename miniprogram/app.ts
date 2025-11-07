import { getApiConfig } from './config';

App({
  onLaunch() {
    const apiConfig = getApiConfig();
    console.log('复试资料小程序已启动，当前 API 基地址：', apiConfig.baseUrl);
  },
});
