import { useActionState, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, SubmitButton } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { API_BASE_URL } from '@/constants/api';

interface RegisterState {
  success: boolean;
  errors?: {
    email?: string;
    password?: string;
    passwordConfirm?: string;
    name?: string;
    root?: string;
  };
  defaultValues?: {
    email: string;
    name: string;
    phone: string;
  };
}

const initialState: RegisterState = {
  success: false,
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [phoneValue, setPhoneValue] = useState('');

  // 전화번호 포맷팅 (010-1234-1234)
  const formatPhoneNumber = (value: string): string => {
    // 숫자만 추출
    const numbers = value.replace(/\D/g, '');

    // 최대 11자리까지만 허용
    const limited = numbers.slice(0, 11);

    // 포맷 적용
    if (limited.length <= 3) {
      return limited;
    } else if (limited.length <= 7) {
      return `${limited.slice(0, 3)}-${limited.slice(3)}`;
    } else {
      return `${limited.slice(0, 3)}-${limited.slice(3, 7)}-${limited.slice(7)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneValue(formatted);
  };

  const registerAction = async (
    _: RegisterState,
    formData: FormData
  ): Promise<RegisterState> => {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const passwordConfirm = formData.get('passwordConfirm') as string;
    const name = formData.get('name') as string;
    // phone은 controlled input이지만 formData에도 포함됨 (name="phone")
    const phone = formData.get('phone') as string;

    // Validation
    const errors: RegisterState['errors'] = {};

    // 이메일 검증
    if (!email) {
      errors.email = '이메일을 입력해주세요';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = '올바른 이메일 형식이 아닙니다';
    }

    // 비밀번호 검증
    if (!password) {
      errors.password = '비밀번호를 입력해주세요';
    } else if (password.length < 8) {
      errors.password = '비밀번호는 8자 이상이어야 합니다';
    }

    // 비밀번호 확인 검증
    if (!passwordConfirm) {
      errors.passwordConfirm = '비밀번호 확인을 입력해주세요';
    } else if (password !== passwordConfirm) {
      errors.passwordConfirm = '비밀번호가 일치하지 않습니다';
    }

    // 이름 검증
    if (!name) {
      errors.name = '이름을 입력해주세요';
    }

    if (Object.keys(errors).length > 0) {
      return {
        success: false,
        errors,
        defaultValues: { email, name, phone },
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
          phone: phone || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // 이메일 중복 에러 (code: U002)
        if (errorData.code === 'U002') {
          return {
            success: false,
            errors: { email: errorData.message },
            defaultValues: { email, name, phone },
          };
        }

        throw new Error(errorData.message || '회원가입에 실패했습니다');
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        errors: {
          root:
            error instanceof Error
              ? error.message
              : '회원가입 중 오류가 발생했습니다',
        },
        defaultValues: { email, name, phone },
      };
    }
  };

  const [state, formAction, isPending] = useActionState(
    registerAction,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      navigate('/login', { state: { registered: true } });
    }
  }, [state.success, navigate]);

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="bg-surface border-border w-full max-w-md rounded-2xl border p-8 shadow-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <img
            src="/logo.png"
            alt="PlayProbie"
            className="mx-auto mb-4 h-12 w-auto"
          />
          <h1 className="text-foreground text-2xl font-bold">회원가입</h1>
          <p className="text-muted-foreground mt-2">
            PlayProbie에 오신 것을 환영합니다
          </p>
        </div>

        {/* API Error Message */}
        {state.errors?.root && (
          <div className="bg-destructive/10 border-destructive text-destructive mb-4 rounded-md border p-3 text-sm">
            {state.errors.root}
          </div>
        )}

        {/* Form */}
        <form
          action={formAction}
          className="space-y-4"
        >
          {/* 이메일 */}
          <div className="space-y-2">
            <Label
              htmlFor="email"
              required
            >
              이메일
            </Label>
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
            <Label
              htmlFor="password"
              required
            >
              비밀번호
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="8자 이상 입력해주세요"
              autoComplete="new-password"
            />
            {state.errors?.password && (
              <p className="text-destructive text-sm">
                {state.errors.password}
              </p>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div className="space-y-2">
            <Label
              htmlFor="passwordConfirm"
              required
            >
              비밀번호 확인
            </Label>
            <Input
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              placeholder="비밀번호를 다시 입력해주세요"
              autoComplete="new-password"
            />
            {state.errors?.passwordConfirm && (
              <p className="text-destructive text-sm">
                {state.errors.passwordConfirm}
              </p>
            )}
          </div>

          {/* 이름 */}
          <div className="space-y-2">
            <Label
              htmlFor="name"
              required
            >
              이름
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="이름을 입력해주세요"
              autoComplete="name"
              defaultValue={state.defaultValues?.name}
            />
            {state.errors?.name && (
              <p className="text-destructive text-sm">{state.errors.name}</p>
            )}
          </div>

          {/* 전화번호 (선택) */}
          <div className="space-y-2">
            <Label htmlFor="phone">전화번호</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="010-0000-0000"
              autoComplete="tel"
              value={phoneValue}
              onChange={handlePhoneChange}
            />
          </div>

          {/* Submit Button */}
          <SubmitButton
            className="mt-6 w-full"
            isPending={isPending}
          >
            가입하기
          </SubmitButton>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="bg-border h-px flex-1" />
          <span className="text-muted-foreground text-sm">또는</span>
          <div className="bg-border h-px flex-1" />
        </div>

        {/* Back to Login */}
        <Button
          variant="outline"
          onClick={handleBackToLogin}
          className="w-full"
        >
          로그인 페이지로 돌아가기
        </Button>
      </div>
    </div>
  );
}
