/**
 * Member Mutations
 * - useInviteMemberMutation
 * - useRemoveMemberMutation
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useToast } from '@/hooks/useToast';

import { deleteMember, postMember, type PostMemberInput } from '../api';
import { workspaceKeys } from './useWorkspaceMutations';

export function useInviteMemberMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: PostMemberInput) => postMember(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: workspaceKeys.members(variables.workspaceUuid),
      });
      toast({
        variant: 'success',
        title: '멤버 초대 완료',
        description: '새 멤버가 성공적으로 초대되었습니다.',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: '멤버 초대 실패',
        description: error.message,
      });
    },
  });
}

export function useRemoveMemberMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      workspaceUuid,
      userId,
    }: {
      workspaceUuid: string;
      userId: number;
    }) => deleteMember(workspaceUuid, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: workspaceKeys.members(variables.workspaceUuid),
      });
      toast({
        variant: 'success',
        title: '멤버 내보내기 완료',
        description: '멤버가 성공적으로 삭제되었습니다.',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: '멤버 내보내기 실패',
        description: error.message,
      });
    },
  });
}
