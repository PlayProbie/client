import type { SegmentMeta } from '../../types/highlight';

export interface SegmentRecorderOptions {
  videoElement: HTMLVideoElement;
  sessionId: string;
  enabled?: boolean;
  segmentDurationMs?: number;
  overlapMs?: number;
  targetHeight?: number;
  frameRate?: number;
  onSegmentReady: (segment: RecordedSegment) => void | Promise<void>;
  onSegmentStart?: (segment: SegmentTiming) => void;
  onError?: (error: Error) => void;
  onUnsupported?: (reason: string) => void;
}

export interface SegmentTiming {
  segmentId: string;
  recordStartMs: number;
  recordEndMs: number;
  coreStartMs: number;
  coreEndMs: number;
}

export interface RecordedSegment {
  segmentId: string;
  blob: Blob;
  mimeType: string;
  meta: SegmentMeta;
  timing: SegmentTiming;
}
