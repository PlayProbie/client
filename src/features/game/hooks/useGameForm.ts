import { useCallback, useState } from 'react';

import { useToast } from '@/hooks/useToast';

import { postExtractElements } from '../api/post-extract-elements';
import type { CreateGameRequest, ExtractedElements } from '../types';

const INITIAL_FORM_STATE: CreateGameRequest = {
  gameName: '',
  gameGenre: [],
  gameContext: '',
};

const MAX_GENRE_SELECTION = 3;

/**
 * 게임 생성/수정 폼 상태 관리 훅
 */
export function useGameForm(initialData?: CreateGameRequest) {
  const [formData, setFormData] = useState<CreateGameRequest>(
    initialData || INITIAL_FORM_STATE
  );

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysisStep, setShowAnalysisStep] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ExtractedElements | null>(
    null
  );
  const { toast } = useToast();

  // Derived State: 분석 가능 여부
  const canAnalyze =
    formData.gameName.trim().length > 0 &&
    formData.gameGenre.length > 0 &&
    formData.gameContext.trim().length > 0;

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_STATE);
    setShowAnalysisStep(false);
    setAnalysisResult(null);
  }, []);

  const setFormFromData = useCallback((data: CreateGameRequest) => {
    setFormData({
      gameName: data.gameName,
      gameGenre: data.gameGenre,
      gameContext: data.gameContext,
      extractedElements: data.extractedElements,
    });
    // 이미 분석된 데이터가 있다면 결과창을 보여줄 수도 있겠지만,
    // 현재 스펙에서는 생성 시점이 중요하므로 일단 초기화
    setShowAnalysisStep(false);
    setAnalysisResult(null);
  }, []);

  const handleGenreToggle = useCallback((genre: string) => {
    setFormData((prev) => {
      const isSelected = prev.gameGenre.includes(genre);
      if (isSelected) {
        return {
          ...prev,
          gameGenre: prev.gameGenre.filter((g) => g !== genre),
        };
      } else {
        if (prev.gameGenre.length >= MAX_GENRE_SELECTION) {
          return prev;
        }
        return {
          ...prev,
          gameGenre: [...prev.gameGenre, genre],
        };
      }
    });
  }, []);

  /** AI 분석 요청 */
  const handleAnalyzeGame = async () => {
    if (!canAnalyze) return;

    setIsAnalyzing(true);
    setAnalysisResult(null); // 이전 결과 초기화

    try {
      const result = await postExtractElements({
        game_name: formData.gameName,
        genres: formData.gameGenre,
        game_description: formData.gameContext,
      });

      setAnalysisResult(result);
      setShowAnalysisStep(true);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '분석 실패',
        description:
          error instanceof Error
            ? error.message
            : '게임 분석 중 오류가 발생했습니다.',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  /** 분석 결과 수정 핸들러 (AnalysisStep에서 호출) */
  const handleElementChange = useCallback((key: string, value: string) => {
    setAnalysisResult((prev: ExtractedElements | null) => {
      if (!prev) return null;
      return {
        ...prev,
        elements: {
          ...prev.elements,
          [key]: value,
        },
      };
    });
  }, []);

  /** 분석 결과 확인 및 저장 준비 */
  const handleAnalysisConfirm = useCallback(() => {
    if (analysisResult) {
      const extractedElementsJson = JSON.stringify(analysisResult.elements);
      setFormData((prev) => ({
        ...prev,
        extractedElements: extractedElementsJson,
      }));
      // 여기서 바로 submit을 호출하지 않고, 부모 컴포넌트(GameFormModal)의 onSubmit이 호출되도록 함
      // 다만, 모달 UI 흐름상 '확인 및 저장' 버튼이 마지막 단계이므로
      // 이 함수가 호출된 후에는 onSubmit이 이어져야 함.
      // useGameForm에서는 데이터 업데이트만 담당.
    }
  }, [analysisResult]);

  /** 뒤로가기 (분석 결과 -> 입력 폼) */
  const handleBackToInput = useCallback(() => {
    setShowAnalysisStep(false);
  }, []);

  return {
    formData,
    setFormData,
    resetForm,
    setFormFromData,
    handleGenreToggle,
    // Analysis props
    isAnalyzing,
    showAnalysisStep,
    analysisResult,
    canAnalyze,
    handleAnalyzeGame,
    handleElementChange,
    handleAnalysisConfirm,
    handleBackToInput,
  };
}
