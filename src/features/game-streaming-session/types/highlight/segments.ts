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
