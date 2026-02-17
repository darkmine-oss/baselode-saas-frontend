import type { UserProfile, ApiResponse } from '../types';

const MOCK_PROFILE: UserProfile = {
  id: '1',
  email: 'user@example.com',
  name: 'Demo User',
  role: 'admin',
  createdAt: new Date().toISOString(),
  avatarUrl: undefined,
  bio: '',
};

function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getProfile(): Promise<ApiResponse<UserProfile>> {
  await delay();
  return { data: MOCK_PROFILE, success: true };
}

export async function updateProfile(
  updates: Partial<Pick<UserProfile, 'name' | 'bio' | 'avatarUrl'>>,
): Promise<ApiResponse<UserProfile>> {
  await delay();
  return {
    data: { ...MOCK_PROFILE, ...updates },
    success: true,
  };
}
