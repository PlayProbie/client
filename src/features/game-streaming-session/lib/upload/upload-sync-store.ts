/**
 * Upload Sync Store
 *
 * Service Worker와 공유 가능한 IndexedDB 기반 업로드 큐 영속화.
 * 탭이 닫혀도 pending 업로드 목록이 유지됩니다.
 */

const DB_NAME = 'upload-sync-store';
const DB_VERSION = 1;
const STORE_NAME = 'pending-uploads';

export type PendingUploadStatus = 'pending' | 'processing';
export type PendingUploadOwner = 'main' | 'shared' | 'sw';

export interface PendingUpload {
  segmentId: string;
  sessionId: string;
  sequence: number;
  videoStartMs: number;
  videoEndMs: number;
  contentType: string;
  logs: unknown[];
  createdAt: string;
  status: PendingUploadStatus;
  processingOwner?: PendingUploadOwner | null;
  processingStartedAt?: string | null;
  updatedAt?: string;
}

let dbInstance: IDBDatabase | null = null;

type PendingUploadRecord = PendingUpload & {
  status?: PendingUploadStatus;
  processingOwner?: PendingUploadOwner | null;
  processingStartedAt?: string | null;
  updatedAt?: string;
};

function normalizePendingUpload(upload: PendingUploadRecord): PendingUpload {
  return {
    ...upload,
    status: upload.status ?? 'pending',
    processingOwner: upload.processingOwner ?? null,
    processingStartedAt: upload.processingStartedAt ?? null,
    updatedAt: upload.updatedAt ?? upload.createdAt,
  };
}

function openDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'segmentId',
        });
        store.createIndex('sessionId', 'sessionId', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
}

/**
 * Pending 업로드 추가
 */
export async function addPendingUpload(upload: PendingUpload): Promise<void> {
  const db = await openDB();
  const normalized = normalizePendingUpload(upload);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(normalized);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

function updatePendingUpload(
  segmentId: string,
  updater: (current: PendingUpload) => PendingUpload
): Promise<void> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(segmentId);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const record = request.result as PendingUploadRecord | undefined;
          if (!record) {
            return;
          }
          const normalized = normalizePendingUpload(record);
          const updated = updater(normalized);
          store.put(updated);
        };

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      })
  );
}

/**
 * Pending 업로드 상태를 processing으로 변경
 */
export async function markPendingUploadProcessing(
  segmentId: string,
  owner: PendingUploadOwner,
  startedAt: string = new Date().toISOString()
): Promise<void> {
  await updatePendingUpload(segmentId, (current) => ({
    ...current,
    status: 'processing',
    processingOwner: owner,
    processingStartedAt: startedAt,
    updatedAt: new Date().toISOString(),
  }));
}

/**
 * Pending 업로드 상태를 pending으로 복구
 */
export async function markPendingUploadPending(
  segmentId: string
): Promise<void> {
  await updatePendingUpload(segmentId, (current) => ({
    ...current,
    status: 'pending',
    processingOwner: null,
    processingStartedAt: null,
    updatedAt: new Date().toISOString(),
  }));
}

/**
 * Pending 업로드 제거
 */
export async function removePendingUpload(segmentId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(segmentId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * 모든 Pending 업로드 목록 조회
 */
export async function getPendingUploads(): Promise<PendingUpload[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () =>
      resolve(
        (request.result as PendingUploadRecord[]).map(normalizePendingUpload)
      );
  });
}

/**
 * 특정 세션의 Pending 업로드 목록 조회
 */
export async function getPendingUploadsBySession(
  sessionId: string
): Promise<PendingUpload[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('sessionId');
    const request = index.getAll(sessionId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () =>
      resolve(
        (request.result as PendingUploadRecord[]).map(normalizePendingUpload)
      );
  });
}

/**
 * Pending 업로드 개수 조회
 */
export async function getPendingUploadCount(): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.count();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * 모든 Pending 업로드 삭제
 */
export async function clearPendingUploads(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.clear();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}
