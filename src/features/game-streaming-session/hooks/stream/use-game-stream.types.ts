import type { InputLog, SegmentMeta } from '../../types';
import type {
  UseStreamHealthOptions,
  UseStreamHealthReturn,
} from './useStreamHealth';

/** 입력 로깅 옵션 */
export interface InputLoggingOptions {
  /** 입력 로깅 활성화 여부 (기본값: true) */
  enabled?: boolean;
  /** 로그 배치 업로드 크기 (기본값: 50) */
  batchSize?: number;
  /** 로그 배치 콜백 (디버깅용) */
  onLogBatch?: (logs: InputLog[]) => void;
}

export interface SegmentRecordingOptions {
  enabled?: boolean;
  maxStorageBytes?: number;
  timesliceMs?: number;
  onSegmentStored?: (meta: SegmentMeta) => void;
  onError?: (error: Error) => void;
}

/** useGameStream 옵션 */
export interface UseGameStreamOptions {
  /** Survey UUID (필수) */
  surveyUuid: string;
  /** 연결 성공 시 콜백 */
  onConnected?: (sessionUuid: string) => void;
  /** 연결 해제 시 콜백 */
  onDisconnected?: () => void;
  /** 에러 발생 시 콜백 */
  onError?: (error: Error) => void;
  /** 입력 로깅 옵션 (Phase 1) */
  inputLogging?: InputLoggingOptions;
  /** 스트림 상태 모니터링 옵션 (Phase 2) */
  streamHealth?: Omit<
    UseStreamHealthOptions,
    'getVideoRTCStats' | 'getInputRTCStats'
  >;
  /** 세그먼트 녹화/저장 옵션 (Phase 3) */
  segmentRecording?: SegmentRecordingOptions;
}

/** useGameStream 반환 타입 */
export interface UseGameStreamReturn {
  /** Video element ref (이 ref를 video 태그에 연결) */
  videoRef: React.RefObject<HTMLVideoElement | null>;
  /** Audio element ref (이 ref를 audio 태그에 연결) */
  audioRef: React.RefObject<HTMLAudioElement | null>;
  /** 연결 중 상태 */
  isConnecting: boolean;
  /** 연결됨 상태 */
  isConnected: boolean;
  /** 게임 준비 완료 상태 (로딩 화면 종료 후) */
  isGameReady: boolean;
  /** 게임 준비 상태 설정 (로딩 화면 종료 시 호출) */
  setGameReady: (ready: boolean) => void;
  /** 현재 세션 UUID */
  sessionUuid: string | null;
  /** 스트리밍 연결 시작 */
  connect: () => Promise<void>;
  /** 스트리밍 연결 해제 */
  disconnect: () => void;

  /** 입력 로그 수동 업로드 */
  uploadInputLogs: () => Promise<void>;
  /** 스트림 상태 모니터링 정보 */
  streamHealth: UseStreamHealthReturn;
}
