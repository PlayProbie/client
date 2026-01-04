/**
 * Streaming Game Mutations
 * - useRegisterStreamingGameMutation: 스트리밍 게임 등록
 * - useUnregisterStreamingGameMutation: 스트리밍 게임 등록 해제
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useToast } from '@/hooks/useToast';

import type { RegisterStreamingGameInput } from '../api';
import { registerStreamingGame, unregisterStreamingGame } from '../api';
import { gameKeys } from './useGamesQuery';

/** Source Games Query Key */
export const sourceGameKeys = {
  all: ['source-games'] as const,
  list: () => [...sourceGameKeys.all, 'list'] as const,
};

/** 스트리밍 게임 등록 mutation */
export function useRegisterStreamingGameMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: RegisterStreamingGameInput) =>
      registerStreamingGame(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gameKeys.all });
      queryClient.invalidateQueries({ queryKey: sourceGameKeys.all });
      toast({
        variant: 'success',
        title: '스트리밍 등록 완료',
        description: '게임이 스트리밍 시스템에 등록되었습니다.',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: '스트리밍 등록 실패',
        description: error.message,
      });
    },
  });
}

/** 스트리밍 게임 등록 해제 mutation */
export function useUnregisterStreamingGameMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (gameUuid: string) => unregisterStreamingGame({ gameUuid }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gameKeys.all });
      queryClient.invalidateQueries({ queryKey: sourceGameKeys.all });
      toast({
        variant: 'success',
        title: '스트리밍 해제 완료',
        description: '게임의 스트리밍 등록이 해제되었습니다.',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: '스트리밍 해제 실패',
        description: error.message,
      });
    },
  });
}

// ----------------------------------------
// Legacy exports (deprecated)
// ----------------------------------------

/** @deprecated Use useRegisterStreamingGameMutation instead */
export const useCreateGameMutation = useRegisterStreamingGameMutation;

/** @deprecated Use useUnregisterStreamingGameMutation instead */
export const useDeleteGameMutation = useUnregisterStreamingGameMutation;
