import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

type UserRole = 'admin' | 'student';

interface AuthAccount {
  username: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface AuthUser {
  username: string;
  name: string;
  role: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (username: string, password: string) => AuthUser;
  logout: () => void;
}

const accounts: AuthAccount[] = [
  {
    username: 'admin',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
  },
  {
    username: 'student',
    password: 'student123',
    name: 'Student User',
    role: 'student',
  },
];

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = useCallback((username: string, password: string) => {
    const normalizedUsername = username.trim();
    const account = accounts.find(
      (candidate) => candidate.username === normalizedUsername && candidate.password === password,
    );

    if (!account) {
      throw new Error('Invalid username or password');
    }

    const authenticatedUser: AuthUser = {
      username: account.username,
      name: account.name,
      role: account.role,
    };

    setUser(authenticatedUser);
    return authenticatedUser;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
    }),
    [user, login, logout],
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
