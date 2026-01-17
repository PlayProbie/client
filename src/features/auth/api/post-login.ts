import { API_BASE_URL } from '@/constants/api';

import type { LoginRequest, LoginResponse } from '../types';

/**
 * POST /auth/login - 로그인
 */
export async function postLogin(data: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || '로그인에 실패했습니다');
  }

  return response.json();
}
