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

const searchParams = new URL(location.href).searchParams;
const API_BASE_URL = searchParams.get('apiUrl') ?? 'http://localhost:8080';

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

// 메시지 수신 (클라이언트에서 직접 업로드 요청)
self.addEventListener('message', (event) => {
  if (event.data?.type === 'PROCESS_UPLOADS') {
    processUploadQueue().catch(() => {
      // 에러는 무시 (백그라운드 처리)
    });
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

// Pending 업로드 목록 조회
async function getPendingUploads() {
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

// Presigned URL 발급
async function getPresignedUrl(sessionId, payload) {
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
async function uploadToS3(s3Url, blob, contentType) {
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
async function notifyUploadComplete(sessionId, segmentId) {
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
async function uploadInputLogs(sessionId, segmentId, s3Url, logs) {
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
  const blob = await readBlobFromOPFS(sessionId, segmentId);
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
}

// 업로드 큐 처리
async function processUploadQueue() {
  try {
    const pendingUploads = await getPendingUploads();

    if (pendingUploads.length === 0) {
      return;
    }

    // 순차적으로 업로드 (병렬 업로드는 서버 부하 고려)
    for (const task of pendingUploads) {
      try {
        await uploadSegment(task);
      } catch {
        // 개별 실패는 무시하고 다음 세그먼트 처리
      }
    }
  } catch (error) {
    throw error; // sync 이벤트가 재시도하도록 에러 전파
  }
}
