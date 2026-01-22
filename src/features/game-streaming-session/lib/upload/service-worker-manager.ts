/**
 * Service Worker Manager
 *
 * Service Worker 등록 및 Background Sync 트리거 관리.
 * 페이지가 닫혀도 업로드가 완료될 수 있도록 합니다.
 */

import { getSharedWorker } from './shared-worker-manager';

/**
 * Service Worker 등록
 * @param apiUrl API 베이스 URL
 * @returns 등록된 ServiceWorkerRegistration 또는 null
 */
export async function registerServiceWorker(
  apiUrl: string
): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const swPath = `/upload-sw.js?apiUrl=${encodeURIComponent(apiUrl)}`;
    const registration = await navigator.serviceWorker.register(swPath);
    return registration;
  } catch {
    return null;
  }
}

/**
 * Background Sync 트리거
 * SyncManager가 지원되면 sync 이벤트 등록, 아니면 직접 메시지 전송
 */
export async function triggerBackgroundSync(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  const registration = await navigator.serviceWorker.ready;

  if ('sync' in registration && 'SyncManager' in window) {
    try {
      const syncRegistration = registration as ServiceWorkerRegistration & {
        sync: { register: (tag: string) => Promise<void> };
      };
      await syncRegistration.sync.register('upload-segments');
      return;
    } catch {
      // fall back to direct message
    }
  }

  registration.active?.postMessage({ type: 'PROCESS_UPLOADS' });
}

/**
 * Shared Worker 또는 Service Worker로 업로드 처리 요청
 * SharedWorker가 있으면 우선 사용, 없으면 Background Sync 트리거
 */
export function triggerSharedOrServiceWorkerUpload(): void {
  const sharedWorker = getSharedWorker();
  if (sharedWorker) {
    sharedWorker.port.postMessage({ type: 'PROCESS_UPLOADS' });
    return;
  }

  triggerBackgroundSync().catch(() => {
    // ignore background trigger errors
  });
}
