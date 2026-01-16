/**
 * Virtual Highlight 시스템 타입 정의
 *
 * Phase 0: 입력 로그/세그먼트/InsightTag 스키마 정의
 *
 * 명명 규칙:
 * - API 응답/요청 타입: snake_case (Api prefix)
 * - 클라이언트 상태 타입: camelCase
 */

// ============================================
// Input Log Types (입력 로그 스키마)
// ============================================

/** 입력 이벤트 타입 */
export type InputEventType =
  | 'KEY_DOWN'
  | 'KEY_UP'
  | 'MOUSE_DOWN'
  | 'MOUSE_UP'
  | 'MOUSE_MOVE'
  | 'WHEEL'
  | 'GAMEPAD_BUTTON'
  | 'GAMEPAD_AXIS'
  | 'BLUR'
  | 'FOCUS'
  | 'VISIBILITY_HIDDEN'
  | 'VISIBILITY_VISIBLE'
  | 'PAGE_HIDE';

/** 기본 입력 로그 (최소 필수 필드) */
export interface BaseInputLog {
  /** 입력 이벤트 타입 */
  type: InputEventType;
  /** 영상 기준 시간 (video.currentTime 또는 rVFC) - Core Key, 단위: ms (밀리초 정수) */
  media_time: number;
  /** 로컬 에포크 타임 (디버깅용), 단위: ms (밀리초 정수) */
  client_ts: number;
  /** 해당 이벤트가 포함된 세그먼트 ID */
  segment_id: string;
}

/** 키보드 입력 로그 */
export interface KeyboardInputLog extends BaseInputLog {
  type: 'KEY_DOWN' | 'KEY_UP';
  /** 키 코드 (e.g., 'KeyA', 'Space', 'Enter') */
  code: string;
  /** 키 이름 (e.g., 'a', ' ', 'Enter') */
  key: string;
}

/** 마우스 클릭 입력 로그 */
export interface MouseClickInputLog extends BaseInputLog {
  type: 'MOUSE_DOWN' | 'MOUSE_UP';
  /** 마우스 버튼 (0: left, 1: middle, 2: right) */
  button: number;
  /** X 좌표 */
  x: number;
  /** Y 좌표 */
  y: number;
}

/** 마우스 이동 입력 로그 (샘플링 적용) */
export interface MouseMoveInputLog extends BaseInputLog {
  type: 'MOUSE_MOVE';
  /** X 좌표 */
  x: number;
  /** Y 좌표 */
  y: number;
  /** 샘플링된 이벤트 여부 */
  sampled?: boolean;
}

/** 휠 입력 로그 (샘플링 적용) */
export interface WheelInputLog extends BaseInputLog {
  type: 'WHEEL';
  /** 수평 스크롤량 */
  deltaX: number;
  /** 수직 스크롤량 */
  deltaY: number;
  /** 샘플링된 이벤트 여부 */
  sampled?: boolean;
}

/** 게임패드 버튼 입력 로그 */
export interface GamepadButtonInputLog extends BaseInputLog {
  type: 'GAMEPAD_BUTTON';
  /** 게임패드 인덱스 */
  gamepadIndex: number;
  /** 버튼 인덱스 */
  buttonIndex: number;
  /** 눌림 여부 */
  pressed: boolean;
  /** 눌림 강도 (0.0 ~ 1.0) */
  value: number;
}

/** 게임패드 축 입력 로그 */
export interface GamepadAxisInputLog extends BaseInputLog {
  type: 'GAMEPAD_AXIS';
  /** 게임패드 인덱스 */
  gamepadIndex: number;
  /** 축 인덱스 */
  axisIndex: number;
  /** 축 값 (-1.0 ~ 1.0) */
  value: number;
}

/** Visibility/Focus 이벤트 로그 */
export interface VisibilityInputLog extends BaseInputLog {
  type:
    | 'BLUR'
    | 'FOCUS'
    | 'VISIBILITY_HIDDEN'
    | 'VISIBILITY_VISIBLE'
    | 'PAGE_HIDE';
}

/** 모든 입력 로그 타입 유니온 */
export type InputLog =
  | KeyboardInputLog
  | MouseClickInputLog
  | MouseMoveInputLog
  | WheelInputLog
  | GamepadButtonInputLog
  | GamepadAxisInputLog
  | VisibilityInputLog;

// ============================================
// Segment Types (세그먼트 메타 스키마)
// ============================================

/** 세그먼트 업로드 상태 */
export type SegmentUploadStatus =
  | 'LOCAL_ONLY'
  | 'UPLOADING'
  | 'UPLOADED'
  | 'FAILED';

/** 세그먼트 메타데이터 */
export interface SegmentMeta {
  /** 세그먼트 고유 ID */
  segment_id: string;
  /** 세션 ID */
  session_id: string;
  /** 코어 구간 시작 시간 (영상 내 절대 시간), 단위: ms (밀리초 정수) */
  start_media_time: number;
  /** 코어 구간 종료 시간 (영상 내 절대 시간), 단위: ms (밀리초 정수) */
  end_media_time: number;
  /** 업로드 상태 */
  upload_status: SegmentUploadStatus;
  /** 오버랩 시간 (양쪽 3000ms씩, 총 36000ms 녹화), 단위: ms (밀리초 정수) */
  overlap_ms: number;
  /** 세그먼트 파일 크기 (bytes) */
  file_size?: number;
  /** 생성 시간 */
  created_at: string;
  /** 업로드 완료 시간 */
  uploaded_at?: string;
}

