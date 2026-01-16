/**
 * 입력 로거 타입 정의
 */
import type { InputLog } from '../../types/highlight';

export interface UseInputLoggerOptions {
  /** 비디오 엘리먼트 (media_time 산출용) */
  videoElement:
    | HTMLVideoElement
    | React.RefObject<HTMLVideoElement | null>
    | null;
  /** 세션 ID */
  sessionId: string;
  /** 활성화 여부 (기본값: true) */
  enabled?: boolean;
  /** 로그 배치 콜백 (디버깅/전송용) */
  onLogBatch?: (logs: InputLog[]) => void;
  /** 배치 크기 (기본값: 100) */
  batchSize?: number;
  /**
   * DOM 이벤트 리스너 직접 사용 여부 (기본값: false)
   * true면 SDK 필터 대신 document에 직접 이벤트 리스너를 등록
   * Mock 스트림 환경에서 테스트할 때 유용
   */
  useDomListeners?: boolean;
  /** media_time 기준 활성 세그먼트 ID resolver (오버랩 지원) */
  resolveSegmentIds?: (mediaTimeMs: number) => string[];
}

export interface UseInputLoggerReturn {
  /** 로그 복사본 반환 (안전한 접근) */
  getLogs: () => InputLog[];
  /** 디버깅용 로그 개수 */
  logCount: number;
  /** 로그 초기화 */
  clearLogs: () => void;
  /** 세그먼트별 로그 초기화 */
  clearLogsBySegment: (segmentId: string) => void;
  /** 세그먼트별 로그 조회 */
  getLogsBySegment: (segmentId: string) => InputLog[];
  /** 로그가 있는 세그먼트 ID 목록 */
  getSegmentIdsWithLogs: () => string[];
  /** 세그먼트별 로그 가져오고 비우기 */
  drainLogsBySegment: (segmentId: string) => InputLog[];
  /** 현재 세그먼트 ID */
  currentSegmentId: string;
  /** StreamClient inputFilters용 키보드 필터 */
  createKeyboardFilter: () => (event: KeyboardEvent) => boolean;
  /** StreamClient inputFilters용 마우스 필터 */
  createMouseFilter: () => (event: MouseEvent) => boolean;
  /** StreamClient inputFilters용 게임패드 필터 */
  createGamepadFilter: () => (gamepad: Gamepad) => boolean;
}

/** 마우스 이동 상태 */
export interface MouseMoveState {
  time: number;
  x: number;
  y: number;
}

/** 게임패드 상태 */
export interface GamepadState {
  buttons: boolean[];
  axes: number[];
}
