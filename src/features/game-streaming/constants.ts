/**
 * Game Streaming Feature 상수
 */

/** API Base URL */
export const API_BASE_URL = '/api';

/** Query/Mutation 기본 설정 */
export const QUERY_CONFIG = {
  /** 기본 staleTime (5분) */
  STALE_TIME_DEFAULT: 1000 * 60 * 5,
  /** 짧은 staleTime (2분) */
  STALE_TIME_SHORT: 1000 * 60 * 2,
} as const;

/** localStorage Key Prefix */
export const STORAGE_KEYS = {
  STREAM_SETTINGS: 'game-streaming:stream-settings:',
  SCHEDULE: 'game-streaming:schedule:',
} as const;

/** 업로드 에러 메시지 매핑 */
export const BUILD_ERROR_MESSAGES: Record<string, string> = {
  G002: '빌드 세션을 찾을 수 없습니다',
  G003: '업로드된 파일을 찾을 수 없습니다',
  G004: 'S3 확인 중 오류가 발생했습니다',
} as const;
