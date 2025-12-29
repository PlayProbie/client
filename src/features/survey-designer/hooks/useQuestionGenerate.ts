import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { MOCK_AI_QUESTIONS, MOCK_FEEDBACK_MAP } from '@/data/ai-questions.mock';

import { useSurveyFormStore } from '../store/useSurveyFormStore';
import type { QuestionFeedbackItem, SurveyFormData } from '../types';

/**
 * 질문 생성 및 피드백 관리 훅
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

  // Store에서 질문 목록 가져오기 (없으면 Mock 데이터로 초기화)
  const questions = useMemo(() => {
    return formData.questions?.length ? formData.questions : MOCK_AI_QUESTIONS;
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

  // 초기화: Store에 질문이 없으면 Mock 데이터로 초기화
  useEffect(() => {
    if (!formData.questions?.length) {
      updateFormData({
        questions: MOCK_AI_QUESTIONS,
        selectedQuestionIndices: MOCK_AI_QUESTIONS.map((_, i) => i),
      });
    }
  }, [formData.questions, updateFormData]);

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
    // TODO: POST /surveys/ai-questions API 연동
    console.log('Regenerating questions for:', formData);

    // Mock: 질문 재생성 시뮬레이션
    setQuestions([...MOCK_AI_QUESTIONS]);
    setSelectedQuestions(new Set(MOCK_AI_QUESTIONS.map((_, i) => i)));
    setFeedbackMap({}); // 피드백 캐시 초기화
  }, [formData, setQuestions, setSelectedQuestions]);

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
