import { Edit, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/loading';
import { formatDate } from '@/lib/utils';
import { useCurrentWorkspaceStore } from '@/stores/useCurrentWorkspaceStore';

import type { Workspace } from '../types';

interface WorkspaceListProps {
  workspaces: Workspace[] | undefined;
  isLoading: boolean;
  onEdit: (workspace: Workspace) => void;

  onDelete: (workspace: Workspace) => void;
  isError: boolean;
}

export function WorkspaceList({
  workspaces,
  isLoading,
  onEdit,
  onDelete,
  isError,
}: WorkspaceListProps) {
  const { currentWorkspace, setCurrentWorkspace } = useCurrentWorkspaceStore();

  if (isError) {
    return (
      <div className="py-8 text-center">
        <p className="text-destructive mb-1 font-medium">
          워크스페이스 목록을 불러오지 못했습니다.
        </p>
        <p className="text-muted-foreground text-sm">
          잠시 후 다시 시도해주세요.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-60" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="size-8" />
              <Skeleton className="size-8" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!workspaces || workspaces.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">생성된 워크스페이스가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {workspaces.map((workspace) => {
        const isCurrent =
          currentWorkspace?.workspaceUuid === workspace.workspaceUuid;

        return (
          <div
            key={workspace.workspaceUuid}
            className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${
              isCurrent ? 'bg-primary/5 border-primary/50' : 'hover:bg-muted/50'
            }`}
          >
            <div
              className="cursor-pointer"
              onClick={() => setCurrentWorkspace(workspace)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setCurrentWorkspace(workspace);
                }
              }}
            >
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{workspace.name}</h3>
                {isCurrent && (
                  <span className="bg-primary/10 text-primary rounded px-2 py-0.5 text-xs">
                    Current
                  </span>
                )}
              </div>
              <p className="text-muted-foreground mt-1 text-sm">
                {workspace.description || '설명 없음'}
              </p>
              <div className="text-muted-foreground mt-2 flex items-center gap-4 text-xs">
                <span>게임 {workspace.gameCount}개</span>
                <span>생성일: {formatDate(workspace.createdAt)}</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(workspace)}
                title="수정"
              >
                <Edit className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => onDelete(workspace)}
                title="삭제"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
