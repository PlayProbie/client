import { useCallback, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { MOCK_FEEDBACK_MAP } from '@/data/ai-questions.mock';

import { useSurveyFormStore } from '../store/useSurveyFormStore';
import type { QuestionFeedbackItem, SurveyFormData } from '../types';

/**
 * 질문 관리 공통 훅
 * - 질문 목록/선택 상태 관리
 * - Zustand store + react-hook-form 동기화
 * - 피드백 요청/캐싱
 *
 * useQuestionGenerate, useQuestionUserGenerate에서 공통 사용
 */
function useQuestionManager() {
  const { formData, updateFormData } = useSurveyFormStore();
  const {
    setError,
    clearErrors,
    setValue,
    formState: { errors },
  } = useFormContext<SurveyFormData>();

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

  // Validation 에러 메시지 (react-hook-form에서 가져옴)
  const validationError = errors.selectedQuestionIndices?.message;

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

  // 특정 질문에 대한 피드백 요청
  const fetchFeedbackForQuestion = useCallback(
    async (question: string): Promise<QuestionFeedbackItem> => {
      // TODO: 실제 API 연동 - POST /surveys/question-feedback
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
    },
    []
  );

  // 질문 토글 (선택/해제)
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

  // 전체 선택/해제
  const handleSelectAll = useCallback(() => {
    if (selectedQuestions.size === questions.length) {
      setSelectedQuestions(new Set());
    } else {
      setSelectedQuestions(new Set(questions.map((_, i) => i)));
    }
  }, [selectedQuestions.size, questions, setSelectedQuestions]);

  // 질문 맨 앞에 추가 (선택 인덱스 재조정 포함)
  const addQuestionAtFront = useCallback(
    (newQuestion: string) => {
      const newQuestions = [newQuestion, ...questions];

      // 기존 선택 인덱스 +1 재조정 후, 새 질문(인덱스 0)을 선택 목록에 추가
      const newSelectedIndices = Array.from(selectedQuestions).map(
        (idx) => idx + 1
      );
      newSelectedIndices.unshift(0);

      updateFormData({
        questions: newQuestions,
        selectedQuestionIndices: newSelectedIndices,
      });
      setValue('questions', newQuestions);
      setValue('selectedQuestionIndices', newSelectedIndices);

      return newQuestions;
    },
    [questions, selectedQuestions, updateFormData, setValue]
  );

  // 질문 삭제
  const removeQuestion = useCallback(
    (index: number) => {
      const removedQuestion = questions[index];
      const newQuestions = questions.filter((_, i) => i !== index);
      setQuestions(newQuestions);

      // 선택 목록에서 삭제 및 인덱스 재조정
      const newSelectedQuestions = new Set<number>();
      selectedQuestions.forEach((selectedIndex) => {
        if (selectedIndex < index) {
          newSelectedQuestions.add(selectedIndex);
        } else if (selectedIndex > index) {
          newSelectedQuestions.add(selectedIndex - 1);
        }
      });
      setSelectedQuestions(newSelectedQuestions);

      // 피드백 맵에서 삭제
      if (removedQuestion && feedbackMap[removedQuestion]) {
        setFeedbackMap((prev) => {
          const next = { ...prev };
          delete next[removedQuestion];
          return next;
        });
      }
    },
    [
      questions,
      selectedQuestions,
      setQuestions,
      setSelectedQuestions,
      feedbackMap,
    ]
  );

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
    [questions, setQuestions, fetchFeedbackForQuestion]
  );

  // 추천 대안 클릭 시 질문 변경 및 피드백 요청
  const handleSuggestionClick = useCallback(
    async (questionIndex: number, suggestion: string) => {
      await handleRequestFeedback(questionIndex, suggestion);
    },
    [handleRequestFeedback]
  );

  return {
    // 상태
    questions,
    selectedQuestions,
    feedbackMap,
    loadingIndex,
    isFetchingFeedback,
    validationError,

    // 계산 값
    selectedCount: selectedQuestions.size,
    totalCount: questions.length,
    isAllSelected:
      questions.length > 0 && selectedQuestions.size === questions.length,

    // 상태 설정자
    setQuestions,
    setSelectedQuestions,
    setFeedbackMap,
    setIsFetchingFeedback,

    // 핸들러
    handleToggle,
    handleSelectAll,
    addQuestionAtFront,
    removeQuestion,
    handleRequestFeedback,
    handleSuggestionClick,
    fetchFeedbackForQuestion,
  };
}

export { useQuestionManager };
