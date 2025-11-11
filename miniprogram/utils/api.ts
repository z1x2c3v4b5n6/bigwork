import { getApiConfig } from '../config';

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
    wx.request({
      url,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...header,
      },
      timeout: timeout ?? defaultTimeout,
      withCredentials: true,
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
        reject(error);
      },
      fail: (networkError) => {
        const error: ApiError = new Error(networkError.errMsg || '网络请求失败');
        reject(error);
      },
    });
  });
};
