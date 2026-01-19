/**
 * Upload Shared Worker
 *
 * Safari/Firefox에서도 탭 닫힘 후 업로드를 지속하기 위한 Shared Worker.
 * 같은 origin의 다른 탭이 열려있으면 해당 워커가 업로드를 처리합니다.
 */

/// <reference lib="webworker" />

// SharedWorker의 onconnect 이벤트를 위한 타입 선언
declare const self: SharedWorkerGlobalScope;

const connections: MessagePort[] = [];
let isProcessing = false;

const DB_NAME = 'upload-sync-store';
const DB_VERSION = 1;
const STORE_NAME = 'pending-uploads';
const SEGMENT_DB_NAME = 'segment-store';
const SEGMENT_DB_VERSION = 1;
const SEGMENT_STORE_NAME = 'segments';
// 환경 변수는 빌드 시점에 Vite가 주입합니다
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

// 새로운 연결 처리
self.onconnect = (event: MessageEvent) => {
  const port = event.ports[0];
  connections.push(port);

  port.onmessage = (e: MessageEvent) => {
    const message = e.data;

    switch (message.type) {
      case 'PROCESS_UPLOADS':
        processUploadQueue().catch(() => {
          // 에러는 클라이언트에 브로드캐스트됨
        });
        break;
      case 'ENQUEUE_SEGMENT':
        // 클라이언트가 직접 IndexedDB에 저장하므로 여기서는 처리 시작만
        processUploadQueue().catch(() => {
          // 에러는 클라이언트에 브로드캐스트됨
        });
        break;
      case 'PING':
        port.postMessage({ type: 'PONG' });
        break;
    }
  };

  port.onmessageerror = () => {
    const idx = connections.indexOf(port);
    if (idx > -1) {
      connections.splice(idx, 1);
    }
  };

  port.start();
};

// 모든 연결에 메시지 브로드캐스트
function broadcast(message: unknown): void {
  connections.forEach((port) => {
    try {
      port.postMessage(message);
    } catch {
      // 연결이 끊긴 port는 무시
    }
  });
}

// IndexedDB 열기
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

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

function openSegmentDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(SEGMENT_DB_NAME, SEGMENT_DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(SEGMENT_STORE_NAME)) {
        const store = db.createObjectStore(SEGMENT_STORE_NAME, {
          keyPath: 'key',
        });
        store.createIndex('sessionId', 'sessionId', { unique: false });
        store.createIndex('lastAccessedAt', 'lastAccessedAt', { unique: false });
      }
    };
  });
}

function runIdbRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error('IndexedDB 요청 실패'));
  });
}

