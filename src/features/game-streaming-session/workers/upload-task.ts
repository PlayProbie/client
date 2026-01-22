/**
 * Upload Task
 *
 * 세그먼트 업로드 태스크 정의 및 실행 로직.
 */
import { postInputLogs, postPresignedUrl, postUploadComplete } from '../api';
import type { InputLog } from '../types';
import type { UploadWorkerSegmentPayload } from './upload-worker.types';

/**
 * 업로드 태스크 상태
 */
export interface UploadTask {
  sessionId: string;
  sequence: number;
  segment: UploadWorkerSegmentPayload['segment'];
  contentType: string;
  blob: Blob;
  logs: InputLog[];
  remoteSegmentId?: string;
  s3Url?: string;
  s3Uploaded: boolean;
  completeNotified: boolean;
  logsUploaded: boolean;
}

/**
 * S3에 비디오 업로드
 */
export async function uploadToS3(
  s3Url: string,
  contentType: string,
  blob: Blob,
  signal: AbortSignal
): Promise<void> {
  // Presigned PUT에서는 streaming body가 실패할 수 있어 Blob으로 전송합니다.
  const body = blob;
  const response = await fetch(s3Url, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
    },
    body,
    signal,
  });

  if (!response.ok) {
    throw new Error(`S3 업로드 실패: ${response.status}`);
  }
}

export interface PerformUploadOptions {
  task: UploadTask;
  getAbortController: () => AbortController;
  clearAbortController: () => void;
}

export interface PerformUploadResult {
  remoteSegmentId: string;
  s3Url: string;
}

/**
 * 업로드 태스크 실행
 * 1. Presigned URL 요청
 * 2. S3 업로드
 * 3. 서버에 완료 알림
 * 4. 입력 로그 업로드
 */
export async function performUpload({
  task,
  getAbortController,
  clearAbortController,
}: PerformUploadOptions): Promise<PerformUploadResult> {
  // 1. Presigned URL 요청
  if (!task.remoteSegmentId || !task.s3Url) {
    const { segmentId: backendSegmentId, s3Url } = await postPresignedUrl(
      task.sessionId,
      {
        sequence: task.sequence,
        video_start_ms: task.segment.start_media_time,
        video_end_ms: task.segment.end_media_time,
        content_type: task.contentType,
      }
    );

    task.remoteSegmentId = backendSegmentId;
    task.s3Url = s3Url;
  }

  // 2. S3 업로드
  if (!task.s3Uploaded && task.s3Url) {
    const abortController = getAbortController();
    try {
      await uploadToS3(
        task.s3Url,
        task.contentType,
        task.blob,
        abortController.signal
      );
      task.s3Uploaded = true;
    } finally {
      clearAbortController();
    }
  }

  // 3. 서버에 완료 알림
  if (!task.completeNotified && task.remoteSegmentId) {
    await postUploadComplete(task.sessionId, task.remoteSegmentId);
    task.completeNotified = true;
  }

  // 4. 입력 로그 업로드
  if (!task.logsUploaded && task.remoteSegmentId && task.s3Url) {
    if (task.logs.length > 0) {
      await postInputLogs(
        task.sessionId,
        task.remoteSegmentId,
        task.s3Url,
        task.logs
      );
    }
    task.logsUploaded = true;
    task.logs = [];
  }

  return {
    remoteSegmentId: task.remoteSegmentId ?? task.segment.segment_id,
    s3Url: task.s3Url ?? '',
  };
}
