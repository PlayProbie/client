/**
 * Game Streaming Session Feature 상수
 * Phase 4-5: 서비스 오픈 & Tester 스트리밍 API
 */
export { API_BASE_URL } from '@/constants/api';

/** Heartbeat 폴링 간격 (ms) */
export const HEARTBEAT_INTERVAL = 60000; // 1분

/** 세션 종료 사유 */
export type TerminateReason = 'user_exit' | 'timeout' | 'error';

/** 에러 메시지 */
export const ERROR_MESSAGES: Record<string, string> = {
  S001: '설문을 찾을 수 없습니다.',
  T001: '잘못된 Signal Request입니다.',
  T002: '리소스 미할당 또는 세션 불가',
  T003: 'GameLift 서비스 오류',
  T004: '현재 접속 가능한 세션이 꽉 찼습니다.',
};
