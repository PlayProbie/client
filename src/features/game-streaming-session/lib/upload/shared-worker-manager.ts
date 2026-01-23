/**
 * Shared Worker Manager
 *
 * SharedWorker 싱글톤 인스턴스 관리 및 리스너 패턴 제공.
 * 여러 탭에서 공유되는 Worker를 통해 업로드를 조율합니다.
 */

export interface SharedWorkerMessage {
  type?: string;
  payload?: {
    localSegmentId?: string;
    remoteSegmentId?: string;
    s3Url?: string;
    reason?: string;
  };
}

type SharedWorkerListener = (message: SharedWorkerMessage) => void;

const listeners = new Set<SharedWorkerListener>();
let instance: SharedWorker | null = null;

function notifyListeners(message: SharedWorkerMessage): void {
  listeners.forEach((listener) => {
    try {
      listener(message);
    } catch {
      // ignore listener errors
    }
  });
}

/**
 * SharedWorker 지원 여부 확인
 */
export function supportsSharedWorker(): boolean {
  return typeof SharedWorker !== 'undefined';
}

/**
 * SharedWorker 싱글톤 인스턴스 반환
 * 지원되지 않거나 생성 실패 시 null 반환
 */
export function getSharedWorker(): SharedWorker | null {
  if (!supportsSharedWorker()) {
    return null;
  }

  if (instance) {
    return instance;
  }

  try {
    const worker = new SharedWorker(
      new URL('../../workers/upload-shared-worker.ts', import.meta.url),
      { type: 'module', name: 'upload-shared-worker' }
    );

    worker.port.onmessage = (event) => {
      notifyListeners(event.data as SharedWorkerMessage);
    };
    worker.port.start();

    instance = worker;
    return instance;
  } catch {
    return null;
  }
}

/**
 * SharedWorker 메시지 리스너 등록
 * @returns 리스너 해제 함수
 */
export function addSharedWorkerListener(
  listener: SharedWorkerListener
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
