import { create } from 'zustand';

import { TabValue } from '@/components/layout/types';

interface SettingState {
  isSettingsOpen: boolean;
  activeTab: TabValue;
}

interface SettingActions {
  openSettings: () => void;
  closeSettings: () => void;
  toggleSettings: () => void;
  setActiveTab: (tab: TabValue) => void;
}

type SettingStore = SettingState & SettingActions;

export const useSettingStore = create<SettingStore>((set) => ({
  // State
  isSettingsOpen: false,
  activeTab: TabValue.WORKSPACE,

  // Actions
  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),
  toggleSettings: () =>
    set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
