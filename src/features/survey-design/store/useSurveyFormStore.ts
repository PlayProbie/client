import { create } from 'zustand';

import { SURVEY_FORM_STEPS, type SurveyFormData } from '../types';

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

const getToday = () => new Date().toISOString().split('T')[0];

/** 최대 스텝 인덱스 (0부터 시작) */
const MAX_STEP_INDEX = SURVEY_FORM_STEPS.length - 1;

const INITIAL_STATE = {
  currentStep: 0,
  formData: {
    startedAt: getToday(),
    endedAt: getToday(),
    // 신규 필드 초기값
    testStage: undefined,
    themePriorities: [],
    themeDetails: {},
    versionNote: '',
  },
  surveyUrl: null,
};

export const useSurveyFormStore = create<SurveyFormState>()((set) => ({
  ...INITIAL_STATE,

  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, MAX_STEP_INDEX),
    })),

  prevStep: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 0),
    })),

  goToStep: (step) =>
    set({
      currentStep: Math.max(0, Math.min(step, MAX_STEP_INDEX)),
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
}));

