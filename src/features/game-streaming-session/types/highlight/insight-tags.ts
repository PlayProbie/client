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
