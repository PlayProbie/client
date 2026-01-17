import { useActionState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Button, SubmitButton } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { API_BASE_URL } from '@/constants/api';
import { useAuthStore } from '@/stores';

interface LoginState {
  success: boolean;
  errors?: {
    email?: string;
    password?: string;
    root?: string;
  };
  defaultValues?: {
    email: string;
  };
}

const initialState: LoginState = {
  success: false,
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  const from = (location.state as { from?: Location })?.from?.pathname || '/';

  const loginAction = async (
    _: LoginState,
    formData: FormData
  ): Promise<LoginState> => {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Validation
    const errors: LoginState['errors'] = {};
    if (!email) {
      errors.email = '이메일을 입력해주세요';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = '올바른 이메일 형식이 아닙니다';
    }

    if (!password) {
      errors.password = '비밀번호를 입력해주세요';
    }

    if (Object.keys(errors).length > 0) {
      return { success: false, errors, defaultValues: { email } };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '로그인에 실패했습니다');
      }

      const responseData = await response.json();
      const { user, access_token: accessToken } = responseData.result;

      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
      }

      login({
        id: String(user.id),
        email: user.email,
        name: user.name,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        errors: {
          root:
            error instanceof Error
              ? error.message
              : '로그인 중 오류가 발생했습니다',
        },
        defaultValues: { email },
      };
    }
  };

  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      navigate(from, { replace: true });
    }
  }, [state.success, navigate, from]);

  const handleRegister = () => {
    navigate('/auth/register');
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
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

        {/* API Error Message */}
        {state.errors?.root && (
          <div className="bg-destructive/10 border-destructive text-destructive mb-4 rounded-md border p-3 text-sm">
            {state.errors.root}
          </div>
        )}

        {/* Login Form */}
        <form
          action={formAction}
          className="space-y-4"
        >
          {/* 이메일 */}
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="example@email.com"
              autoComplete="email"
              defaultValue={state.defaultValues?.email}
            />
            {state.errors?.email && (
              <p className="text-destructive text-sm">{state.errors.email}</p>
            )}
          </div>

          {/* 비밀번호 */}
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="비밀번호를 입력해주세요"
              autoComplete="current-password"
            />
            {state.errors?.password && (
              <p className="text-destructive text-sm">
                {state.errors.password}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <SubmitButton
            className="mt-6 w-full"
            isPending={isPending}
          >
            로그인
          </SubmitButton>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="bg-border h-px flex-1" />
          <span className="text-muted-foreground text-sm">또는</span>
          <div className="bg-border h-px flex-1" />
        </div>

        {/* Google Login */}
        <Button
          disabled
          className="mb-4 w-full"
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
        </Button>

        {/* Register */}
        <Button
          variant="outline"
          onClick={handleRegister}
          className="mb-4 w-full"
        >
          회원가입
        </Button>
      </div>
    </div>
  );
}
