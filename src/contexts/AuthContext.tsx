import { useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User, AuthToken, LoginRequest, RegisterRequest } from '../types';
import * as authApi from '../api/auth';
import { supabase } from '../lib/supabase';
import { AuthContext } from './AuthContextObject';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<AuthToken | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(authApi.mapUser(session.user));
        setToken(authApi.mapToken(session));
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          setUser(authApi.mapUser(session.user));
          setToken(authApi.mapToken(session));
        } else {
          setUser(null);
          setToken(null);
        }
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (req: LoginRequest) => {
    setLoading(true);
    try {
      await authApi.login(req);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (req: RegisterRequest) => {
    setLoading(true);
    try {
      await authApi.register(req);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
