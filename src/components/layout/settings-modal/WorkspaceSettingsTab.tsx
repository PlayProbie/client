import { useEffect, useState } from 'react';

import { Button, InlineAlert } from '@/components/ui';
import { Spinner } from '@/components/ui/loading';
import type { Workspace } from '@/features/workspace';
import { getWorkspaces } from '@/features/workspace';
import { useToast } from '@/hooks/useToast';
import { useCurrentWorkspaceStore } from '@/stores/useCurrentWorkspaceStore';

import {
  WorkspaceCreateButton,
  WorkspaceCreateForm,
} from './WorkspaceCreateForm';
import WorkspaceListItem from './WorkspaceListItem';

/**
 * WorkspaceSettingsTab - 워크스페이스 관리 탭
 * - 워크스페이스 목록 표시
 * - 워크스페이스 선택 기능
 * - 워크스페이스 생성 폼
 */
function WorkspaceSettingsTab() {
  const { currentWorkspace, setCurrentWorkspace } = useCurrentWorkspaceStore();
  const { toast } = useToast();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // 워크스페이스 목록 조회
  useEffect(() => {
    async function fetchWorkspaces() {
      try {
        setIsLoading(true);
        const data = await getWorkspaces();
        setWorkspaces(data);

        // 현재 선택된 워크스페이스가 없으면 첫 번째 워크스페이스 선택
        if (!currentWorkspace && data.length > 0) {
          setCurrentWorkspace(data[0]);
        }
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : '워크스페이스를 불러오는데 실패했습니다.';
        setError(message);

        toast({
          variant: 'destructive',
          title: '워크스페이스 목록 조회 실패',
          description: message,
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchWorkspaces();
  }, [currentWorkspace, setCurrentWorkspace, toast]);

  // 워크스페이스 선택 핸들러
  const handleSelectWorkspace = (workspace: Workspace) => {
    setCurrentWorkspace(workspace);
    toast({
      variant: 'success',
      title: '워크스페이스 선택',
      description: `"${workspace.name}" 워크스페이스로 전환되었습니다.`,
    });
  };

  // 워크스페이스 생성 완료 핸들러
  const handleCreateComplete = (created: Workspace) => {
    setWorkspaces((prev) => [...prev, created]);
    setCurrentWorkspace(created);
    setIsCreating(false);
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-12">
        <Spinner size="md" />
        <span className="text-muted-foreground text-sm">
          워크스페이스 불러오는 중...
        </span>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <InlineAlert
          variant="error"
          title="오류"
        >
          {error}
        </InlineAlert>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
        >
          다시 시도
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pt-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="text-foreground text-sm font-medium">
          워크스페이스 목록
        </h3>
        <WorkspaceCreateButton onClick={() => setIsCreating(!isCreating)} />
      </div>

      {/* 생성 폼 */}
      {isCreating && (
        <WorkspaceCreateForm
          onCreated={handleCreateComplete}
          onCancel={() => setIsCreating(false)}
        />
      )}

      {/* 워크스페이스 목록 */}
      <div className="flex flex-col gap-2">
        {workspaces.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            워크스페이스가 없습니다. 새로 만들어보세요.
          </p>
        ) : (
          workspaces.map((workspace) => (
            <WorkspaceListItem
              key={workspace.workspaceUuid}
              workspace={workspace}
              isSelected={
                currentWorkspace?.workspaceUuid === workspace.workspaceUuid
              }
              onSelect={handleSelectWorkspace}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default WorkspaceSettingsTab;
