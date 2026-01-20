/**
 * Upload Service Worker
 *
 * 탭이 닫혀도 업로드가 지속되도록 Background Sync API를 사용합니다.
 * Chrome/Edge에서만 지원됩니다.
 */

const SYNC_TAG = 'upload-segments';
const DB_NAME = 'upload-sync-store';
const DB_VERSION = 1;
const STORE_NAME = 'pending-uploads';
const SEGMENT_DB_NAME = 'segment-store';
const SEGMENT_DB_VERSION = 1;
const SEGMENT_STORE_NAME = 'segments';
const PROCESSING_STALE_MS = 1000;
const PROCESSING_OWNER = 'service-worker';

const searchParams = new URL(location.href).searchParams;
const API_BASE_URL = searchParams.get('apiUrl') || 'http://localhost:8080';
let authToken = '';

// 클라이언트에서 토큰 업데이트 수신 (postMessage로 안전하게 전달)
self.addEventListener('message', (event) => {
  if (event.data?.type === 'UPDATE_TOKEN' && event.data.token) {
    authToken = event.data.token;
  }
  if (event.data?.type === 'PROCESS_UPLOADS') {
    event.waitUntil(processUploadQueue());
  }
});

/**
 * 전역 fetch 오버라이드 (main.tsx와 동일한 패턴)
 * 모든 fetch 요청에 Authorization 헤더 자동 적용
 * AWS 관련 요청(S3 등)은 자체 서명을 사용하므로 완전히 제외
 */
const originalFetch = self.fetch.bind(self);
self.fetch = (input, init) => {
  // AWS 요청 여부 확인 (S3 등)
  const url =
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.href
        : input.url;
  const isAwsRequest =
    url.includes('.amazonaws.com') ||
    url.includes('.s3.') ||
    url.includes('s3.');

  // AWS 요청은 원본 그대로 통과
  if (isAwsRequest) {
    return originalFetch(input, init);
  }

  // 일반 API 요청에만 Bearer 토큰 추가
  const headers = new Headers(init?.headers);

  if (authToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  return originalFetch(input, {
    ...init,
    headers,
  });
};

// Service Worker 설치
self.addEventListener('install', () => {
  self.skipWaiting();
});

// Service Worker 활성화
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Background Sync 이벤트
self.addEventListener('sync', (event) => {
  if (event.tag === SYNC_TAG) {
    event.waitUntil(processUploadQueue());
  }
});

// IndexedDB 열기
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
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

function openSegmentDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(SEGMENT_DB_NAME, SEGMENT_DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(SEGMENT_STORE_NAME)) {
        const store = db.createObjectStore(SEGMENT_STORE_NAME, {
          keyPath: 'key',
        });
        store.createIndex('sessionId', 'sessionId', { unique: false });
        store.createIndex('lastAccessedAt', 'lastAccessedAt', {
          unique: false,
        });
      }
    };
  });
}

function runIdbRequest(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error || new Error('IndexedDB 요청 실패'));
  });
}

function normalizePendingUpload(upload) {
  return {
    ...upload,
    status: upload.status || 'pending',
    processingOwner: upload.processingOwner || null,
    processingStartedAt: upload.processingStartedAt || null,
    updatedAt: upload.updatedAt || upload.createdAt,
  };
}

function isProcessingStale(upload) {
  if (upload.status !== 'processing') return false;
  if (!upload.processingStartedAt) return true;
  const startedAtMs = new Date(upload.processingStartedAt).getTime();
  return Date.now() - startedAtMs > PROCESSING_STALE_MS;
}

