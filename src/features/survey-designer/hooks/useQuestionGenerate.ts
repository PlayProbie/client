import { useCallback, useEffect, useState } from 'react';

import { postAiQuestions } from '../api';
import { useSurveyFormStore } from '../store/useSurveyFormStore';
import { useQuestionManager } from './useQuestionManager';

/**
 * AI 질문 생성 및 관리 훅
 * - 페이지 렌더링 시 POST /surveys/ai-questions API 호출
 * - useQuestionManager를 통해 공통 질문 관리 로직 재사용
 */
function useQuestionGenerate() {
  const { formData, updateFormData } = useSurveyFormStore();

  // 공통 질문 관리 로직
  const manager = useQuestionManager();

  // API 호출 상태
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  // AI 질문 생성 API 호출
  const generateQuestions = useCallback(async () => {
    const { gameName, gameGenre, gameContext, surveyName, testPurpose } =
      formData;

    // 필수 데이터 확인
    if (!gameName || !gameGenre?.length || !surveyName || !testPurpose) {
      setGenerateError('질문 생성에 필요한 정보가 부족합니다.');
      return;
    }

    setIsGenerating(true);
    setGenerateError(null);

    try {
      const response = await postAiQuestions({
        game_name: gameName,
        game_context: gameContext || '',
        game_genre: gameGenre,
        survey_name: surveyName,
        test_purpose: testPurpose,
        count: 5, // 기본 5개 질문 생성
      });

      const generatedQuestions = response.result;

      // Store에 질문 저장 + 전체 선택
      updateFormData({
        questions: generatedQuestions,
        selectedQuestionIndices: generatedQuestions.map((_, i) => i),
      });

      // feedbackMap 초기화 (새 질문이므로)
      manager.setFeedbackMap({});
      setHasGenerated(true);
    } catch (error) {
      console.error('Failed to generate questions:', error);
      setGenerateError(
        error instanceof Error
          ? error.message
          : 'AI 질문 생성에 실패했습니다. 다시 시도해주세요.'
      );
    } finally {
      setIsGenerating(false);
    }
  }, [formData, updateFormData, manager]);

  // 페이지 렌더링 시 질문이 없으면 자동으로 API 호출
  useEffect(() => {
    if (manager.questions.length > 0 || isGenerating || hasGenerated) {
      return;
    }
    generateQuestions();
  }, [manager.questions.length, isGenerating, hasGenerated, generateQuestions]);

  // 전체 질문에 대한 피드백 요청 (초기 로드 시)
  useEffect(() => {
    const fetchAllFeedback = async () => {
      if (manager.questions.length === 0) return;

      // 이미 피드백이 있는 질문은 스킵
      const questionsToFetch = manager.questions.filter(
        (q) => !manager.feedbackMap[q]
      );
      if (questionsToFetch.length === 0) return;

      manager.setIsFetchingFeedback(true);

      try {
        const newFeedbackMap = { ...manager.feedbackMap };
        for (const q of questionsToFetch) {
          const feedback = await manager.fetchFeedbackForQuestion(q);
          newFeedbackMap[q] = feedback;
        }
        manager.setFeedbackMap(newFeedbackMap);
      } catch (error) {
        console.error('Failed to fetch feedback:', error);
      } finally {
        manager.setIsFetchingFeedback(false);
      }
    };

    fetchAllFeedback();
  }, [manager.questions, manager.feedbackMap, manager]);

  // 질문 재생성
  const handleRegenerate = useCallback(async () => {
    setHasGenerated(false);
    await generateQuestions();
  }, [generateQuestions]);

  // AI 질문 1개 추가 생성
  const handleAddQuestion = useCallback(async () => {
    const { gameName, gameGenre, gameContext, surveyName, testPurpose } =
      formData;

    if (!gameName || !gameGenre?.length || !surveyName || !testPurpose) {
      setGenerateError('질문 생성에 필요한 정보가 부족합니다.');
      return;
    }

    setIsGenerating(true);
    setGenerateError(null);

    try {
      const response = await postAiQuestions({
        game_name: gameName,
        game_context: gameContext || '',
        game_genre: gameGenre,
        survey_name: surveyName,
        test_purpose: testPurpose,
        count: 1, // 1개 질문만 추가 생성
      });

      const newQuestion = response.result[0];
      if (!newQuestion) return;

      // 맨 앞에 추가 + 선택 인덱스 재조정
      manager.addQuestionAtFront(newQuestion);
    } catch (error) {
      console.error('Failed to add question:', error);
      setGenerateError(
        error instanceof Error
          ? error.message
          : 'AI 질문 추가에 실패했습니다. 다시 시도해주세요.'
      );
    } finally {
      setIsGenerating(false);
    }
  }, [formData, manager]);

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
    isGenerating,
    generateError,

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
