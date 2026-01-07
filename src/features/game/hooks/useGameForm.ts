import { useCallback, useState } from 'react';

import type { CreateGameRequest } from '../types';

const INITIAL_FORM_STATE: CreateGameRequest = {
  gameName: '',
  gameGenre: [],
  gameContext: '',
};

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
    setFormData((prev) => ({
      ...prev,
      gameGenre: prev.gameGenre.includes(genre)
        ? prev.gameGenre.filter((g) => g !== genre)
        : [...prev.gameGenre, genre],
    }));
  }, []);

  return {
    formData,
    setFormData,
    resetForm,
    setFormFromData,
    handleGenreToggle,
  };
}
