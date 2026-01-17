import { Building2, Settings, Shield } from 'lucide-react';

import type { MemberRole } from '@/features/workspace';
import { useWorkspaceMembers } from '@/features/workspace/hooks';
import { cn } from '@/lib/utils';
import { useAuthStore, useCurrentWorkspaceStore } from '@/stores';

interface UserProfileProps {
  isCollapsed: boolean;
  onSettingsClick?: () => void;
}

function getRoleName(role?: MemberRole): string {
  switch (role) {
    case 'OWNER':
      return '소유자';
    case 'ADMIN':
      return '관리자';
    case 'VIEWER':
      return '뷰어';
    default:
      return '멤버';
  }
}

function UserProfile({ isCollapsed, onSettingsClick }: UserProfileProps) {
  const { user } = useAuthStore();
  const { currentWorkspace } = useCurrentWorkspaceStore();
  const { data: members } = useWorkspaceMembers(
    currentWorkspace?.workspaceUuid || ''
  );

  // 현재 멤버 정보 조회
  const currentMember = members?.result.find(
    (member) => member.userUuid === user?.id
  );

  const displayUser = {
    name: user?.name ?? '',
    email: user?.email ?? '',
    avatar:
      user?.avatar ||
      'https://ui-avatars.com/api/?name=User&background=4F46E5&color=fff',
    workspace: {
      name: currentWorkspace?.name ?? '',
      role: getRoleName(currentMember?.role),
      permission: currentMember?.role ?? 'Member',
    },
  };

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSettingsClick?.();
  };

  return (
    <div
      className={cn(
        'border-sidebar-border bg-sidebar-accent/30 hover:bg-sidebar-accent/50 flex cursor-pointer flex-col gap-3 rounded-xl border p-3 transition-colors',
        isCollapsed && 'items-center p-2'
      )}
      onClick={onSettingsClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSettingsClick?.();
        }
      }}
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
        {!isCollapsed && (
          <button
            type="button"
            onClick={handleSettingsClick}
            className="text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-md p-1.5 transition-colors"
            title="설정"
          >
            <Settings className="size-4" />
          </button>
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
