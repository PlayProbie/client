import { useLocation, useNavigate } from 'react-router-dom';

import { useAuthStore } from '@/stores';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  const from = (location.state as { from?: Location })?.from?.pathname || '/';

  const handleLogin = () => {
    // 임시 로그인 (추후 OAuth 연동)
    login({
      id: '1',
      email: 'user@example.com',
      name: 'Test User',
    });
    navigate(from, { replace: true });
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <div className="bg-surface border-border w-full max-w-md rounded-2xl border p-8 shadow-lg">
        {/* Logo */}
        <div className="mb-8 text-center">
          <img
            src="/logo.png"
            alt="PlayProbie"
            className="mx-auto mb-4 h-12 w-auto"
          />
          <h1 className="text-foreground text-2xl font-bold">PlayProbie</h1>
          <p className="text-muted-foreground mt-2">
            게임 플레이테스트 설문 플랫폼
          </p>
        </div>

        {/* Login Button */}
        <button
          disabled
          onClick={handleLogin}
          className="bg-muted text-muted-foreground flex w-full items-center justify-center gap-3 rounded-lg px-4 py-3 font-medium transition-colors"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google로 계속하기
        </button>

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="bg-border h-px flex-1" />
          <span className="text-muted-foreground text-sm">또는</span>
          <div className="bg-border h-px flex-1" />
        </div>

        {/* Demo Login */}
        <button
          onClick={handleLogin}
          className="border-border text-foreground hover:bg-muted w-full rounded-lg border px-4 py-3 font-medium transition-colors"
        >
          데모 계정으로 시작하기
        </button>
      </div>
    </div>
  );
}
