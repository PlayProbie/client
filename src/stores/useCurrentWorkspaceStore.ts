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

/** Demo Workspace (MockDataLoader에서 생성된 고정 UUID) */
const DEMO_WORKSPACE: Workspace = {
  workspaceUuid: '00000000-0000-0000-0000-000000000000',
  name: 'Demo Workspace',
  profileImageUrl: '',
  description: 'Mock 데이터용 데모 워크스페이스',
  gameCount: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const useCurrentWorkspaceStore = create<CurrentWorkspaceStore>()(
  persist(
    (set) => ({
      // State - Demo Workspace로 초기화
      currentWorkspace: DEMO_WORKSPACE,
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
        // 워크스페이스가 없으면 Demo Workspace 설정
        if (!state?.currentWorkspace) {
          state?.setCurrentWorkspace(DEMO_WORKSPACE);
        }
      },
    }
  )
);
