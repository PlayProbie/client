import type { SegmentMeta, SegmentUploadStatus } from '../../types';
import { MIME_TYPE_CANDIDATES } from './segment-recorder.constants';

export function selectSupportedMimeType(): string | null {
  if (typeof MediaRecorder === 'undefined') {
    return null;
  }
  for (const candidate of MIME_TYPE_CANDIDATES) {
    if (MediaRecorder.isTypeSupported(candidate)) {
      return candidate;
    }
  }
  return null;
}

export function ensureCanvasCaptureSupported(): boolean {
  return (
    typeof HTMLCanvasElement !== 'undefined' &&
    typeof HTMLCanvasElement.prototype.captureStream === 'function'
  );
}

export function getVideoDimensions(
  videoElement: HTMLVideoElement,
  targetHeight: number
): { width: number; height: number } {
  const height = targetHeight;
  const videoWidth = videoElement.videoWidth || 1280;
  const videoHeight = videoElement.videoHeight || 720;
  const ratio = videoWidth / videoHeight;
  let width = Math.round(height * ratio);
  if (width % 2 !== 0) {
    width -= 1;
  }
  return { width, height };
}

export function waitForVideoMetadata(
  videoElement: HTMLVideoElement
): Promise<void> {
  if (videoElement.readyState >= 1) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const handleLoaded = () => {
      cleanup();
      resolve();
    };
    const handleError = () => {
      cleanup();
      reject(new Error('비디오 메타데이터 로드 실패'));
    };
    const cleanup = () => {
      videoElement.removeEventListener('loadedmetadata', handleLoaded);
      videoElement.removeEventListener('error', handleError);
    };
    videoElement.addEventListener('loadedmetadata', handleLoaded);
    videoElement.addEventListener('error', handleError);
  });
}

export function getMediaTimeMs(videoElement: HTMLVideoElement): number {
  return Math.round(videoElement.currentTime * 1000);
}

export function createSegmentMeta(params: {
  segmentId: string;
  sessionId: string;
  coreStartMs: number;
  coreEndMs: number;
  overlapMs: number;
  fileSize?: number;
  status?: SegmentUploadStatus;
}): SegmentMeta {
  const {
    segmentId,
    sessionId,
    coreStartMs,
    coreEndMs,
    overlapMs,
    fileSize,
    status = 'LOCAL_ONLY',
  } = params;

  return {
    segment_id: segmentId,
    session_id: sessionId,
    start_media_time: coreStartMs,
    end_media_time: coreEndMs,
    upload_status: status,
    overlap_ms: overlapMs,
    file_size: fileSize,
    created_at: new Date().toISOString(),
  };
}
