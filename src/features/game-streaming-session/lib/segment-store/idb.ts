import { DB_NAME, DB_VERSION, STORE_NAME } from './constants';
import type { SegmentRecord } from './types';

export function openSegmentStoreDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        store.createIndex('sessionId', 'sessionId', { unique: false });
        store.createIndex('lastAccessedAt', 'lastAccessedAt', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error('IndexedDB open 실패'));
  });
}

export function runIdbRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error('IndexedDB 요청 실패'));
  });
}

export async function getRecordsBySession(
  db: IDBDatabase,
  sessionId: string
): Promise<SegmentRecord[]> {
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const index = store.index('sessionId');
  const records = await runIdbRequest(index.getAll(sessionId));
  return records as SegmentRecord[];
}

export async function getRecordByKey(
  db: IDBDatabase,
  key: string
): Promise<SegmentRecord | null> {
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const record = await runIdbRequest(store.get(key));
  return (record as SegmentRecord) ?? null;
}

export async function putRecord(
  db: IDBDatabase,
  record: SegmentRecord
): Promise<void> {
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await runIdbRequest(store.put(record));
}

export async function deleteRecordByKey(
  db: IDBDatabase,
  key: string
): Promise<void> {
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await runIdbRequest(store.delete(key));
}

export async function clearRecordsBySession(
  db: IDBDatabase,
  sessionId: string
): Promise<SegmentRecord[]> {
  const records = await getRecordsBySession(db, sessionId);
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  records.forEach((record) => {
    store.delete(record.key);
  });
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB 삭제 실패'));
    tx.onabort = () => reject(tx.error ?? new Error('IndexedDB 삭제 실패'));
  });
  return records;
}
