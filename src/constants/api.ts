/**
 * API 관련 상수 정의
 *
 * 항상 VITE_API_BASE_URL 환경변수를 직접 사용
 * (.env.local에서 설정)
 */
// export const API_BASE_URL =
//   import.meta.env.VITE_API_BASE_URL || 'https://dev-api.playprobie.shop';
export const API_BASE_URL = import.meta.env.DEV
  ? '/api'
  : import.meta.env.VITE_API_BASE_URL || 'https://dev-api.playprobie.shop';

export const CLIENT_BASE_URL =
  import.meta.env.VITE_CLIENT_BASE_URL || 'http://localhost:5173';
