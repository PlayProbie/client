import { Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  type Member,
  MemberInviteModal,
  MemberList,
  useInviteMemberMutation,
  useRemoveMemberMutation,
  useWorkspaceMembers,
} from '@/features/workspace';
import { useCurrentWorkspaceStore } from '@/stores/useCurrentWorkspaceStore';

export function TeamSettingsTab() {
  const { currentWorkspace } = useCurrentWorkspaceStore();
  const workspaceUuid = currentWorkspace?.workspaceUuid;

  const {
    data: members,
    isLoading,
    isError,
  } = useWorkspaceMembers(workspaceUuid || '');
  const inviteMutation = useInviteMemberMutation();
  const removeMutation = useRemoveMemberMutation();

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const handleInvite = (email: string) => {
    if (!workspaceUuid) return;
    inviteMutation.mutate(
      { workspaceUuid, data: { email } },
      {
        onSuccess: () => setIsInviteModalOpen(false),
      }
    );
  };

  const handleRemove = (member: Member) => {
    if (!workspaceUuid) return;
    if (confirm(`'${member.name}'님을 팀에서 내보내시겠습니까?`)) {
      removeMutation.mutate({ workspaceUuid, userId: member.memberId });
    }
  };

  if (!workspaceUuid) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">워크스페이스를 선택해주세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">팀 관리</h2>
          <p className="text-muted-foreground text-sm">
            현재 워크스페이스({currentWorkspace.name})의 멤버를 관리합니다.
          </p>
        </div>
        <Button onClick={() => setIsInviteModalOpen(true)}>
          <Plus className="mr-2 size-4" />
          멤버 초대
        </Button>
      </div>

      <MemberList
        members={members}
        isLoading={isLoading}
        isError={isError}
        onRemove={handleRemove}
        isRemoving={removeMutation.isPending}
      />

      <MemberInviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSubmit={handleInvite}
        isSubmitting={inviteMutation.isPending}
      />
    </div>
  );
}
