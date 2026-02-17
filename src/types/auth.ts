import type { User } from './user';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface AuthResponse {
  user: User;
  token: AuthToken;
}

export interface RegisterResponse {
  user: User | null;
  token: AuthToken | null;
  confirmEmail: boolean;
}
