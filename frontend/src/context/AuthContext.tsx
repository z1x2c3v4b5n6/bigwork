import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

export type UserRole = 'student' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
  updateRole: (role: UserRole) => void;
}

const defaultUser: AuthUser = {
  id: 'u-001',
  name: '张同学',
  role: 'student',
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(defaultUser);

  const login = (nextUser: AuthUser) => {
    setUser(nextUser);
  };

  const logout = () => {
    setUser(null);
  };

  const updateRole = (role: UserRole) => {
    setUser((prev) => (prev ? { ...prev, role } : prev));
  };

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      updateRole,
    }),
    [user],
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
