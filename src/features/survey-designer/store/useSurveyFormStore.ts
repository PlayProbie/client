import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { type SurveyFormData } from '../types';

type SurveyFormState = {
  // 현재 스텝 인덱스
  currentStep: number;

  // 폼 데이터 임시 저장
  formData: Partial<SurveyFormData>;

  // 생성된 설문 URL
  surveyUrl: string | null;

  // 액션
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  updateFormData: (data: Partial<SurveyFormData>) => void;
  setSurveyUrl: (url: string) => void;
  reset: () => void;
};

const INITIAL_STATE = {
  currentStep: 0,
  formData: {},
  surveyUrl: null,
};

export const useSurveyFormStore = create<SurveyFormState>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,

      nextStep: () =>
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, 4),
        })),

      prevStep: () =>
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 0),
        })),

      goToStep: (step) =>
        set({
          currentStep: Math.max(0, Math.min(step, 4)),
        }),

      updateFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
        })),

      setSurveyUrl: (url) =>
        set({
          surveyUrl: url,
        }),

      reset: () => set(INITIAL_STATE),
    }),
    {
      name: 'survey-form-storage', // localStorage 키
    }
  )
);
