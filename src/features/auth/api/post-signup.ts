import { API_BASE_URL } from '@/constants/api';

import type { SignupRequest, SignupResponse } from '../types';

/**
 * POST /auth/signup - 회원가입
 */
export async function postSignup(data: SignupRequest): Promise<SignupResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: data.email,
      password: data.password,
      name: data.name,
      phone: data.phone || undefined,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || '회원가입에 실패했습니다');
  }

  return response.json();
}
