import { createContext } from 'react';
import type { User, AuthToken, LoginRequest, RegisterRequest, RegisterResponse } from '../types';

export interface AuthContextValue {
  user: User | null;
  token: AuthToken | null;
  loading: boolean;
  login: (req: LoginRequest) => Promise<void>;
  register: (req: RegisterRequest) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
