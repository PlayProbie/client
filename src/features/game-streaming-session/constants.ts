/**
 * Game Streaming Session Feature 상수
 * Phase 4-5: 서비스 오픈 & Tester 스트리밍 API
 */
export { API_BASE_URL } from '@/constants/api';

/** Heartbeat 폴링 간격 (ms) */
export const HEARTBEAT_INTERVAL = 30000; // 30초

/** 세션 종료 사유 */
export type TerminateReason = 'USER_EXIT' | 'TIMEOUT' | 'ERROR';

/** 에러 메시지 */
export const ERROR_MESSAGES: Record<string, string> = {
  S001: '설문을 찾을 수 없습니다.',
  T001: '잘못된 Signal Request입니다.',
  T002: '리소스 미할당 또는 세션 불가',
  T003: 'GameLift 서비스 오류',
  T004: '현재 접속 가능한 세션이 꽉 찼습니다.',
};

// ----------------------------------------
// Input Logger Constants
// ----------------------------------------

/** 마우스 이동 샘플링 간격 (ms) - 15Hz */
export const MOUSE_MOVE_SAMPLE_INTERVAL = 66;

/** 마우스 이동 임계값 (px) */
export const MOUSE_MOVE_THRESHOLD = 5;

/** 휠 샘플링 간격 (ms) - 30Hz */
export const WHEEL_SAMPLE_INTERVAL = 33;

/** 게임패드 축 변화량 임계값 */
export const GAMEPAD_AXIS_THRESHOLD = 0.1;

/** 기본 배치 크기 */
export const DEFAULT_BATCH_SIZE = 100;
