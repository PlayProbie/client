/**
 * Build Mutations
 * - useBuildDeleteMutation: 빌드 삭제
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useToast } from '@/hooks/useToast';

import { deleteBuild } from '../api';
import { buildKeys } from './useBuildsQuery';

/** 빌드 삭제 mutation */
export function useBuildDeleteMutation(gameUuid: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, string>({
    mutationFn: (buildUuid) => deleteBuild({ gameUuid, buildUuid }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: buildKeys.list(gameUuid) });
      toast({
        variant: 'success',
        title: '빌드 삭제 완료',
        description: '선택한 빌드가 삭제되었습니다.',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: '빌드 삭제 실패',
        description: error.message,
      });
    },
  });
}
