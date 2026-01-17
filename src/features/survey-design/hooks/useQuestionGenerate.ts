import { useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import type { GameGenre } from '@/features/game';
import { useCurrentGameStore } from '@/stores/useCurrentGameStore';

import { postAiQuestions } from '../api';
import { useSurveyFormStore } from '../store/useSurveyFormStore';
import type {
  ApiGenerateAiQuestionsRequest,
  SurveyFormData,
  ThemeCategory,
} from '../types';
import { useQuestionManager } from './useQuestionManager';

/** 기본 AI 질문 생성 개수 */
const DEFAULT_QUESTION_COUNT = 10;

/**
 * AI 질문 생성 및 관리 훅
 * - 페이지 렌더링 시 POST /surveys/ai-questions API 호출
 * - useQuestionManager를 통해 공통 질문 관리 로직 재사용
 */
function useQuestionGenerate() {
  const { updateFormData } = useSurveyFormStore();
  const { setValue } = useFormContext<SurveyFormData>();
  const { currentGame } = useCurrentGameStore(); // Fallback용 게임 정보

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
      params: Pick<ApiGenerateAiQuestionsRequest, 'count' | 'shuffle'>
    ) => {
      const { formData } = useSurveyFormStore.getState();
      const {
        gameName,
        gameGenre,
        gameContext,
        themePriorities,
        themeDetails,
        testStage,
        extractedElements,
      } = formData;

      // Fallback: formData에 게임 정보가 없으면 global store에서 가져옴
      let effectiveGameName = gameName;
      let effectiveGameGenre: GameGenre[] | undefined = gameGenre;
      let effectiveGameContext = gameContext;
      let effectiveExtractedElements = extractedElements;

      if ((!effectiveGameName || !effectiveGameGenre?.length) && currentGame) {
        console.log('[AI Questions] Fallback to global game store');
        effectiveGameName = effectiveGameName || currentGame.gameName;
        effectiveGameGenre = effectiveGameGenre?.length
          ? effectiveGameGenre
          : (currentGame.gameGenre as GameGenre[]);
        effectiveGameContext = effectiveGameContext || currentGame.gameContext;

        // extractedElements도 없으면 파싱 시도
        if (!effectiveExtractedElements && currentGame.extractedElements) {
          try {
            effectiveExtractedElements = JSON.parse(currentGame.extractedElements);
          } catch {
            // ignore JSON parse error
          }
        }
      }

      // 🔍 DEBUG: 필수 데이터 상태 로깅
      console.log('[AI Questions] generateQuestions 호출됨', {
        gameName: effectiveGameName,
        gameGenre: effectiveGameGenre,
        testStage,
        extractedElements: effectiveExtractedElements,
        shuffle: params.shuffle,
      });

      if (!effectiveGameGenre?.length || !testStage) {
        throw new Error(
          '필수 정보(게임 장르, 테스트 단계)가 없습니다. 페이지를 새로고침 해주세요.'
        );
      }

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
        game_name: effectiveGameName || '',
        game_context: effectiveGameContext || '',
        game_genre: effectiveGameGenre!,
        test_stage: testStage,
        theme_priorities: themePriorities || [],
        theme_details: cleanedThemeDetails,
        count: params.count,
        shuffle: params.shuffle,
      });
    },
    onSettled: () => {
      setIsLocalGenerating(false);
    },
  });

  // AI 질문 생성 API 호출
  const generateQuestions = useCallback(async () => {
    const { formData } = useSurveyFormStore.getState();
    const { gameName, gameGenre, surveyName, themePriorities } = formData;

    // 🔍 DEBUG: 필수 데이터 상태 로깅
    console.log('[AI Questions] generateQuestions 호출됨', {
      gameName,
      gameGenre,
      surveyName,
      themePriorities,
    });

    // 필수 데이터 확인 (themePriorities가 1개 이상 있어야 함)
    if (
      !gameName ||
      !gameGenre?.length ||
      !surveyName ||
      !themePriorities?.length
    ) {
      console.warn('[AI Questions] ⚠️ 필수 데이터 누락으로 스킵:', {
        gameName: !gameName ? '❌ 없음' : '✅',
        gameGenre: !gameGenre?.length ? '❌ 없음' : '✅',
        surveyName: !surveyName ? '❌ 없음' : '✅',
        themePriorities: !themePriorities?.length ? '❌ 없음' : '✅',
      });
      return;
    }

    setIsLocalGenerating(true);

    try {
      // 초기 질문 생성은 shuffle: false (Best Match)
      const response = await generateMutateAsync({
        count: DEFAULT_QUESTION_COUNT,
        shuffle: false,
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
  }, [generateMutateAsync, updateFormData, manager, setValue]);

  // 페이지 렌더링 시 질문이 없으면 자동으로 API 호출
  useEffect(() => {
    // 🔍 DEBUG: useEffect 상태 로깅
    console.log('[AI Questions] useEffect 실행', {
      isMutationPending,
      isLocalGenerating,
      initialGenerateRef: initialGenerateRef.current,
      questionsLength: manager.questions.length,
    });

    // 이미 생성 중이거나 초기 생성 진행 중이면 스킵
    if (isMutationPending || isLocalGenerating || initialGenerateRef.current) {
      console.warn('[AI Questions] ⚠️ 생성 진행 중으로 스킵:', {
        isMutationPending,
        isLocalGenerating,
        initialGenerateRef: initialGenerateRef.current,
      });
      return;
    }

    // 질문이 있으면 스킵
    if (manager.questions.length > 0) {
      console.warn('[AI Questions] ⚠️ 이미 질문 존재하여 스킵:', manager.questions);
      return;
    }

    console.log('[AI Questions] ✅ API 호출 시작');
    initialGenerateRef.current = true;

    generateQuestions()
      .catch((error) => {
        console.error('[AI Questions] ❌ 생성 오류:', error);
        // Error is handled by mutation.error
      })
      .finally(() => {
        initialGenerateRef.current = false;
      });
  }, [
    manager.questions,
    isMutationPending,
    isLocalGenerating,
    generateQuestions,
  ]);

  // 질문 재생성
  const handleRegenerate = useCallback(async () => {
    // 재생성 시에는 shuffle: true (Varied Suggestions)
    setIsLocalGenerating(true);
    try {
      const response = await generateMutateAsync({
        count: DEFAULT_QUESTION_COUNT,
        shuffle: true,
      });

      const generatedQuestions = response.result;
      const selectedIndices = generatedQuestions.map((_, i) => i);

      updateFormData({
        questions: generatedQuestions,
        selectedQuestionIndices: selectedIndices,
      });
      setValue('questions', generatedQuestions);
      setValue('selectedQuestionIndices', selectedIndices);
      manager.setFeedbackMap({});
    } finally {
      setIsLocalGenerating(false);
    }
  }, [generateMutateAsync, updateFormData, setValue, manager]);

  const handleAddQuestion = useCallback(async () => {
    const { formData } = useSurveyFormStore.getState();
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
      // 추가 생성 시 shuffle: true
      const response = await generateMutateAsync({ count: 1, shuffle: true });

      const newQuestion = response.result[0];
      if (!newQuestion) return;

      // 맨 앞에 추가 + 선택 인덱스 재조정
      manager.addQuestionAtFront(newQuestion);
    } catch {
      // Error is handled by mutation.error
    } finally {
      setIsLocalGenerating(false);
    }
  }, [generateMutateAsync, manager]);

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
    selectAll: manager.selectAll,
    deselectAll: manager.deselectAll,
    handleRequestFeedback: manager.handleRequestFeedback,
    handleSuggestionClick: manager.handleSuggestionClick,

    // AI 전용 핸들러
    handleRegenerate,
    handleAddQuestion,
  };
}

export { useQuestionGenerate };
