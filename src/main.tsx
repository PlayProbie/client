import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.tsx';

/**
 * 개발 환경에서 MSW 모킹 활성화
 */
async function enableMocking() {
  if (import.meta.env.DEV && import.meta.env.VITE_MSW_ENABLED == 'true') {
    const { setupMswWorker } = await import('./lib/msw');
    await setupMswWorker();
  }
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
