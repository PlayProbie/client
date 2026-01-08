import { useQuery } from '@tanstack/react-query';

import { getWorkspaces } from '../api';
import { workspaceKeys } from './useWorkspaceMutations';

export function useWorkspacesQuery() {
  return useQuery({
    queryKey: workspaceKeys.lists(),
    queryFn: getWorkspaces,
  });
}
