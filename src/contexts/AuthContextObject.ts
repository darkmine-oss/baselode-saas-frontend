import { createContext } from 'react';
import type { User, AuthToken, LoginRequest, RegisterRequest } from '../types';

export interface AuthContextValue {
  user: User | null;
  token: AuthToken | null;
  loading: boolean;
  login: (req: LoginRequest) => Promise<void>;
  register: (req: RegisterRequest) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
