import type { InputLog } from './input-logs';
import type { ApiInsightTag } from './insight-tags';

// ============================================
// Upload API Types
// ============================================

/** [API] Presigned URL 요청 */
export interface ApiPresignedUrlRequest {
  sequence: number;
  video_start_ms: number;
  video_end_ms: number;
  content_type: string;
}

/** [API] Presigned URL 응답 (201 Created) */
export interface ApiPresignedUrlResponse {
  result: {
    segment_id: string;
    s3_url: string;
    expires_in: number;
  };
}

/** [API] 세그먼트 업로드 완료 알림 요청 */
export interface ApiSegmentUploadCompleteRequest {
  segment_id: string;
}

/** [API] 세그먼트 업로드 완료 알림 응답 (200 OK, No Body) */
export type ApiSegmentUploadCompleteResponse = void;

/** [API] 입력 로그 업로드 요청 */
export interface ApiInputLogsUploadRequest {
  session_id: string;
  segment_id: string;
  video_url: string;
  logs: InputLog[];
}

/** [API] 입력 로그 업로드 응답 (202 Accepted, No Body) */
export type ApiInputLogsUploadResponse = void;

/** [API] 인사이트 답변 요청 */
export interface ApiInsightAnswerRequest {
  answer_text: string;
}

/** [API] 인사이트 답변 응답 */
export interface ApiInsightAnswerResponse {
  result: {
    tag_id: number;
    is_complete: boolean;
  };
}

/** [API] InsightTag 조회 응답 */
export interface ApiInsightTagsResponse {
  result: {
    tags: ApiInsightTag[];
    total_count: number;
  };
}
