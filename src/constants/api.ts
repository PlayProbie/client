/**
 * API 관련 상수 정의
 *
 * - 개발 환경: 항상 /api (Vite Proxy) 사용하여 CORS 우회
 * - 프로덕션: VITE_API_BASE_URL로 직접 서버에 요청
 */
export const API_BASE_URL = import.meta.env.DEV
  ? '/api'
  : import.meta.env.VITE_API_BASE_URL || 'https://dev-api.playprobie.shop';

export const CLIENT_BASE_URL =
  import.meta.env.VITE_CLIENT_BASE_URL || 'http://localhost:5173';
