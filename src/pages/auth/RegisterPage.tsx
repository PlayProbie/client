import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, SubmitButton } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { API_BASE_URL } from '@/constants/api';
import { cn } from '@/lib/utils';

interface RegisterFormData {
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
  phone: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  passwordConfirm?: string;
  name?: string;
  phone?: string;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    passwordConfirm: '',
    name: '',
    phone: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // 이메일 검증
    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }

    // 비밀번호 검증
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
    } else if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다';
    }

    // 비밀번호 확인 검증
    if (!formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호 확인을 입력해주세요';
    } else if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다';
    }

    // 이름 검증
    if (!formData.name) {
      newErrors.name = '이름을 입력해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // 전화번호 필드는 포맷팅 적용
    const formattedValue = name === 'phone' ? formatPhoneNumber(value) : value;
    
    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    // 입력 시 해당 필드 에러 및 API 에러 제거
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
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
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // 이메일 중복 에러 (code: U002)
        if (errorData.code === 'U002') {
          setErrors(prev => ({ ...prev, email: errorData.message }));
          return;
        }
        
        throw new Error(errorData.message || '회원가입에 실패했습니다');
      }

      // 성공 시 로그인 페이지로 이동
      navigate('/login', { state: { registered: true } });
    } catch (error) {
      console.error('Registration failed:', error);
      setApiError(error instanceof Error ? error.message : '회원가입 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

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
        {apiError && (
          <div className="bg-destructive/10 border-destructive text-destructive mb-4 rounded-md border p-3 text-sm">
            {apiError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 이메일 */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-foreground text-sm font-medium">
              이메일 <span className="text-destructive">*</span>
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
            <label htmlFor="password" className="text-foreground text-sm font-medium">
              비밀번호 <span className="text-destructive">*</span>
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="8자 이상 입력해주세요"
              value={formData.password}
              onChange={handleChange}
              className={cn(errors.password && 'border-destructive')}
              autoComplete="new-password"
            />
            {errors.password && (
              <p className="text-destructive text-sm">{errors.password}</p>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div className="space-y-2">
            <label htmlFor="passwordConfirm" className="text-foreground text-sm font-medium">
              비밀번호 확인 <span className="text-destructive">*</span>
            </label>
            <Input
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              placeholder="비밀번호를 다시 입력해주세요"
              value={formData.passwordConfirm}
              onChange={handleChange}
              className={cn(errors.passwordConfirm && 'border-destructive')}
              autoComplete="new-password"
            />
            {errors.passwordConfirm && (
              <p className="text-destructive text-sm">{errors.passwordConfirm}</p>
            )}
          </div>

          {/* 이름 */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-foreground text-sm font-medium">
              이름 <span className="text-destructive">*</span>
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="이름을 입력해주세요"
              value={formData.name}
              onChange={handleChange}
              className={cn(errors.name && 'border-destructive')}
              autoComplete="name"
            />
            {errors.name && (
              <p className="text-destructive text-sm">{errors.name}</p>
            )}
          </div>

          {/* 전화번호 (선택) */}
          <div className="space-y-2">
            <label htmlFor="phone" className="text-foreground text-sm font-medium">
              전화번호 <span className="text-muted-foreground text-xs">(선택)</span>
            </label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="010-0000-0000"
              value={formData.phone}
              onChange={handleChange}
              autoComplete="tel"
            />
          </div>

          {/* Submit Button */}
          <SubmitButton
            className="mt-6 w-full"
            isPending={isLoading}
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
