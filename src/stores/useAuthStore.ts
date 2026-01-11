import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { useSurveyFormStore } from '@/features/survey-design/store/useSurveyFormStore';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}

interface AuthActions {
  login: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // State
      isAuthenticated: false,
      user: null,
      isLoading: true,

      // Actions
      login: (user) =>
        set({
          isAuthenticated: true,
          user,
          isLoading: false,
        }),

      logout: () => {
        useSurveyFormStore.getState().reset();
        sessionStorage.removeItem('survey-design-storage');
        set({
          isAuthenticated: false,
          user: null,
          isLoading: false,
        });
      },

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        state?.setLoading(false);
      },
    }
  )
);
