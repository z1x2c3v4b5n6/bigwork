import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type UserRole = 'student' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatar: string;
  organization: string;
  goal?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (credentials: { username: string; password: string }) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const ACCOUNT_BOOK: Record<string, { password: string; user: AuthUser }> = {
  student: {
    password: 'study2025',
    user: {
      id: 'u-student-001',
      name: '张同学',
      role: 'student',
      email: 'student@example.com',
      avatar: '张',
      organization: '北京理工大学 · 计算机专硕',
      goal: '冲刺 2025 统考 390+ 分',
    },
  },
  admin: {
    password: 'admin123',
    user: {
      id: 'u-admin-001',
      name: '李老师',
      role: 'admin',
      email: 'admin@example.com',
      avatar: '李',
      organization: '研学进阶教研组',
    },
  },
};

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

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      login: async ({ username, password }) => {
        const account = ACCOUNT_BOOK[username as keyof typeof ACCOUNT_BOOK];
        if (!account || account.password !== password) {
          throw new Error('账号或密码不正确');
        }
        setUser(account.user);
        storage?.setItem('kaoyan-auth', JSON.stringify(account.user));
        return account.user;
      },
      logout: () => {
        setUser(null);
        storage?.removeItem('kaoyan-auth');
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
