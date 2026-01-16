import type { SegmentMeta } from '../../types';
import {
  clearRecordsBySession,
  deleteRecordByKey,
  getRecordByKey,
  getRecordsBySession,
  openSegmentStoreDb,
  putRecord,
} from './segment-store.idb';
import { getOpfsSessionDir } from './segment-store.opfs';
import {
  normalizeMeta,
  resolveStorageLimitBytes,
  supportsIndexedDb,
  supportsOpfs,
  toKey,
} from './segment-store.support';
import type {
  SegmentRecord,
  SegmentStore,
  SegmentStoreBackend,
  SegmentStoreOptions,
  SegmentWriter,
} from './segment-store.types';

class SegmentStoreImpl implements SegmentStore {
  readonly backend: SegmentStoreBackend;
  private readonly sessionId: string;
  private readonly maxStorageBytes: number;
  private readonly onEvict?: (segmentIds: string[]) => void;
  private readonly db: IDBDatabase | null;
  private readonly opfsDir: FileSystemDirectoryHandle | null;
  private readonly memoryStore: Map<string, SegmentRecord>;

  constructor(params: {
    backend: SegmentStoreBackend;
    sessionId: string;
    maxStorageBytes: number;
    onEvict?: (segmentIds: string[]) => void;
    db?: IDBDatabase | null;
    opfsDir?: FileSystemDirectoryHandle | null;
  }) {
    this.backend = params.backend;
    this.sessionId = params.sessionId;
    this.maxStorageBytes = params.maxStorageBytes;
    this.onEvict = params.onEvict;
    this.db = params.db ?? null;
    this.opfsDir = params.opfsDir ?? null;
    this.memoryStore = new Map();
  }

  async saveSegment(meta: SegmentMeta, blob: Blob): Promise<void> {
    const normalizedMeta = normalizeMeta(meta, blob);
    await this.evictIfNeeded(blob.size);

    const segmentId = normalizedMeta.segment_id;
    const record: SegmentRecord = {
      key: toKey(this.sessionId, segmentId),
      sessionId: this.sessionId,
      segmentId,
      meta: normalizedMeta,
      fileSize: normalizedMeta.file_size ?? blob.size,
      lastAccessedAt: new Date().toISOString(),
      blob:
        this.backend === 'indexeddb' || this.backend === 'memory'
          ? blob
          : undefined,
    };

    if (this.backend === 'opfs' && this.opfsDir) {
      const fileHandle = await this.opfsDir.getFileHandle(segmentId, {
        create: true,
      });
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
    }

    if (this.backend === 'memory') {
      this.memoryStore.set(record.key, record);
      return;
    }

    if (!this.db) {
      throw new Error('SegmentStore DB가 초기화되지 않았습니다.');
    }
    await putRecord(this.db, record);
  }

  async saveSegmentMeta(meta: SegmentMeta, fileSize: number): Promise<void> {
    if (this.backend === 'memory' || this.backend === 'indexeddb') {
      throw new Error('saveSegmentMeta는 OPFS backend에서만 사용 가능합니다.');
    }

    if (!this.db) {
      throw new Error('SegmentStore DB가 초기화되지 않았습니다.');
    }

    const normalizedMeta =
      meta.file_size == null ? { ...meta, file_size: fileSize } : meta;

    await this.evictIfNeeded(fileSize);

    const segmentId = normalizedMeta.segment_id;
    const record: SegmentRecord = {
      key: toKey(this.sessionId, segmentId),
      sessionId: this.sessionId,
      segmentId,
      meta: normalizedMeta,
      fileSize: normalizedMeta.file_size ?? fileSize,
      lastAccessedAt: new Date().toISOString(),
    };

    await putRecord(this.db, record);
  }

  async openSegmentWriter(segmentId: string): Promise<SegmentWriter | null> {
    if (this.backend !== 'opfs' || !this.opfsDir) {
      return null;
    }

    const fileHandle = await this.opfsDir.getFileHandle(segmentId, {
      create: true,
    });
    const writable = await fileHandle.createWritable();
    let closed = false;
    let fileSize = 0;
    let writeQueue = Promise.resolve();

    const write = async (chunk: Blob) => {
      if (closed) return;
      writeQueue = writeQueue.then(async () => {
        await writable.write(chunk);
        fileSize += chunk.size;
      });
      return writeQueue;
    };

    const close = async () => {
      if (closed) return;
      closed = true;
      await writeQueue;
      await writable.close();
    };

    return {
      segmentId,
      write,
      close,
      getSize: () => fileSize,
    };
  }

  async getSegment(
    segmentId: string
  ): Promise<{ meta: SegmentMeta; blob: Blob } | null> {
    const record = await this.getRecord(segmentId);
    if (!record) return null;

    const blob =
      this.backend === 'opfs'
        ? await this.readOpfsBlob(segmentId)
        : (record.blob ?? null);
    if (!blob) return null;

    await this.touchRecord(record, blob.size);
    return { meta: record.meta, blob };
  }

  async deleteSegment(segmentId: string): Promise<void> {
    const record = await this.getRecord(segmentId);
    if (!record) return;
    await this.removeRecord(record);
  }

