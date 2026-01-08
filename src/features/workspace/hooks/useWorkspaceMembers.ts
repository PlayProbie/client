import { useQuery } from '@tanstack/react-query';

import { getMembers } from '../api';
import { workspaceKeys } from './useWorkspaceMutations';

/**
 * 워크스페이스 멤버 목록 조회 Hook
 */
export function useWorkspaceMembers(workspaceUuid: string) {
  return useQuery({
    queryKey: workspaceKeys.members(workspaceUuid),
    queryFn: () => getMembers(workspaceUuid),
    enabled: !!workspaceUuid,
  });
}
