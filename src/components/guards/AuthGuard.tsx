import { Navigate, useLocation } from 'react-router-dom';

import { PageSpinner } from '@/components/ui';
import { useAuthStore } from '@/stores';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * AuthGuard - 인증된 사용자만 접근 가능한 경로를 보호합니다.
 * 미인증 사용자는 /login으로 리다이렉트됩니다.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  // 인증 상태 로딩 중
  if (isLoading) {
    return <PageSpinner />;
  }

  // 미인증 시 로그인 페이지로 리다이렉트 (원래 경로 저장)
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  return <>{children}</>;
}