  async listSegments(): Promise<SegmentMeta[]> {
    const records = await this.getRecords();
    return records
      .map((record) => record.meta)
      .sort((a, b) => a.start_media_time - b.start_media_time);
  }

  async clear(): Promise<void> {
    if (this.backend === 'memory') {
      this.memoryStore.clear();
      return;
    }

    if (!this.db) {
      throw new Error('SegmentStore DB가 초기화되지 않았습니다.');
    }

    const records = await clearRecordsBySession(this.db, this.sessionId);
    if (this.backend === 'opfs' && this.opfsDir) {
      await Promise.all(
        records.map((record) =>
          this.opfsDir?.removeEntry(record.segmentId).catch(() => undefined)
        )
      );
    }
  }

  async getUsageBytes(): Promise<number> {
    const records = await this.getRecords();
    return records.reduce((sum, record) => sum + record.fileSize, 0);
  }

  private async evictIfNeeded(additionalBytes: number): Promise<void> {
    let usage = await this.getUsageBytes();
    if (usage + additionalBytes <= this.maxStorageBytes) {
      return;
    }

    const records = await this.getRecords();
    const sorted = [...records].sort(
      (a, b) =>
        new Date(a.lastAccessedAt).getTime() -
        new Date(b.lastAccessedAt).getTime()
    );

    const evicted: string[] = [];
    for (const record of sorted) {
      if (usage + additionalBytes <= this.maxStorageBytes) {
        break;
      }
      await this.removeRecord(record);
      usage -= record.fileSize;
      evicted.push(record.segmentId);
    }

    if (evicted.length > 0) {
      this.onEvict?.(evicted);
    }
  }

  private async getRecords(): Promise<SegmentRecord[]> {
    if (this.backend === 'memory') {
      return [...this.memoryStore.values()].filter(
        (record) => record.sessionId === this.sessionId
      );
    }
    if (!this.db) {
      throw new Error('SegmentStore DB가 초기화되지 않았습니다.');
    }
    return getRecordsBySession(this.db, this.sessionId);
  }

  private async getRecord(segmentId: string): Promise<SegmentRecord | null> {
    const key = toKey(this.sessionId, segmentId);
    if (this.backend === 'memory') {
      return this.memoryStore.get(key) ?? null;
    }
    if (!this.db) {
      throw new Error('SegmentStore DB가 초기화되지 않았습니다.');
    }
    return getRecordByKey(this.db, key);
  }

  private async removeRecord(record: SegmentRecord): Promise<void> {
    if (this.backend === 'opfs' && this.opfsDir) {
      await this.opfsDir.removeEntry(record.segmentId).catch(() => undefined);
    }

    if (this.backend === 'memory') {
      this.memoryStore.delete(record.key);
      return;
    }

    if (!this.db) {
      throw new Error('SegmentStore DB가 초기화되지 않았습니다.');
    }
    await deleteRecordByKey(this.db, record.key);
  }

  private async readOpfsBlob(segmentId: string): Promise<Blob | null> {
    if (!this.opfsDir) return null;
    try {
      const fileHandle = await this.opfsDir.getFileHandle(segmentId);
      const file = await fileHandle.getFile();
      return file;
    } catch {
      return null;
    }
  }

  private async touchRecord(
    record: SegmentRecord,
    size: number
  ): Promise<void> {
    record.lastAccessedAt = new Date().toISOString();
    record.fileSize = size;
    if (this.backend === 'memory') {
      this.memoryStore.set(record.key, record);
      return;
    }
    if (!this.db) {
      throw new Error('SegmentStore DB가 초기화되지 않았습니다.');
    }
    await putRecord(this.db, record);
  }
}

export async function createSegmentStore(
  options: SegmentStoreOptions
): Promise<SegmentStore> {
  const backendPreference = options.backend ?? 'auto';
  const maxStorageBytes = await resolveStorageLimitBytes(options);

  if (backendPreference === 'memory') {
    return new SegmentStoreImpl({
      backend: 'memory',
      sessionId: options.sessionId,
      maxStorageBytes,
      onEvict: options.onEvict,
    });
  }

  if (
    (backendPreference === 'auto' || backendPreference === 'opfs') &&
    supportsOpfs()
  ) {
    const db = supportsIndexedDb() ? await openSegmentStoreDb() : null;
    const opfsDir = await getOpfsSessionDir(options.sessionId);
    return new SegmentStoreImpl({
      backend: 'opfs',
      sessionId: options.sessionId,
      maxStorageBytes,
      onEvict: options.onEvict,
      db,
      opfsDir,
    });
  }

  if (backendPreference === 'auto' || backendPreference === 'indexeddb') {
    if (!supportsIndexedDb()) {
      throw new Error('IndexedDB 미지원 환경입니다.');
    }
    const db = await openSegmentStoreDb();
    return new SegmentStoreImpl({
      backend: 'indexeddb',
      sessionId: options.sessionId,
      maxStorageBytes,
      onEvict: options.onEvict,
      db,
    });
  }

  throw new Error('SegmentStore backend 설정이 유효하지 않습니다.');
}
