import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { resolveAssetUrl } from '../utils/url';

export type UserRole = 'student' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  email?: string | null;
  phone?: string | null;
  organization?: string | null;
  goal?: string | null;
  majorId?: string | null;
  majorName?: string | null;
  avatar?: string | null;
  bio?: string | null;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  password: string;
  displayName: string;
  email?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (credentials: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  refreshUser: (user: AuthUser | null) => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/?$/, '') ?? '';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const parseResponseBody = async (response: Response): Promise<Record<string, unknown>> => {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch (error) {
    console.warn('响应体不是 JSON，返回原始文本', error);
    return { message: text };
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const normalizeUser = useCallback((raw: AuthUser | null | undefined): AuthUser | null => {
    if (!raw) {
      return null;
    }

    return {
      ...raw,
      avatar: resolveAssetUrl(raw.avatar) ?? undefined,
    };
  }, []);

  const fetchSession = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/session`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await parseResponseBody(response);
        const nextUser = (data as { user?: AuthUser }).user ?? null;
        setUser(normalizeUser(nextUser));
      } else if (response.status === 401) {
        setUser(null);
      } else {
        const data = await parseResponseBody(response);
        const message = (data as { message?: string }).message ?? response.statusText;
        console.error('无法获取登录状态', message);
        setUser(null);
      }
    } catch (error) {
      console.error('获取登录状态时出现异常', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, normalizeUser]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const login = useCallback(async (credentials: LoginPayload) => {
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const data = await parseResponseBody(response);
        const message = (data as { message?: string }).message ?? '登录失败，请检查账号或密码';
        throw new Error(message);
      }

      const data = await parseResponseBody(response);
      const nextUser = (data as { user?: AuthUser }).user ?? null;
      setUser(normalizeUser(nextUser));
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, normalizeUser]);

  const register = useCallback(async (payload: RegisterPayload) => {
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await parseResponseBody(response);
        const message = (data as { message?: string }).message ?? '注册失败，请稍后重试';
        throw new Error(message);
      }

      const data = await parseResponseBody(response);
      const nextUser = (data as { user?: AuthUser }).user ?? null;
      setUser(normalizeUser(nextUser));
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, normalizeUser]);

  const logout = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await parseResponseBody(response);
        const message = (data as { message?: string }).message ?? '退出登录失败';
        throw new Error(message);
      }
    } finally {
      setUser(null);
      setLoading(false);
    }
  }, [API_BASE_URL]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchSession();
  }, [fetchSession]);

  const refreshUser = useCallback(
    (nextUser: AuthUser | null) => {
      setUser(normalizeUser(nextUser));
    },
    [normalizeUser],
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      refresh,
      refreshUser,
    }),
    [user, loading, login, register, logout, refresh, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
