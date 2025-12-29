import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { MOCK_FEEDBACK_MAP } from '@/data/ai-questions.mock';

import { postAiQuestions } from '../api';
import { useSurveyFormStore } from '../store/useSurveyFormStore';
import type { QuestionFeedbackItem, SurveyFormData } from '../types';

/**
 * 질문 생성 및 피드백 관리 훅
 * - 페이지 렌더링 시 POST /surveys/ai-questions API 호출
 * - Zustand store와 연동하여 localStorage에 자동 저장
 * - react-hook-form과 연동하여 validation 제공
 */
function useQuestionGenerate() {
  const { formData, updateFormData } = useSurveyFormStore();
  const {
    setError,
    clearErrors,
    setValue,
    formState: { errors },
  } = useFormContext<SurveyFormData>();

  // API 호출 상태
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Store에서 질문 목록 가져오기
  const questions = useMemo(() => {
    return formData.questions || [];
  }, [formData.questions]);

  // Store에서 선택된 질문 인덱스 가져오기 (없으면 전체 선택)
  const selectedQuestions = useMemo(() => {
    if (formData.selectedQuestionIndices !== undefined) {
      return new Set(formData.selectedQuestionIndices);
    }
    // 초기화 시 전체 선택
    return new Set(questions.map((_, i) => i));
  }, [formData.selectedQuestionIndices, questions]);

  // 질문별 피드백 (메모리에서만 관리 - API 응답 캐시)
  const [feedbackMap, setFeedbackMap] = useState<
    Record<string, QuestionFeedbackItem>
  >({});

  // 로딩 상태
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  const [isFetchingFeedback, setIsFetchingFeedback] = useState(false);

  // 질문 목록 업데이트 시 Store에 저장
  const setQuestions = useCallback(
    (newQuestions: string[]) => {
      updateFormData({ questions: newQuestions });
      setValue('questions', newQuestions);
    },
    [updateFormData, setValue]
  );

  // 선택된 질문 업데이트 시 Store에 저장 + validation 연동
  const setSelectedQuestions = useCallback(
    (indices: Set<number>) => {
      const indicesArray = Array.from(indices);
      updateFormData({ selectedQuestionIndices: indicesArray });
      setValue('selectedQuestionIndices', indicesArray, {
        shouldDirty: true,
        shouldTouch: true,
      });

      // react-hook-form validation 연동
      if (indices.size === 0) {
        setError('selectedQuestionIndices', {
          type: 'manual',
          message: '최소 1개 이상의 질문을 선택해주세요.',
        });
      } else {
        clearErrors('selectedQuestionIndices');
      }
    },
    [updateFormData, setError, clearErrors, setValue]
  );

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

      // Store에 질문 저장
      updateFormData({
        questions: generatedQuestions,
        selectedQuestionIndices: generatedQuestions.map((_, i) => i), // 전체 선택
      });

      // react-hook-form에도 동기화
      setValue('questions', generatedQuestions);
      setValue(
        'selectedQuestionIndices',
        generatedQuestions.map((_, i) => i)
      );

      setHasGenerated(true);
      setFeedbackMap({}); // 피드백 캐시 초기화
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
  }, [formData, updateFormData, setValue]);

  // 페이지 렌더링 시 질문이 없으면 자동으로 API 호출
  useEffect(() => {
    // 이미 질문이 있거나 생성 중이면 스킵
    if (questions.length > 0 || isGenerating || hasGenerated) {
      return;
    }

    generateQuestions();
  }, [questions.length, isGenerating, hasGenerated, generateQuestions]);

  // Validation 에러 메시지 (react-hook-form에서 가져옴)
  const validationError = errors.selectedQuestionIndices?.message;

  // 특정 질문에 대한 피드백 요청
  const fetchFeedbackForQuestion = async (question: string) => {
    // TODO: 실제 API 연동
    // const response = await fetch('/api/surveys/question-feedback', { ... });

    // Mock API 응답 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 300));

    const feedback = MOCK_FEEDBACK_MAP[question] || {
      summary: `"${question}"에 대한 AI 피드백입니다.`,
      suggestions: [
        `${question} - 대안 1`,
        `${question} - 대안 2`,
        `${question} - 대안 3`,
      ],
    };

    return {
      question,
      summary: feedback.summary,
      suggestions: feedback.suggestions,
    };
  };

  // 전체 질문에 대한 피드백 요청 (초기 로드, 재생성 시)
  useEffect(() => {
    const fetchAllFeedback = async () => {
      if (questions.length === 0) return;

      // 이미 피드백이 있는 질문은 스킵
      const questionsToFetch = questions.filter((q) => !feedbackMap[q]);
      if (questionsToFetch.length === 0) return;

      setIsFetchingFeedback(true);

      try {
        const newFeedbackMap: Record<string, QuestionFeedbackItem> = {
          ...feedbackMap,
        };
        for (const q of questionsToFetch) {
          const feedback = await fetchFeedbackForQuestion(q);
          newFeedbackMap[q] = feedback;
        }
        setFeedbackMap(newFeedbackMap);
      } catch (error) {
        console.error('Failed to fetch feedback:', error);
      } finally {
        setIsFetchingFeedback(false);
      }
    };

    fetchAllFeedback();
  }, [questions, feedbackMap]);

  const handleToggle = useCallback(
    (index: number) => {
      const next = new Set(selectedQuestions);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      setSelectedQuestions(next);
    },
    [selectedQuestions, setSelectedQuestions]
  );

  const handleSelectAll = useCallback(() => {
    if (selectedQuestions.size === questions.length) {
      setSelectedQuestions(new Set());
    } else {
      setSelectedQuestions(new Set(questions.map((_, i) => i)));
    }
  }, [selectedQuestions.size, questions, setSelectedQuestions]);

  const handleRegenerate = useCallback(async () => {
    // 질문 재생성 - hasGenerated 상태 리셋 후 API 호출
    setHasGenerated(false);
    await generateQuestions();
  }, [generateQuestions]);

  // 특정 질문에 대한 피드백 요청 (질문 수정 시)
  const handleRequestFeedback = useCallback(
    async (index: number, newQuestion: string) => {
      setLoadingIndex(index);

      try {
        // 질문 업데이트 -> Store에 저장
        const newQuestions = questions.map((q, idx) =>
          idx === index ? newQuestion : q
        );
        setQuestions(newQuestions);

        // 피드백 요청
        const feedback = await fetchFeedbackForQuestion(newQuestion);

        // 피드백 맵 업데이트
        setFeedbackMap((prev) => ({
          ...prev,
          [newQuestion]: feedback,
        }));
      } catch (error) {
        console.error('Failed to request feedback:', error);
      } finally {
        setLoadingIndex(null);
      }
    },
    [questions, setQuestions]
  );

  // 추천 대안 클릭 시 질문 변경 및 피드백 요청
  const handleSuggestionClick = useCallback(
    async (questionIndex: number, suggestion: string) => {
      await handleRequestFeedback(questionIndex, suggestion);
    },
    [handleRequestFeedback]
  );

  return {
    questions,
    feedbackMap,
    selectedQuestions,
    loadingIndex,
    isFetchingFeedback,
    isGenerating,
    generateError,
    selectedCount: selectedQuestions.size,
    totalCount: questions.length,
    isAllSelected: selectedQuestions.size === questions.length,
    validationError,
    handleToggle,
    handleSelectAll,
    handleRegenerate,
    handleRequestFeedback,
    handleSuggestionClick,
  };
}

export { useQuestionGenerate };
