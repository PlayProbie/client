/**
 * MSW (Mock Service Worker) 모듈
 * 개발 환경에서 API 요청을 모킹합니다.
 */

export { worker } from './browser';
export { handlers } from './handlers';

/**
 * MSW 워커 시작
 * 개발 환경에서만 호출됩니다.
 */
export async function setupMswWorker() {
  const { worker } = await import('./browser');

  return worker.start({
    onUnhandledRequest: 'bypass', // 핸들러가 없는 요청은 통과
  });
}
