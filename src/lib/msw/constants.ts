/**
 * MSW 핸들러용 URL 상수
 * DEV 환경에서는 /api 경로 사용 (Vite proxy 우회)
 */
export const MSW_API_BASE_URL = import.meta.env.DEV
  ? '/api'
  : import.meta.env.VITE_API_BASE_URL || 'https://dev-api.playprobie.shop';

export const MSW_CLIENT_BASE_URL =
  import.meta.env.VITE_CLIENT_BASE_URL || 'http://localhost:5173';
