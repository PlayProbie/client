/**
 * Current Game Store
 * 현재 선택된 게임의 상세 정보를 전역 상태로 관리
 */
import { create } from 'zustand';

import type { Game } from '@/features/game/types';

interface CurrentGameState {
  currentGame: Game | null;
  isLoading: boolean;
}

interface CurrentGameActions {
  setCurrentGame: (game: Game | null) => void;
  setLoading: (loading: boolean) => void;
  clearCurrentGame: () => void;
}

type CurrentGameStore = CurrentGameState & CurrentGameActions;

export const useCurrentGameStore = create<CurrentGameStore>((set) => ({
  // State
  currentGame: null,
  isLoading: false,

  // Actions
  setCurrentGame: (game) => set({ currentGame: game, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
  clearCurrentGame: () => set({ currentGame: null, isLoading: false }),
}));
