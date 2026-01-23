import type { StreamHealthState } from '../hooks/stream/useStreamHealth';
import type { InputLog, SegmentMeta } from '../types';

export interface UploadWorkerSegmentPayload {
  sessionId: string;
  sequence: number;
  segment: SegmentMeta;
  contentType: string;
  blob: Blob;
  logs: InputLog[];
}

export type UploadWorkerCommand =
  | {
      type: 'enqueue-segment';
      payload: UploadWorkerSegmentPayload;
    }
  | {
      type: 'set-network-status';
      payload: {
        status: StreamHealthState;
        rateBps: number | null;
        streamingActive: boolean;
      };
    }
  | {
      type: 'flush';
    }
  | {
      type: 'reset';
    };

export type UploadWorkerEvent =
  | {
      type: 'segment-processing';
      payload: {
        localSegmentId: string;
        startedAt: string;
      };
    }
  | {
      type: 'segment-uploaded';
      payload: {
        localSegmentId: string;
        remoteSegmentId: string;
        s3Url: string;
      };
    }
  | {
      type: 'segment-failed';
      payload: {
        localSegmentId: string;
        reason: string;
      };
    }
  | {
      type: 'queue-size';
      payload: {
        size: number;
      };
    }
  | {
      type: 'error';
      payload: {
        message: string;
      };
    };
