import './index.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

/**
 * 전역 fetch 오버라이드
 * 모든 fetch 요청에 Authorization 헤더 자동 적용 (localStorage 토큰 사용)
 */
const originalFetch = window.fetch;
window.fetch = (input, init) => {
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
