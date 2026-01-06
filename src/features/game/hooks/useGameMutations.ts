/**
 * Game Mutations
 * - useCreateGameMutation: 게임 생성
 * - useUpdateGameMutation: 게임 수정
 * - useDeleteGameMutation: 게임 삭제
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useToast } from '@/hooks/useToast';
import { useCurrentWorkspaceStore } from '@/stores/useCurrentWorkspaceStore';

import type { PutGameInput } from '../api';
import { deleteGame, postGame, putGame } from '../api';
import type { CreateGameRequest } from '../types';
import { gameKeys } from './useGamesQuery';

/** 게임 생성 mutation */
export function useCreateGameMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { currentWorkspace } = useCurrentWorkspaceStore();

  return useMutation({
    mutationFn: (data: CreateGameRequest) => {
      if (!currentWorkspace) {
        throw new Error('워크스페이스를 선택해주세요.');
      }
      return postGame({
        workspaceUuid: currentWorkspace.workspaceUuid,
        data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gameKeys.all });
      toast({
        variant: 'success',
        title: '게임 생성 완료',
        description: '새 게임이 성공적으로 생성되었습니다.',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: '게임 생성 실패',
        description: error.message,
      });
    },
  });
}

/** 게임 수정 mutation */
export function useUpdateGameMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: PutGameInput) => putGame(input),
    onSuccess: (updatedGame) => {
      queryClient.invalidateQueries({ queryKey: gameKeys.all });
      queryClient.setQueryData(
        gameKeys.detail(updatedGame.gameUuid),
        updatedGame
      );
      toast({
        variant: 'success',
        title: '게임 수정 완료',
        description: '게임 정보가 성공적으로 수정되었습니다.',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: '게임 수정 실패',
        description: error.message,
      });
    },
  });
}

/** 게임 삭제 mutation */
export function useDeleteGameMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (gameUuid: string) => deleteGame(gameUuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gameKeys.all });
      toast({
        variant: 'success',
        title: '게임 삭제 완료',
        description: '게임이 성공적으로 삭제되었습니다.',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: '게임 삭제 실패',
        description: error.message,
      });
    },
  });
}
