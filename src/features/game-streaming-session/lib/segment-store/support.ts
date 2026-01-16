import type { SegmentMeta } from '../../types/highlight';
import {
  DEFAULT_STORAGE_BYTES,
  DEFAULT_STORAGE_RATIO,
} from './constants';
import type { SegmentStoreOptions } from './types';

export function supportsOpfs(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    !!navigator.storage &&
    typeof navigator.storage.getDirectory === 'function'
  );
}

export function supportsIndexedDb(): boolean {
  return typeof indexedDB !== 'undefined';
}

export async function resolveStorageLimitBytes(
  options: SegmentStoreOptions
): Promise<number> {
  if (options.maxStorageBytes) {
    return options.maxStorageBytes;
  }
  if (typeof navigator === 'undefined' || !navigator.storage?.estimate) {
    return DEFAULT_STORAGE_BYTES;
  }
  const estimate = await navigator.storage.estimate();
  const quota = estimate.quota ?? DEFAULT_STORAGE_BYTES;
  const ratio = options.maxStorageRatio ?? DEFAULT_STORAGE_RATIO;
  return Math.floor(quota * ratio);
}

export function toKey(sessionId: string, segmentId: string): string {
  return `${sessionId}:${segmentId}`;
}

export function normalizeMeta(meta: SegmentMeta, blob: Blob): SegmentMeta {
  if (meta.file_size == null) {
    return {
      ...meta,
      file_size: blob.size,
    };
  }
  return meta;
}
