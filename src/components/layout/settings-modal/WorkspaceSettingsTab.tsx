import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  type CreateWorkspaceRequest,
  useCreateWorkspaceMutation,
  useDeleteWorkspaceMutation,
  useUpdateWorkspaceMutation,
  useWorkspacesQuery,
  type Workspace,
  WorkspaceDeleteModal,
  WorkspaceFormModal,
  WorkspaceList,
} from '@/features/workspace';
import { useCurrentWorkspaceStore } from '@/stores/useCurrentWorkspaceStore';

export function WorkspaceSettingsTab() {
  const { data: workspaces, isLoading, isError } = useWorkspacesQuery();
  const { currentWorkspace, setCurrentWorkspace } = useCurrentWorkspaceStore();

  // 워크스페이스 목록 로드 시 currentWorkspace가 없으면 첫 번째 워크스페이스를 기본값으로 설정
  useEffect(() => {
    if (workspaces && workspaces.length > 0 && !currentWorkspace) {
      setCurrentWorkspace(workspaces[0]);
    }
  }, [workspaces, currentWorkspace, setCurrentWorkspace]);

  // Mutations
  const createMutation = useCreateWorkspaceMutation();
  const updateMutation = useUpdateWorkspaceMutation();
  const deleteMutation = useDeleteWorkspaceMutation();

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Selected Workspace for Edit/Delete
  const [selectedWorkspace, setSelectedWorkspace] = useState<
    Workspace | undefined
  >();
  const [isEditMode, setIsEditMode] = useState(false);

  // Handlers
  const handleOpenCreate = () => {
    setSelectedWorkspace(undefined);
    setIsEditMode(false);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setIsEditMode(true);
    setIsFormModalOpen(true);
  };

  const handleOpenDelete = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setIsDeleteModalOpen(true);
  };

  const handleSubmitForm = (data: CreateWorkspaceRequest) => {
    if (isEditMode && selectedWorkspace) {
      updateMutation.mutate(
        { workspaceUuid: selectedWorkspace.workspaceUuid, data },
        {
          onSuccess: (updatedWorkspace) => {
            setIsFormModalOpen(false);
            // 만약 수정된 워크스페이스가 현재 선택된 워크스페이스라면 스토어 업데이트
            if (
              currentWorkspace?.workspaceUuid === updatedWorkspace.workspaceUuid
            ) {
              setCurrentWorkspace(updatedWorkspace);
            }
          },
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => setIsFormModalOpen(false),
      });
    }
  };

  const handleConfirmDelete = () => {
    if (!selectedWorkspace) return;
    deleteMutation.mutate(selectedWorkspace.workspaceUuid, {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        // 만약 삭제된 워크스페이스가 현재 선택된 워크스페이스라면 스토어 업데이트
        if (
          currentWorkspace?.workspaceUuid === selectedWorkspace.workspaceUuid
        ) {
          // 다른 워크스페이스로 전환 (삭제되지 않은 것 중 첫 번째)
          const nextWorkspace = workspaces?.find(
            (w) => w.workspaceUuid !== selectedWorkspace.workspaceUuid
          );
          // 없으면 null (store에서 null 허용 시) 또는 undefined
          // useCurrentWorkspaceStore 타입에 따라 handled.
          setCurrentWorkspace(nextWorkspace ?? null);
        }
      },
    });
  };

  return (
    <div className="space-y-6 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">워크스페이스 관리</h2>
          <p className="text-muted-foreground text-sm">
            소유한 워크스페이스를 관리하고 전환할 수 있습니다.
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 size-4" />새 워크스페이스
        </Button>
      </div>

      <WorkspaceList
        workspaces={workspaces}
        isLoading={isLoading}
        isError={isError}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />

      <WorkspaceFormModal
        key={
          isFormModalOpen
            ? (selectedWorkspace?.workspaceUuid ?? 'new')
            : 'closed'
        }
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleSubmitForm}
        initialData={isEditMode ? selectedWorkspace : undefined}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <WorkspaceDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        workspaceName={selectedWorkspace?.name}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
