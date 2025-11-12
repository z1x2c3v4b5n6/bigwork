import { getApiConfig } from '../config';
import { clearStoredToken, getStoredToken } from './authToken';

export interface ApiRequestOptions<TData = any> {
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data?: TData;
  header?: Record<string, unknown>;
  timeout?: number;
}

export interface ApiError extends Error {
  statusCode?: number;
  data?: unknown;
}

const joinUrl = (baseUrl: string, path: string): string => {
  const trimmedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const trimmedPath = path.startsWith('/') ? path.slice(1) : path;
  return `${trimmedBase}/${trimmedPath}`;
};

const ALLOWED_DEV_HOSTS = new Set(['127.0.0.1', 'localhost']);
let domainWarningShown = false;

const parseUrlParts = (value: string): { protocol: string; hostname: string } | null => {
  const match = /^([a-zA-Z][a-zA-Z0-9+.-]*):\/\/([^\/]*)/.exec(value);
  if (!match) {
    return null;
  }

  const protocol = match[1]?.toLowerCase();
  const host = match[2] ?? '';
  const hostname = host.split(':')[0]?.toLowerCase();

  if (!protocol || !hostname) {
    return null;
  }

  return { protocol, hostname };
};

const isDevtoolsEnvironment = (): boolean => {
  try {
    const info = wx.getSystemInfoSync();
    return info.platform === 'devtools';
  } catch (error) {
    console.warn('[api] 无法获取系统信息判断运行环境', error);
    return false;
  }
};

const notifyIllegalDomain = (message: string) => {
  if (domainWarningShown) {
    return;
  }

  domainWarningShown = true;
  console.warn('[api] 域名校验未通过:', message);

  try {
    void wx.showModal({
      title: '请求域名未校验',
      content: `${message}\n请按照文档配置合法域名或在开发工具中完成校验：https://developers.weixin.qq.com/miniprogram/dev/framework/ability/network.html`,
      showCancel: false,
      confirmText: '我知道了',
    });
  } catch (modalError) {
    console.warn('[api] 显示域名提醒失败', modalError);
  }
};

const validateRequestDomain = (url: string): { ok: boolean; message?: string } => {
  const parts = parseUrlParts(url);

  if (!parts) {
    return { ok: true };
  }

  if (parts.protocol === 'https') {
    return { ok: true };
  }

  if (ALLOWED_DEV_HOSTS.has(parts.hostname) && isDevtoolsEnvironment()) {
    return { ok: true };
  }

  return {
    ok: false,
    message: '请求地址未在微信公众平台配置为合法域名，已切换为示例数据，请参照文档完成校验后再试。',
  };
};

export const apiRequest = <TResponse = any, TData = any>({
  path,
  method = 'GET',
  data,
  header,
  timeout,
}: ApiRequestOptions<TData>): Promise<TResponse> => {
  const { baseUrl, timeout: defaultTimeout } = getApiConfig();
  const url = joinUrl(baseUrl, path);

  const domainValidation = validateRequestDomain(url);
  if (!domainValidation.ok) {
    const message = domainValidation.message || '请求域名未通过校验。';
    notifyIllegalDomain(message);
    const error: ApiError = new Error(message);
    error.statusCode = 0;
    return Promise.reject(error);
  }

  return new Promise<TResponse>((resolve, reject) => {
    const storedToken = getStoredToken();
    const requestHeader: Record<string, unknown> = {
      'Content-Type': 'application/json',
      ...header,
    };

    if (storedToken && !requestHeader.Authorization && !requestHeader.authorization) {
      requestHeader.Authorization = `Bearer ${storedToken}`;
    }

    wx.request({
      url,
      method,
      data,
      header: requestHeader,
      timeout: timeout ?? defaultTimeout,
      withCredentials: false,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data as TResponse);
          return;
        }
        const responseData = (res.data ?? {}) as Record<string, unknown>;
        const message =
          typeof responseData.message === 'string' && responseData.message
            ? responseData.message
            : '请求失败，请稍后重试。';
        const error: ApiError = new Error(message);
        error.statusCode = res.statusCode;
        error.data = res.data;
        if (res.statusCode === 401) {
          clearStoredToken();
        }
        reject(error);
      },
      fail: (networkError) => {
        const error: ApiError = new Error(networkError.errMsg || '网络请求失败');
        reject(error);
      },
    });
  });
};
