import { getApiConfig } from '../config';
import { clearStoredCookies, getStoredCookieHeader, storeResponseCookies } from './authCookies';

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

export const apiRequest = <TResponse = any, TData = any>({
  path,
  method = 'GET',
  data,
  header,
  timeout,
}: ApiRequestOptions<TData>): Promise<TResponse> => {
  const { baseUrl, timeout: defaultTimeout } = getApiConfig();
  const url = joinUrl(baseUrl, path);

  return new Promise<TResponse>((resolve, reject) => {
    const storedCookie = getStoredCookieHeader();
    const requestHeader: Record<string, unknown> = {
      'Content-Type': 'application/json',
      ...header,
    };

    if (storedCookie && !requestHeader.Cookie && !requestHeader.cookie) {
      requestHeader.Cookie = storedCookie;
    }

    wx.request({
      url,
      method,
      data,
      header: requestHeader,
      timeout: timeout ?? defaultTimeout,
      withCredentials: true,
      success: (res) => {
        storeResponseCookies(res);

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
          clearStoredCookies();
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
