import type { InputLog } from './input-logs';
import type { ApiInsightTag } from './insight-tags';

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