/** [Client] 세그먼트 메타데이터 */
export interface ClientSegmentMeta {
  segmentId: string;
  sessionId: string;
  /** 단위: ms (밀리초 정수) */
  startMediaTime: number;
  /** 단위: ms (밀리초 정수) */
  endMediaTime: number;
  uploadStatus: SegmentUploadStatus;
  /** 단위: ms (밀리초 정수) */
  overlapMs: number;
  fileSize?: number;
  createdAt: string;
  uploadedAt?: string;
  /** 로컬 Blob URL (OPFS/IndexedDB에서 읽은 경우) */
  localBlobUrl?: string;
}

// ============================================
// InsightTag Types (분석 결과 스키마)
// ============================================

/** InsightTag 유형 */
export type InsightTagType = 'PANIC' | 'IDLE' | 'CHURN';

/** InsightTag 재생 상태 */
export type PlaybackStatus =
  | 'READY_LOCAL'
  | 'READY_CLOUD'
  | 'UPLOADING'
  | 'UNAVAILABLE';

/** 클립 정보 (세그먼트 매핑) */
export interface ClipInfo {
  /** 세그먼트 ID */
  segment_id: string;
  /** 파일 시작점으로부터의 오프셋 (시작), 단위: ms (밀리초 정수) */
  offset_start: number;
  /** 파일 시작점으로부터의 오프셋 (종료), 단위: ms (밀리초 정수) */
  offset_end: number;
  /** S3 업로드 완료 시 영상 URL */
  video_url?: string;
}

/** [API] InsightTag 응답 */
export interface ApiInsightTag {
  insight_tag_id: string;
  session_id: string;
  tag_type: InsightTagType;
  score: number;
  description: string;
  /** 분석된 발생 시간 (영상 기준) - 시작, 단위: ms (밀리초 정수) */
  media_time_start: number;
  /** 분석된 발생 시간 (영상 기준) - 종료, 단위: ms (밀리초 정수) */
  media_time_end: number;
  /** 재생을 위한 세그먼트 매핑 정보 */
  clips: ClipInfo[];
  /** 재생 가능 상태 */
  playback_status: PlaybackStatus;
  /** 생성 시간 */
  created_at: string;
}

/** [Client] InsightTag */
export interface InsightTag {
  insightTagId: string;
  sessionId: string;
  tagType: InsightTagType;
  score: number;
  description: string;
  /** 단위: ms (밀리초 정수) */
  mediaTimeStart: number;
  /** 단위: ms (밀리초 정수) */
  mediaTimeEnd: number;
  clips: {
    segmentId: string;
    /** 단위: ms (밀리초 정수) */
    offsetStart: number;
    /** 단위: ms (밀리초 정수) */
    offsetEnd: number;
    videoUrl?: string;
  }[];
  playbackStatus: PlaybackStatus;
  createdAt: string;
}

// ============================================
// Upload API Types
// ============================================

/** [API] Presigned URL 요청 */
export interface ApiPresignedUrlRequest {
  session_id: string;
  segment_id: string;
  content_type: string;
  file_size: number;
}

/** [API] Presigned URL 응답 */
export interface ApiPresignedUrlResponse {
  result: {
    upload_url: string;
    expires_in_seconds: number;
  };
}

/** [API] 세그먼트 업로드 완료 알림 요청 */
export interface ApiSegmentUploadCompleteRequest {
  session_id: string;
  segment_id: string;
  /** 단위: ms (밀리초 정수) */
  start_media_time: number;
  /** 단위: ms (밀리초 정수) */
  end_media_time: number;
  file_size: number;
}

/** [API] 세그먼트 업로드 완료 알림 응답 */
export interface ApiSegmentUploadCompleteResponse {
  result: {
    success: boolean;
    segment_id: string;
  };
}

/** [API] 입력 로그 업로드 요청 */
export interface ApiInputLogsUploadRequest {
  session_id: string;
  segment_id: string;
  logs: InputLog[];
}

/** [API] 입력 로그 업로드 응답 */
export interface ApiInputLogsUploadResponse {
  result: {
    success: boolean;
    logs_count: number;
  };
}

/** [API] InsightTag 조회 응답 */
export interface ApiInsightTagsResponse {
  result: {
    tags: ApiInsightTag[];
    total_count: number;
  };
}

// ============================================
// Transformers
// ============================================

/** SegmentMeta → ClientSegmentMeta 변환 */
export function toClientSegmentMeta(api: SegmentMeta): ClientSegmentMeta {
  return {
    segmentId: api.segment_id,
    sessionId: api.session_id,
    startMediaTime: api.start_media_time,
    endMediaTime: api.end_media_time,
    uploadStatus: api.upload_status,
    overlapMs: api.overlap_ms,
    fileSize: api.file_size,
    createdAt: api.created_at,
    uploadedAt: api.uploaded_at,
  };
}

/** ApiInsightTag → InsightTag 변환 */
export function toInsightTag(api: ApiInsightTag): InsightTag {
  return {
    insightTagId: api.insight_tag_id,
    sessionId: api.session_id,
    tagType: api.tag_type,
    score: api.score,
    description: api.description,
    mediaTimeStart: api.media_time_start,
    mediaTimeEnd: api.media_time_end,
    clips: api.clips.map((clip) => ({
      segmentId: clip.segment_id,
      offsetStart: clip.offset_start,
      offsetEnd: clip.offset_end,
      videoUrl: clip.video_url,
    })),
    playbackStatus: api.playback_status,
    createdAt: api.created_at,
  };
}

/** ApiPresignedUrlResponse → PresignedUrl (간소화) */
export function toPresignedUrl(api: ApiPresignedUrlResponse['result']): {
  uploadUrl: string;
  expiresInSeconds: number;
} {
  return {
    uploadUrl: api.upload_url,
    expiresInSeconds: api.expires_in_seconds,
  };
}
