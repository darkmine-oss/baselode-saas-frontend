import type { LoginRequest, RegisterRequest, AuthResponse } from '../types';

const MOCK_USER = {
  id: '1',
  email: 'user@example.com',
  name: 'Demo User',
  role: 'admin' as const,
  createdAt: new Date().toISOString(),
};

const MOCK_TOKEN = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  expiresAt: Date.now() + 3600_000,
};

function delay(ms = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function login(req: LoginRequest): Promise<AuthResponse> {
  await delay();
  // Mock: accept any credentials
  return {
    user: { ...MOCK_USER, email: req.email },
    token: MOCK_TOKEN,
  };
}

export async function register(req: RegisterRequest): Promise<AuthResponse> {
  await delay();
  return {
    user: { ...MOCK_USER, email: req.email, name: req.name },
    token: MOCK_TOKEN,
  };
}

export async function logout(): Promise<void> {
  await delay(200);
}

export async function refreshToken(token: string): Promise<AuthResponse> {
  await delay(200);
  void token;
  return {
    user: MOCK_USER,
    token: { ...MOCK_TOKEN, expiresAt: Date.now() + 3600_000 },
  };
}
