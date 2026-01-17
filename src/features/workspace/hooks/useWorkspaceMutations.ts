/**
 * Workspace Mutations
 * - useCreateWorkspaceMutation
 * - useUpdateWorkspaceMutation
 * - useDeleteWorkspaceMutation
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useToast } from '@/hooks/useToast';
import { useCurrentWorkspaceStore } from '@/stores/useCurrentWorkspaceStore';

import {
  deleteWorkspace,
  postWorkspace,
  putWorkspace,
  type PutWorkspaceInput,
} from '../api';
import type { CreateWorkspaceRequest } from '../types';

export const workspaceKeys = {
  all: ['workspaces'] as const,
  lists: () => [...workspaceKeys.all, 'list'] as const,
  detail: (id: string) => [...workspaceKeys.all, 'detail', id] as const,
  members: (id: string) => [...workspaceKeys.detail(id), 'members'] as const,
};

/** 워크스페이스 생성 Mutation */
export function useCreateWorkspaceMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { currentWorkspace, setCurrentWorkspace } = useCurrentWorkspaceStore();

  return useMutation({
    mutationFn: (data: CreateWorkspaceRequest) => postWorkspace(data),
    onSuccess: (newWorkspace) => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
      // 현재 선택된 워크스페이스가 없으면 새로 생성된 워크스페이스를 자동 선택
      if (!currentWorkspace) {
        setCurrentWorkspace(newWorkspace);
      }
      toast({
        variant: 'success',
        title: '워크스페이스 생성 완료',
        description: '새 워크스페이스가 성공적으로 생성되었습니다.',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: '워크스페이스 생성 실패',
        description: error.message,
      });
    },
  });
}

/** 워크스페이스 수정 Mutation */
export function useUpdateWorkspaceMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: PutWorkspaceInput) => putWorkspace(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: workspaceKeys.detail(data.workspaceUuid),
      });
      toast({
        variant: 'success',
        title: '워크스페이스 수정 완료',
        description: '워크스페이스 정보가 성공적으로 수정되었습니다.',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: '워크스페이스 수정 실패',
        description: error.message,
      });
    },
  });
}

/** 워크스페이스 삭제 Mutation */
export function useDeleteWorkspaceMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (workspaceUuid: string) => deleteWorkspace(workspaceUuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
      toast({
        variant: 'success',
        title: '워크스페이스 삭제 완료',
        description: '워크스페이스가 성공적으로 삭제되었습니다.',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: '워크스페이스 삭제 실패',
        description: error.message,
      });
    },
  });
}
