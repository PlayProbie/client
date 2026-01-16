import type { SegmentMeta } from '../../types/highlight';

export type SegmentStoreBackend = 'opfs' | 'indexeddb' | 'memory';

export interface SegmentStoreOptions {
  sessionId: string;
  backend?: SegmentStoreBackend | 'auto';
  maxStorageBytes?: number;
  maxStorageRatio?: number;
  onEvict?: (segmentIds: string[]) => void;
}

export interface SegmentStore {
  backend: SegmentStoreBackend;
  saveSegment: (meta: SegmentMeta, blob: Blob) => Promise<void>;
  getSegment: (
    segmentId: string
  ) => Promise<{ meta: SegmentMeta; blob: Blob } | null>;
  deleteSegment: (segmentId: string) => Promise<void>;
  listSegments: () => Promise<SegmentMeta[]>;
  clear: () => Promise<void>;
  getUsageBytes: () => Promise<number>;
}

export interface SegmentRecord {
  key: string;
  sessionId: string;
  segmentId: string;
  meta: SegmentMeta;
  fileSize: number;
  lastAccessedAt: string;
  blob?: Blob;
}
