import { useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { postAiQuestions } from '../api';
import { useSurveyFormStore } from '../store/useSurveyFormStore';
import type {
  ApiGenerateAiQuestionsRequest,
  SurveyFormData,
  ThemeCategory,
} from '../types';
import { useQuestionManager } from './useQuestionManager';

/** 기본 AI 질문 생성 개수 */
const DEFAULT_QUESTION_COUNT = 3;

/**
 * AI 질문 생성 및 관리 훅
 * - 페이지 렌더링 시 POST /surveys/ai-questions API 호출
 * - useQuestionManager를 통해 공통 질문 관리 로직 재사용
 */
function useQuestionGenerate() {
  const { formData, updateFormData } = useSurveyFormStore();
  const { setValue } = useFormContext<SurveyFormData>();


  // 공통 질문 관리 로직
  const manager = useQuestionManager();

  // 추가 상태
  const initialGenerateRef = useRef(false);
  const [isLocalGenerating, setIsLocalGenerating] = useState(false);

  // AI 질문 생성 mutation
  const {
    mutateAsync: generateMutateAsync,
    isPending: isMutationPending,
    error: generateError,
  } = useMutation({
    mutationFn: async (
      params: Pick<ApiGenerateAiQuestionsRequest, 'count'>
    ) => {
      const {
        gameName,
        gameGenre,
        gameContext,
        surveyName,
        themePriorities,
        themeDetails,
      } = formData;

      // themeDetails에서 themePriorities에 있는 카테고리만 포함
      const cleanedThemeDetails =
        themeDetails && themePriorities
          ? Object.fromEntries(
              Object.entries(themeDetails).filter(([key]) =>
                themePriorities.includes(key as ThemeCategory)
              )
            )
          : undefined;

      return postAiQuestions({
        game_name: gameName || '',
        game_context: gameContext || '',
        game_genre: gameGenre || [],
        survey_name: surveyName || '',
        theme_priorities: themePriorities || [],
        theme_details: cleanedThemeDetails,
        count: params.count,
      });
    },
    onSettled: () => {
      setIsLocalGenerating(false);
    },
  });

  // AI 질문 생성 API 호출
  const generateQuestions = useCallback(async () => {
    const { gameName, gameGenre, surveyName, themePriorities } = formData;

    // 필수 데이터 확인 (themePriorities가 1개 이상 있어야 함)
    if (
      !gameName ||
      !gameGenre?.length ||
      !surveyName ||
      !themePriorities?.length
    ) {
      return;
    }

    setIsLocalGenerating(true);
    
    try {
      const response = await generateMutateAsync({
        count: DEFAULT_QUESTION_COUNT,
      });

      const generatedQuestions = response.result;
      const selectedIndices = generatedQuestions.map((_, i) => i);

      // Store에 질문 저장 + 전체 선택
      updateFormData({
        questions: generatedQuestions,
        selectedQuestionIndices: selectedIndices,
      });

      // RHF 동기화 (Store와 RHF 상태 일치)
      setValue('questions', generatedQuestions);
      setValue('selectedQuestionIndices', selectedIndices);

      // feedbackMap 초기화 (새 질문이므로)
      manager.setFeedbackMap({});
    } finally {
      // onSettled에서 처리하지만 안전장치로 한 번 더
      setIsLocalGenerating(false);
    }
  }, [formData, generateMutateAsync, updateFormData, manager, setValue]);

  // 페이지 렌더링 시 질문이 없으면 자동으로 API 호출
  useEffect(() => {
    // 이미 생성 중이거나 초기 생성 진행 중이면 스킵
    if (isMutationPending || isLocalGenerating || initialGenerateRef.current) {
      return;
    }

    // 질문이 있으면 스킵
    if (manager.questions.length > 0) {
      return;
    }

    initialGenerateRef.current = true;

    generateQuestions()
      .catch(() => {
        // Error is handled by mutation.error
      })
      .finally(() => {
        initialGenerateRef.current = false;
      });
  }, [manager.questions.length, isMutationPending, isLocalGenerating, generateQuestions]);



  // 질문 재생성
  const handleRegenerate = useCallback(async () => {
    await generateQuestions();
  }, [generateQuestions]);

  const handleAddQuestion = useCallback(async () => {
    const { gameName, gameGenre, surveyName, themePriorities } = formData;

    if (
      !gameName ||
      !gameGenre?.length ||
      !surveyName ||
      !themePriorities?.length
    ) {
      return;
    }

    setIsLocalGenerating(true);
    try {
      const response = await generateMutateAsync({ count: 1 });

      const newQuestion = response.result[0];
      if (!newQuestion) return;

      // 맨 앞에 추가 + 선택 인덱스 재조정
      manager.addQuestionAtFront(newQuestion);
    } catch {
      // Error is handled by mutation.error
    } finally {
      setIsLocalGenerating(false);
    }
  }, [formData, generateMutateAsync, manager]);

  return {
    // 공통 상태 (from manager)
    questions: manager.questions,
    feedbackMap: manager.feedbackMap,
    selectedQuestions: manager.selectedQuestions,
    loadingIndex: manager.loadingIndex,
    isFetchingFeedback: manager.isFetchingFeedback,
    selectedCount: manager.selectedCount,
    totalCount: manager.totalCount,
    isAllSelected: manager.isAllSelected,
    validationError: manager.validationError,

    // AI 전용 상태
    isGenerating: isLocalGenerating,
    generateError: generateError?.message ?? null,
    pendingFeedbackQuestions: new Set<string>(), // 호환성 유지용 빈 Set

    // 공통 핸들러 (from manager)
    handleToggle: manager.handleToggle,
    handleSelectAll: manager.handleSelectAll,
    handleRequestFeedback: manager.handleRequestFeedback,
    handleSuggestionClick: manager.handleSuggestionClick,

    // AI 전용 핸들러
    handleRegenerate,
    handleAddQuestion,
  };
}

export { useQuestionGenerate };
