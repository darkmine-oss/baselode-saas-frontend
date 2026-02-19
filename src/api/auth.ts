import type { LoginRequest, RegisterRequest, AuthResponse, RegisterResponse } from '../types';
import type { User } from '../types/user';
import type { AuthToken } from '../types/auth';
import { supabase } from '../lib/supabase';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

export function mapUser(su: SupabaseUser): User {
  return {
    id: su.id,
    email: su.email ?? '',
    name: (su.user_metadata?.name as string) ?? '',
    role: (su.user_metadata?.role as User['role']) ?? 'member',
    createdAt: su.created_at,
  };
}

export function mapToken(session: Session): AuthToken {
  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: (session.expires_at ?? 0) * 1000,
  };
}

export async function login(req: LoginRequest): Promise<AuthResponse> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: req.email,
    password: req.password,
  });

  if (error || !data.session) {
    throw new Error(error?.message ?? 'Login failed');
  }

  return {
    user: mapUser(data.user),
    token: mapToken(data.session),
  };
}

export async function register(req: RegisterRequest): Promise<RegisterResponse> {
  const { data, error } = await supabase.auth.signUp({
    email: req.email,
    password: req.password,
    options: {
      data: { name: req.name },
      emailRedirectTo: `${window.location.origin}/login`,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.session || !data.user) {
    return {
      user: data.user ? mapUser(data.user) : null,
      token: null,
      confirmEmail: true,
    };
  }

  return {
    user: mapUser(data.user),
    token: mapToken(data.session),
    confirmEmail: false,
  };
}

export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}
