import { Building2, Shield } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores';

import { MOCK_USER } from '../types';

interface UserProfileProps {
  isCollapsed: boolean;
}

function UserProfile({ isCollapsed }: UserProfileProps) {
  const { user } = useAuthStore();

  // 스토어에 유저 정보가 없으면 Mock 데이터 사용 (개발 중 편의)
  const displayUser = user
    ? {
        name: user.name,
        email: user.email,
        avatar: user.avatar || MOCK_USER.avatar,
        workspace: MOCK_USER.workspace, // 워크스페이스 정보는 아직 스토어에 없음
      }
    : MOCK_USER;

  return (
    <div
      className={cn(
        'border-sidebar-border bg-sidebar-accent/30 hover:bg-sidebar-accent/50 flex cursor-pointer flex-col gap-3 rounded-xl border p-3 transition-colors',
        isCollapsed && 'items-center p-2'
      )}
    >
      <div
        className={cn(
          'flex items-center gap-3',
          isCollapsed && 'justify-center'
        )}
      >
        <div className="border-sidebar-border relative size-9 shrink-0 overflow-hidden rounded-full border shadow-sm">
          <img
            src={displayUser.avatar}
            alt={displayUser.name}
            className="h-full w-full object-cover"
          />
        </div>
        {!isCollapsed && (
          <div className="flex flex-1 flex-col overflow-hidden">
            <p className="text-sidebar-foreground truncate text-sm font-bold">
              {displayUser.name}
            </p>
            <p className="text-sidebar-foreground/60 truncate text-xs">
              {displayUser.email}
            </p>
          </div>
        )}
      </div>

      {!isCollapsed && (
        <div className="flex flex-col gap-2">
          <div className="bg-sidebar/50 flex items-center gap-2 rounded-lg px-2.5 py-1.5">
            <Building2 className="text-primary size-3.5 stroke-2" />
            <span className="text-sidebar-foreground/80 flex-1 text-xs">
              워크스페이스
            </span>
            <span className="bg-primary/10 text-primary rounded px-1.5 py-0.5 text-xs font-medium">
              {displayUser.workspace.role}
            </span>
            <span className="text-sidebar-foreground/50 text-xs">
              {displayUser.workspace.permission}
            </span>
          </div>
        </div>
      )}

      {isCollapsed && (
        <div className="flex flex-col gap-1">
          <div
            className="bg-primary/10 rounded p-1"
            title={`${displayUser.workspace.role} (${displayUser.workspace.permission})`}
          >
            <Shield className="text-primary size-3.5 stroke-2" />
          </div>
        </div>
      )}
    </div>
  );
}

export default UserProfile;
