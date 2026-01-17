import { API_BASE_URL } from '@/constants/api';

import type { LogoutResponse } from '../types';

/**
 * POST /auth/logout - 로그아웃
 * 서버에 로그아웃 요청 후 localStorage 정리
 */
export async function postLogout(): Promise<LogoutResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // 서버 응답과 관계없이 클라이언트 측 정리 수행
  // (서버가 다운되어도 로그아웃은 진행되어야 함)
  localStorage.removeItem('accessToken');
  localStorage.removeItem('auth-storage');

  if (!response.ok) {
    // 클라이언트 측 정리는 완료했으므로 에러를 throw하지 않음
    return { result: { message: 'Logged out (client-side)' } };
  }

  return response.json();
}
