const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8050';

function getAuthToken(): string | null {
  const stored = localStorage.getItem('auth_token');
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored);
    return parsed.accessToken ?? null;
  } catch {
    return null;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) ?? {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
