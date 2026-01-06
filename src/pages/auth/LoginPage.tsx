import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Button, SubmitButton } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { API_BASE_URL } from '@/constants/api';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores';

interface LoginFormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const from = (location.state as { from?: Location })?.from?.pathname || '/';

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (apiError) {
      setApiError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '로그인에 실패했습니다');
      }

      const data = await response.json();
      const { user, access_token: accessToken } = data.result;

      // accessToken을 localStorage에 저장 (전역 fetch 인터셉터가 자동으로 헤더에 추가)
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
      }

      // 사용자 정보 저장
      login({
        id: String(user.id),
        email: user.email,
        name: user.name,
      });

      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login failed:', error);
      setApiError(
        error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    login({
      id: '1',
      email: 'user@example.com',
      name: 'Test User',
    });
    navigate(from, { replace: true });
  };

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
        {apiError && (
          <div className="bg-destructive/10 border-destructive text-destructive mb-4 rounded-md border p-3 text-sm">
            {apiError}
          </div>
        )}

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {/* 이메일 */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-foreground text-sm font-medium"
            >
              이메일
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={handleChange}
              className={cn(errors.email && 'border-destructive')}
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-destructive text-sm">{errors.email}</p>
            )}
          </div>

          {/* 비밀번호 */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-foreground text-sm font-medium"
            >
              비밀번호
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="비밀번호를 입력해주세요"
              value={formData.password}
              onChange={handleChange}
              className={cn(errors.password && 'border-destructive')}
              autoComplete="current-password"
            />
            {errors.password && (
              <p className="text-destructive text-sm">{errors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <SubmitButton
            className="mt-6 w-full"
            isPending={isLoading}
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

        {/* Demo Login */}
        <Button
          variant="outline"
          onClick={handleDemoLogin}
          className="w-full"
        >
          데모 계정으로 시작하기
        </Button>
      </div>
    </div>
  );
}
