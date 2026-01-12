import { useCallback, useState } from 'react';

import type { CreateGameRequest } from '../types';

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

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_STATE);
  }, []);

  const setFormFromData = useCallback((data: CreateGameRequest) => {
    setFormData({
      gameName: data.gameName,
      gameGenre: data.gameGenre,
      gameContext: data.gameContext,
    });
  }, []);

  const handleGenreToggle = useCallback((genre: string) => {
    setFormData((prev) => {
      const isSelected = prev.gameGenre.includes(genre);
      if (isSelected) {
        // 선택 해제
        return {
          ...prev,
          gameGenre: prev.gameGenre.filter((g) => g !== genre),
        };
      } else {
        // 선택 추가 (최대 개수 체크)
        if (prev.gameGenre.length >= MAX_GENRE_SELECTION) {
          return prev; // 추가 선택 불가
        }
        return {
          ...prev,
          gameGenre: [...prev.gameGenre, genre],
        };
      }
    });
  }, []);

  return {
    formData,
    setFormData,
    resetForm,
    setFormFromData,
    handleGenreToggle,
  };
}