// Pending 업로드 목록 조회
async function getPendingUploads(): Promise<PendingUpload[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

// 업로드 완료 후 삭제
async function removePendingUpload(segmentId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(segmentId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// OPFS에서 Blob 읽기
async function readBlobFromOPFS(
  sessionId: string,
  segmentId: string
): Promise<Blob | null> {
  try {
    const root = await navigator.storage.getDirectory();
    const storeDir = await root.getDirectoryHandle('segment-store');
    const sessionDir = await storeDir.getDirectoryHandle(sessionId);
    const fileHandle = await sessionDir.getFileHandle(segmentId);
    return await fileHandle.getFile();
  } catch {
    return null;
  }
}

async function readBlobFromIndexedDb(
  sessionId: string,
  segmentId: string
): Promise<Blob | null> {
  try {
    const db = await openSegmentDb();
    const key = `${sessionId}:${segmentId}`;
    const tx = db.transaction(SEGMENT_STORE_NAME, 'readonly');
    const store = tx.objectStore(SEGMENT_STORE_NAME);
    const record = await runIdbRequest<{ blob?: Blob } | undefined>(
      store.get(key)
    );
    return record?.blob ?? null;
  } catch {
    return null;
  }
}

async function readSegmentBlob(
  sessionId: string,
  segmentId: string
): Promise<Blob | null> {
  const opfsBlob = await readBlobFromOPFS(sessionId, segmentId);
  if (opfsBlob) return opfsBlob;
  return readBlobFromIndexedDb(sessionId, segmentId);
}

// Presigned URL 발급
async function getPresignedUrl(
  sessionId: string,
  payload: {
    sequence: number;
    video_start_ms: number;
    video_end_ms: number;
    content_type: string;
  }
): Promise<{ segmentId: string; s3Url: string; expiresIn: number }> {
  const response = await fetch(
    `${API_BASE_URL}/sessions/${sessionId}/replay/presigned-url`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error(`Presigned URL 발급 실패: ${response.status}`);
  }

  const data = await response.json();
  const result = data.result || data.data;
  return {
    segmentId: result.segment_id,
    s3Url: result.s3_url,
    expiresIn: result.expires_in,
  };
}

// S3 업로드
async function uploadToS3(
  s3Url: string,
  blob: Blob,
  contentType: string
): Promise<void> {
  const response = await fetch(s3Url, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: blob,
  });

  if (!response.ok) {
    throw new Error(`S3 업로드 실패: ${response.status}`);
  }
}

// 업로드 완료 알림
async function notifyUploadComplete(
  sessionId: string,
  segmentId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/sessions/${sessionId}/replay/upload-complete`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ segment_id: segmentId }),
    }
  );

  if (!response.ok) {
    throw new Error(`업로드 완료 알림 실패: ${response.status}`);
  }
}

// 입력 로그 전송
async function uploadInputLogs(
  sessionId: string,
  segmentId: string,
  s3Url: string,
  logs: unknown[]
): Promise<void> {
  if (!logs || logs.length === 0) return;

  const response = await fetch(
    `${API_BASE_URL}/sessions/${sessionId}/replay/logs`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        segment_id: segmentId,
        video_url: s3Url,
        logs,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`로그 업로드 실패: ${response.status}`);
  }
}

interface PendingUpload {
  segmentId: string;
  sessionId: string;
  sequence: number;
  videoStartMs: number;
  videoEndMs: number;
  contentType: string;
  logs: unknown[];
  createdAt: string;
}

// 단일 세그먼트 업로드
async function uploadSegment(task: PendingUpload): Promise<void> {
  const {
    sessionId,
    segmentId,
    sequence,
    videoStartMs,
    videoEndMs,
    contentType,
    logs,
  } = task;

  // 1. OPFS에서 Blob 읽기
  const blob = await readSegmentBlob(sessionId, segmentId);
  if (!blob) {
    await removePendingUpload(segmentId);
    return;
  }

  // 2. Presigned URL 발급
  const presigned = await getPresignedUrl(sessionId, {
    sequence,
    video_start_ms: videoStartMs,
    video_end_ms: videoEndMs,
    content_type: contentType || 'video/webm',
  });

  // 3. S3 업로드
  await uploadToS3(presigned.s3Url, blob, contentType || 'video/webm');

  // 4. 업로드 완료 알림
  await notifyUploadComplete(sessionId, presigned.segmentId);

  // 5. 입력 로그 전송
  if (logs && logs.length > 0) {
    await uploadInputLogs(
      sessionId,
      presigned.segmentId,
      presigned.s3Url,
      logs
    );
  }

  // 6. 큐에서 제거
  await removePendingUpload(segmentId);

  // 7. 클라이언트에게 알림
  broadcast({
    type: 'SEGMENT_UPLOADED',
    payload: {
      localSegmentId: segmentId,
      remoteSegmentId: presigned.segmentId,
      s3Url: presigned.s3Url,
    },
  });
}

// 업로드 큐 처리
async function processUploadQueue(): Promise<void> {
  if (isProcessing) {
    return;
  }

  isProcessing = true;

  try {
    const pendingUploads = await getPendingUploads();

    if (pendingUploads.length === 0) {
      return;
    }

    // 순차적으로 업로드
    for (const task of pendingUploads) {
      try {
        await uploadSegment(task);
      } catch (error) {
        broadcast({
          type: 'SEGMENT_FAILED',
          payload: {
            localSegmentId: task.segmentId,
            reason: error instanceof Error ? error.message : String(error),
          },
        });
      }
    }
  } finally {
    isProcessing = false;
  }
}
