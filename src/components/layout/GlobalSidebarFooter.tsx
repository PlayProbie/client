/**
 * GlobalSidebarFooter
 *
 * IconBar + GameSidebar 전체 너비를 차지하는 하단 유저 프로필 영역
 * 기존 SidebarFooter의 유저 프로필 부분을 재사용
 */

import { Building2, Settings } from 'lucide-react';

import type { MemberRole } from '@/features/workspace';
import { useWorkspaceMembers } from '@/features/workspace/hooks';
import { cn } from '@/lib/utils';
import { useAuthStore, useCurrentWorkspaceStore, useSettingStore } from '@/stores';

import SettingsModal from './settings-modal/SettingsModal';

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

interface GlobalSidebarFooterProps {
  /** GameSidebar가 표시되는지 여부 (너비 조정용) */
  hasGameSidebar: boolean;
}

function GlobalSidebarFooter({ hasGameSidebar }: GlobalSidebarFooterProps) {
  const { user } = useAuthStore();
  const { currentWorkspace } = useCurrentWorkspaceStore();
  const { openSettings } = useSettingStore();
  const { data: members } = useWorkspaceMembers(
    currentWorkspace?.workspaceUuid || ''
  );

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
    },
  };

  return (
    <>
      <div
        className={cn(
          'border-sidebar-border bg-sidebar shrink-0 border-r border-t',
          hasGameSidebar ? 'w-[312px]' : 'w-[72px]' // 72px (IconBar) + 240px (GameSidebar)
        )}
      >
        <div
          className={cn(
            'flex cursor-pointer items-center gap-3 p-3 transition-colors',
            'hover:bg-sidebar-accent/50'
          )}
          onClick={openSettings}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              openSettings();
            }
          }}
        >
          {/* 아바타 */}
          <div className="border-sidebar-border relative size-10 shrink-0 overflow-hidden rounded-full border shadow-sm">
            <img
              src={displayUser.avatar}
              alt={displayUser.name}
              className="size-full object-cover"
            />
          </div>

          {/* 유저 정보 (GameSidebar 있을 때만) */}
          {hasGameSidebar && (
            <>
              <div className="flex flex-1 flex-col overflow-hidden">
                <p className="text-sidebar-foreground truncate text-sm font-bold">
                  {displayUser.name}
                </p>
                <p className="text-sidebar-foreground/60 truncate text-xs">
                  {displayUser.email}
                </p>
              </div>

              {/* 설정 버튼 */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openSettings();
                }}
                className="text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-md p-1.5 transition-colors"
                title="설정"
              >
                <Settings className="size-4" />
              </button>
            </>
          )}
        </div>

        {/* 워크스페이스 정보 (GameSidebar 있을 때만) */}
        {hasGameSidebar && (
          <div className="px-3 pb-3">
            <div className="bg-sidebar/50 flex items-center gap-2 rounded-lg px-2.5 py-1.5">
              <Building2 className="text-primary size-3.5 stroke-2" />
              <span className="text-sidebar-foreground/80 flex-1 truncate text-xs">
                {displayUser.workspace.name || '워크스페이스'}
              </span>
              <span className="bg-primary/10 text-primary rounded px-1.5 py-0.5 text-xs font-medium">
                {displayUser.workspace.role}
              </span>
            </div>
          </div>
        )}
      </div>

      <SettingsModal />
    </>
  );
}

export default GlobalSidebarFooter;
