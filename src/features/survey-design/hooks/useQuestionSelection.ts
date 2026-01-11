/**
 * 질문 선택 상태 관리 훅
 * - 질문 선택/해제 토글
 * - 전체 선택/해제
 * - Zustand store + react-hook-form 동기화
 */

import { useCallback, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

import { useSurveyFormStore } from '../store/useSurveyFormStore';
import type { SurveyFormData } from '../types';

/**
 * useQuestionSelection - 질문 선택 상태 관리
 */
function useQuestionSelection() {
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

  // Store에서 선택된 질문 인덱스 가져오기 (없거나 빈 배열이면 전체 선택)
  const selectedQuestions = useMemo(() => {
    const indices = formData.selectedQuestionIndices;
    if (indices !== undefined && indices.length > 0) {
      return new Set(indices);
    }
    // 초기화 시 전체 선택
    return new Set(questions.map((_, i) => i));
  }, [formData.selectedQuestionIndices, questions]);

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

      return newQuestions;
    },
    [questions, selectedQuestions, setQuestions, setSelectedQuestions]
  );

  return {
    // 상태
    questions,
    selectedQuestions,
    validationError,

    // 계산 값
    selectedCount: selectedQuestions.size,
    totalCount: questions.length,
    isAllSelected:
      questions.length > 0 && selectedQuestions.size === questions.length,

    // 상태 설정자
    setQuestions,
    setSelectedQuestions,

    // 핸들러
    handleToggle,
    handleSelectAll,
    addQuestionAtFront,
    removeQuestion,
  };
}

export { useQuestionSelection };
