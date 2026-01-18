/**
 * Input Log IndexedDB Store
 *
 * 입력 로그를 IndexedDB에 실시간 저장하여 탭 종료 시에도 보존합니다.
 */

const DB_NAME = 'input-log-store';
const DB_VERSION = 1;
const STORE_NAME = 'input-logs';

export interface StoredInputLog {
  id: string; // auto-generated unique ID
  sessionId: string;
  segmentId: string;
  log: unknown;
  mediaTime: number;
  createdAt: string;
}

let dbInstance: IDBDatabase | null = null;
let idCounter = 0;

function generateId(): string {
  return `${Date.now()}_${idCounter++}`;
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
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('sessionId', 'sessionId', { unique: false });
        store.createIndex('segmentId', 'segmentId', { unique: false });
        store.createIndex('mediaTime', 'mediaTime', { unique: false });
      }
    };
  });
}

/**
 * 입력 로그 저장
 */
export async function saveInputLog(
  sessionId: string,
  segmentId: string,
  log: unknown,
  mediaTime: number
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const record: StoredInputLog = {
      id: generateId(),
      sessionId,
      segmentId,
      log,
      mediaTime,
      createdAt: new Date().toISOString(),
    };

    const request = store.put(record);

    request.onerror = () => {
      // eslint-disable-next-line no-console
      console.error('[input-log-store] put error:', request.error);
      reject(request.error);
    };
    request.onsuccess = () => {
      resolve();
    };
  });
}

/**
 * 세션의 모든 로그 저장 (배치)
 */
export async function saveInputLogsBatch(
  sessionId: string,
  logs: Array<{ segmentId: string; log: unknown; mediaTime: number }>
): Promise<void> {
  if (logs.length === 0) return;

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    logs.forEach(({ segmentId, log, mediaTime }) => {
      const record: StoredInputLog = {
        id: generateId(),
        sessionId,
        segmentId,
        log,
        mediaTime,
        createdAt: new Date().toISOString(),
      };
      store.put(record);
    });

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * 세그먼트별 로그 조회
 */
export async function getInputLogsBySegment(
  segmentId: string
): Promise<StoredInputLog[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('segmentId');
    const request = index.getAll(segmentId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * 세션별 로그 조회
 */
export async function getInputLogsBySession(
  sessionId: string
): Promise<StoredInputLog[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('sessionId');
    const request = index.getAll(sessionId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * 세그먼트 로그 삭제
 */
export async function deleteInputLogsBySegment(
  segmentId: string
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('segmentId');
    const request = index.openCursor(segmentId);

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * 세션 로그 전체 삭제
 */
export async function deleteInputLogsBySession(
  sessionId: string
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('sessionId');
    const request = index.openCursor(sessionId);

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * 세션에서 로그가 있는 세그먼트 ID 목록
 */
export async function getSegmentIdsWithLogs(
  sessionId: string
): Promise<string[]> {
  const logs = await getInputLogsBySession(sessionId);
  const segmentIds = new Set<string>();
  logs.forEach((log) => segmentIds.add(log.segmentId));
  return Array.from(segmentIds);
}