async function claimPendingUpload(segmentId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    let claimed = null;
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(segmentId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const record = request.result;
      if (!record) {
        return;
      }
      const normalized = normalizePendingUpload(record);
      if (
        normalized.status === 'processing' &&
        !isProcessingStale(normalized)
      ) {
        return;
      }
      const updated = {
        ...normalized,
        status: 'processing',
        processingOwner: PROCESSING_OWNER,
        processingStartedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      claimed = updated;
      store.put(updated);
    };

    tx.oncomplete = () => resolve(claimed);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

async function markPendingUploadPending(segmentId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(segmentId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const record = request.result;
      if (!record) {
        return;
      }
      const normalized = normalizePendingUpload(record);
      const updated = {
        ...normalized,
        status: 'pending',
        processingOwner: null,
        processingStartedAt: null,
        updatedAt: new Date().toISOString(),
      };
      store.put(updated);
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

// Pending 업로드 목록 조회
async function getPendingUploads() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('createdAt');
    const request = index.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () =>
      resolve(request.result.map(normalizePendingUpload));
  });
}

// 업로드 완료 후 삭제
async function removePendingUpload(segmentId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(segmentId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

async function scheduleSyncRetry() {
  if (!self.registration || !('sync' in self.registration)) {
    return;
  }

  try {
    await self.registration.sync.register(SYNC_TAG);
  } catch {
    // sync 재등록 실패는 무시
  }
}

// OPFS에서 Blob 읽기
async function readBlobFromOPFS(sessionId, segmentId) {
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

async function readBlobFromIndexedDb(sessionId, segmentId) {
  try {
    const db = await openSegmentDb();
    const key = `${sessionId}:${segmentId}`;
    const tx = db.transaction(SEGMENT_STORE_NAME, 'readonly');
    const store = tx.objectStore(SEGMENT_STORE_NAME);
    const record = await runIdbRequest(store.get(key));
    return record && record.blob ? record.blob : null;
  } catch {
    return null;
  }
}

async function readSegmentBlob(sessionId, segmentId) {
  const opfsBlob = await readBlobFromOPFS(sessionId, segmentId);
  if (opfsBlob) return opfsBlob;
  return readBlobFromIndexedDb(sessionId, segmentId);
}

// Presigned URL 발급
async function getPresignedUrl(sessionId, payload) {
  try {
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
  } catch (error) {
    console.error(`[SW] Presigned URL 에러:`, error);
    throw error;
  }
}

// S3 업로드
async function uploadToS3(s3Url, blob, contentType) {
  try {
    const response = await fetch(s3Url, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body: blob,
    });

    if (!response.ok) {
      throw new Error(`S3 업로드 실패: ${response.status}`);
    }
  } catch (error) {
    console.error(`[SW] S3 업로드 에러:`, error);
    throw error;
  }
}

// 업로드 완료 알림
async function notifyUploadComplete(sessionId, segmentId) {
  try {
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
  } catch (error) {
    console.error(`[SW] 업로드 완료 알림 에러:`, error);
    throw error;
  }
}

// 입력 로그 전송
async function uploadInputLogs(sessionId, segmentId, s3Url, logs) {
  if (!logs || logs.length === 0) return;

  const requestBody = {
    session_id: sessionId,
    segment_id: segmentId,
    video_url: s3Url,
    logs,
  };

  console.log(`[SW] 입력 로그 전송 시작: ${logs.length}개`);

  try {
    const response = await fetch(
      `${API_BASE_URL}/sessions/${sessionId}/replay/logs`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      throw new Error(`로그 업로드 실패: ${response.status}`);
    }

    console.log(`[SW] 입력 로그 전송 성공: ${logs.length}개`);
  } catch (error) {
    console.error(`[SW] 입력 로그 전송 에러:`, error);
    throw error;
  }
}

// 단일 세그먼트 업로드
async function uploadSegment(task) {
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

  // 5. 입력 로그 전송 (실패해도 세그먼트 업로드는 성공으로 처리)
  if (logs && logs.length > 0) {
    try {
      await uploadInputLogs(
        sessionId,
        presigned.segmentId,
        presigned.s3Url,
        logs
      );
    } catch (logError) {
      console.error(
        `[SW] 입력 로그 업로드 실패 (세그먼트는 성공):`,
        presigned.segmentId,
        logError
      );
      // 입력 로그 실패는 세그먼트 업로드를 실패시키지 않음
    }
  }

  // 6. 큐에서 제거
  await removePendingUpload(segmentId);
}

// 업로드 큐 처리
async function processUploadQueue(allowRetry = true) {
  try {
    const pendingUploads = await getPendingUploads();

    if (pendingUploads.length === 0) {
      return;
    }

    let lastError = null;
    let hasActiveProcessing = false;

    // 순차적으로 업로드 (병렬 업로드는 서버 부하 고려)
    for (const task of pendingUploads) {
      const claimed = await claimPendingUpload(task.segmentId);
      if (!claimed) {
        if (task.status === 'processing' && !isProcessingStale(task)) {
          hasActiveProcessing = true;
        }
        continue;
      }
      try {
        await uploadSegment(claimed);
      } catch (error) {
        await markPendingUploadPending(claimed.segmentId);
        lastError = error;
      }
    }

    if (hasActiveProcessing && allowRetry) {
      await new Promise((resolve) => setTimeout(resolve, PROCESSING_STALE_MS));
      return processUploadQueue(false);
    }

    if (lastError) {
      throw lastError;
    }
  } catch (error) {
    await scheduleSyncRetry();
    throw error; // sync 이벤트가 재시도하도록 에러 전파
  } finally {
  }
}
