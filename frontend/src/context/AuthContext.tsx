import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import httpClient from '../services/httpClient';

export type UserRole = 'student' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone?: string;
  avatar: string;
  organization: string;
  goal?: string;
  majorId?: string | null;
  majorName?: string;
  bio?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (credentials: { username: string; password: string }) => Promise<AuthUser>;
  logout: () => void;
  refreshUser: (nextUser: AuthUser) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const storage = typeof window !== 'undefined' ? window.localStorage : null;
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (!storage) return null;
    const raw = storage.getItem('kaoyan-auth');
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as AuthUser;
      return parsed ?? null;
    } catch (error) {
      console.warn('Failed to parse persisted auth user', error);
      return null;
    }
  });

  const persistUser = (nextUser: AuthUser | null) => {
    setUser(nextUser);
    if (nextUser) {
      storage?.setItem('kaoyan-auth', JSON.stringify(nextUser));
    } else {
      storage?.removeItem('kaoyan-auth');
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      login: async ({ username, password }) => {
        try {
          const response = await httpClient.post<AuthUser>('/api/auth/login', { username, password });
          const loggedInUser = response.data;
          persistUser(loggedInUser);
          return loggedInUser;
        } catch (error) {
          throw new Error('账号或密码不正确');
        }
      },
      logout: () => {
        persistUser(null);
      },
      refreshUser: (nextUser) => {
        persistUser(nextUser);
      },
    }),
    [storage, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth 必须在 AuthProvider 中使用');
  }
  return context;
};
