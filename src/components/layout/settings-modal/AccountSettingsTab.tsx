import { LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { MOCK_USER } from '@/components/layout/types';
import { Button } from '@/components/ui';
import { postLogout } from '@/features/auth';
import { useAuthStore } from '@/stores';

/**
 * AccountSettingsTab - 계정 설정 탭
 * - 프로필 정보 표시
 * - 이메일/비밀번호 변경 링크
 * - 로그아웃 기능
 */
function AccountSettingsTab() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // 서버에 로그아웃 요청 + localStorage 정리
      await postLogout();
      // Zustand 상태 초기화
      logout();
      // 로그인 페이지로 이동
      navigate('/login', { replace: true });
    } catch {
      // 에러가 발생해도 클라이언트 측 정리는 postLogout에서 수행됨
      logout();
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 프로필 정보 */}
      <div className="flex items-center gap-4">
        <div className="border-border relative size-16 shrink-0 overflow-hidden rounded-full border-2 shadow-sm">
          <img
            src={MOCK_USER.avatar}
            alt={MOCK_USER.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex flex-col">
          <p className="text-foreground text-lg font-semibold">
            {MOCK_USER.name}
          </p>
          <p className="text-muted-foreground text-sm">{MOCK_USER.email}</p>
        </div>
      </div>

      {/* 구분선 */}
      <div className="bg-border h-px" />

      {/* 계정 정보 수정 섹션 */}
      <div className="flex flex-col gap-4">
        <h3 className="text-foreground text-sm font-medium">계정 정보</h3>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="text-muted-foreground size-4" />
            <span className="text-foreground/80 text-sm">이메일 변경</span>
          </div>
          <Button
            variant="outline"
            size="sm"
          >
            변경
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="text-muted-foreground size-4" />
            <span className="text-foreground/80 text-sm">비밀번호 변경</span>
          </div>
          <Button
            variant="outline"
            size="sm"
          >
            변경
          </Button>
        </div>
      </div>

      {/* 구분선 */}
      <div className="bg-border h-px" />

      {/* 로그아웃 */}
      <Button
        variant="destructive"
        className="w-full gap-2"
        onClick={handleLogout}
        disabled={isLoggingOut}
      >
        <LogOut className="size-4" />
        {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
      </Button>
    </div>
  );
}

export default AccountSettingsTab;
