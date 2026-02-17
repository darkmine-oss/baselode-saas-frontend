import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User, AuthToken, LoginRequest, RegisterRequest } from '../types';
import * as authApi from '../api/auth';

export interface AuthContextValue {
  user: User | null;
  token: AuthToken | null;
  loading: boolean;
  login: (req: LoginRequest) => Promise<void>;
  register: (req: RegisterRequest) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_USER_KEY = 'auth_user';
const STORAGE_TOKEN_KEY = 'auth_token';

function loadFromStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() =>
    loadFromStorage<User>(STORAGE_USER_KEY),
  );
  const [token, setToken] = useState<AuthToken | null>(() =>
    loadFromStorage<AuthToken>(STORAGE_TOKEN_KEY),
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_USER_KEY);
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem(STORAGE_TOKEN_KEY, JSON.stringify(token));
    } else {
      localStorage.removeItem(STORAGE_TOKEN_KEY);
    }
  }, [token]);

  const login = useCallback(async (req: LoginRequest) => {
    setLoading(true);
    try {
      const res = await authApi.login(req);
      setUser(res.user);
      setToken(res.token);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (req: RegisterRequest) => {
    setLoading(true);
    try {
      const res = await authApi.register(req);
      setUser(res.user);
      setToken(res.token);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
