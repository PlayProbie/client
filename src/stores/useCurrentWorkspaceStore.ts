/**
 * Current Workspace Store
 * 현재 선택된 워크스페이스를 전역 상태로 관리 (persist)
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { Workspace } from '@/features/workspace/types';

interface CurrentWorkspaceState {
  currentWorkspace: Workspace | null;
  isLoading: boolean;
}

interface CurrentWorkspaceActions {
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  setLoading: (loading: boolean) => void;
  clearCurrentWorkspace: () => void;
}

type CurrentWorkspaceStore = CurrentWorkspaceState & CurrentWorkspaceActions;

export const useCurrentWorkspaceStore = create<CurrentWorkspaceStore>()(
  persist(
    (set) => ({
      // State
      currentWorkspace: null,
      isLoading: false,

      // Actions
      setCurrentWorkspace: (workspace) =>
        set({ currentWorkspace: workspace, isLoading: false }),
      setLoading: (loading) => set({ isLoading: loading }),
      clearCurrentWorkspace: () =>
        set({ currentWorkspace: null, isLoading: false }),
    }),
    {
      name: 'workspace-storage',
      onRehydrateStorage: () => (state) => {
        state?.setLoading(false);
      },
    }
  )
);
