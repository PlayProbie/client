import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      // MSW 활성화 시 proxy를 비활성화하여 Service Worker가 요청을 가로채도록 함
      proxy:
        env.VITE_MSW_ENABLED === 'true'
          ? undefined
          : {
              '/api': {
                target: env.VITE_API_BASE_URL || 'http://localhost:8080',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ''),
                secure: false,
              },
            },
    },
  };
});
