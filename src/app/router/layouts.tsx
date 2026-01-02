import { Outlet } from 'react-router-dom';

import { AuthGuard, GuestGuard } from '@/components/guards';
import { PageLayout } from '@/components/layout';
import { Toaster } from '@/components/ui/Toaster';

/**
 * RootLayout - 전역 레이아웃 (Toast 등 전역 컴포넌트 포함)
 */
export function RootLayout() {
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
}

/**
 * AuthLayout - 인증된 사용자 전용 레이아웃
 */
export function AuthLayout() {
  return (
    <AuthGuard>
      <PageLayout>
        <Outlet />
      </PageLayout>
    </AuthGuard>
  );
}

/**
 * GuestLayout - 비인증 사용자 전용 레이아웃 (로그인 페이지 등)
 */
export function GuestLayout() {
  return (
    <GuestGuard>
      <Outlet />
    </GuestGuard>
  );
}
