import { Building2, Users } from 'lucide-react';

import { ScrollArea } from '@/components/ui/ScrollArea';
import type { Member, Workspace } from '@/features/workspace';
import { cn } from '@/lib/utils';

interface WorkspaceSidebarProps {
  workspace: Workspace | null;
  members: Member[];
}

/**
 * 게임 목록 페이지에서 표시되는 워크스페이스 정보 사이드바
 * Design System: 
 * - Header: h2 (Semi-bold), muted-foreground description
 * - Spacing: p-4 (space-4)
 * - Icons: Lucide (stroke-2)
 */
export default function WorkspaceSidebar({
  workspace,
  members,
}: WorkspaceSidebarProps) {
  if (!workspace) return null;

  return (
    <aside
      className={cn(
        'border-sidebar-border bg-sidebar flex h-full w-60 shrink-0 flex-col border-r'
      )}
    >
      {/* 워크스페이스 헤더 */}
      <div className="border-sidebar-border border-b p-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
            <Building2 className="size-4 stroke-2" />
          </div>
          <h2 className="text-foreground truncate text-base font-semibold leading-tight tracking-tight">
            {workspace.name}
          </h2>
        </div>
        {workspace.description && (
          <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
            {workspace.description}
          </p>
        )}
      </div>

      {/* 멤버 섹션 헤더 */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-1.5">
          <Users className="text-muted-foreground size-3.5 stroke-2" />
          <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
            Members
          </span>
        </div>
        <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[10px] font-bold">
          {members.length}
        </span>
      </div>

      {/* 멤버 리스트 */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 pb-4">
          {members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-muted-foreground text-xs">멤버가 없습니다.</p>
            </div>
          ) : (
            members.map((member) => (
              <div
                key={member.memberId}
                className="group flex items-center gap-3 rounded-md px-3 py-2 transition-all hover:bg-sidebar-accent/50"
              >
                {/* 아바타 (Design System: Rounded-full, Primary/10 bg) */}
                <div className="bg-background border-sidebar-border relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border shadow-sm">
                   <div className="bg-primary/10 text-primary flex size-full items-center justify-center text-xs font-bold">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sidebar-foreground truncate text-sm font-medium">
                      {member.name}
                    </p>
                    {/* Role Badge (Tiny) */}
                    <span 
                      className={cn(
                        "shrink-0 rounded-[4px] px-1 py-0.5 text-[10px] font-medium leading-none",
                        member.role === 'OWNER' ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      )}
                    >
                      {member.role === 'OWNER' ? 'OWNER' : member.role}
                    </span>
                  </div>
                  <p className="text-muted-foreground truncate text-xs">
                    {member.email}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
