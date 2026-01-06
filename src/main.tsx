import './index.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

/**
 * 전역 fetch 오버라이드
 * 모든 fetch 요청에 Authorization 헤더 자동 적용 (localStorage 토큰 사용)
 * AWS 관련 요청(S3, GameLift Streams 등)은 자체 서명을 사용하므로 완전히 제외
 */
const originalFetch = window.fetch;
window.fetch = (input, init) => {
  // AWS 요청 여부 확인 (S3, GameLift Streams 등)
  const url =
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.href
        : input.url;
  const isAwsRequest =
    url.includes('.amazonaws.com') ||
    url.includes('.s3.') ||
    url.includes('gamelift');

  // AWS 요청은 원본 그대로 통과 (SDK 서명 헤더 보존)
  if (isAwsRequest) {
    return originalFetch(input, init);
  }

  // 일반 API 요청에만 Bearer 토큰 추가
  const token = localStorage.getItem('accessToken');
  const headers = new Headers(init?.headers);

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return originalFetch(input, {
    ...init,
    headers,
  });
};

import { router } from '@/app/router';

/**
 * 개발 환경에서 MSW 모킹 활성화
 */
async function enableMocking() {
  if (import.meta.env.DEV && import.meta.env.VITE_MSW_ENABLED == 'true') {
    const { setupMswWorker } = await import('./lib/msw');
    await setupMswWorker();
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5분
      retry: 1,
    },
  },
});

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>
  );
});
