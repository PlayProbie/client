import { useMutation } from '@tanstack/react-query';

import { postFixedQuestions, postGame, postSurvey } from '../api';
import { useSurveyFormStore } from '../store/useSurveyFormStore';
import type { FixedQuestionItem, SurveyFormData } from '../types';

type UseSurveySubmitOptions = {
  onSuccess?: (surveyUrl: string) => void;
  onError?: (error: Error, step: SubmitStep) => void;
};

/** 트랜잭션 단계 */
type SubmitStep = 'game' | 'survey' | 'questions';

/** 트랜잭션 상태 (롤백용) */
type TransactionState = {
  gameId?: number;
  surveyId?: number;
};

/**
 * 트랜잭션 실패 시 커스텀 에러
 */
class SurveySubmitError extends Error {
  step: SubmitStep;
  cause?: Error;
  transactionState?: TransactionState;

  constructor(
    message: string,
    step: SubmitStep,
    cause?: Error,
    transactionState?: TransactionState
  ) {
    super(message);
    this.name = 'SurveySubmitError';
    this.step = step;
    this.cause = cause;
    this.transactionState = transactionState;
  }
}

/**
 * 설문 생성 API 호출 훅
 * 순서: POST /games → POST /surveys → POST /surveys/fixed_questions
 *
 * 트랜잭션 안전 처리:
 * - 각 단계에서 실패 시 어떤 단계에서 실패했는지 추적
 * - 롤백이 필요한 경우 transactionState 정보 제공
 * - 서버 측 트랜잭션/롤백 API가 있을 경우 확장 가능
 */
export function useSurveySubmit(options?: UseSurveySubmitOptions) {
  const { setSurveyUrl } = useSurveyFormStore();

  return useMutation({
    mutationFn: async (formData: Partial<SurveyFormData>) => {
      const {
        gameName,
        gameGenre,
        gameContext,
        surveyName,
        testPurpose,
        startedAt,
        endedAt,
        questions,
        selectedQuestionIndices,
      } = formData;

      const transactionState: TransactionState = {};

      // 1. 게임 생성
      let gameId: number;
      try {
        const gameResponse = await postGame({
          game_name: gameName || '',
          game_context: gameContext || '',
          game_genre: gameGenre || [],
        });
        gameId = gameResponse.result.game_id;
        transactionState.gameId = gameId;
      } catch (error) {
        throw new SurveySubmitError(
          '게임 생성에 실패했습니다.',
          'game',
          error instanceof Error ? error : undefined
        );
      }

      // 2. 설문 생성
      let surveyId: number;
      let surveyUrl: string;
      try {
        // 날짜를 ISO 8601 형식으로 변환 (YYYY-MM-DD -> YYYY-MM-DDTHH:mm:ss+09:00)
        const formatToISO = (dateStr: string): string => {
          if (!dateStr) return '';
          // 이미 ISO 형식이면 그대로 반환
          if (dateStr.includes('T')) return dateStr;
          // YYYY-MM-DD 형식이면 한국 시간(KST) 기준 시작 시간(00:00:00) 추가
          return `${dateStr}T00:00:00+09:00`;
        };

        const surveyResponse = await postSurvey({
          game_id: gameId,
          survey_name: surveyName || '',
          started_at: formatToISO(startedAt || ''),
          ended_at: formatToISO(endedAt || ''),
          test_purpose: testPurpose!,
        });
        surveyId = surveyResponse.result.survey_id;
        surveyUrl = surveyResponse.result.survey_url;
        transactionState.surveyId = surveyId;
      } catch (error) {
        // TODO: 서버에 rollback API가 있다면 여기서 게임 삭제 호출
        // await deleteGame(gameId);
        throw new SurveySubmitError(
          '설문 생성에 실패했습니다.',
          'survey',
          error instanceof Error ? error : undefined,
          transactionState
        );
      }

      // 3. 고정 질문 생성 (선택된 질문만)
      const selectedQuestions: FixedQuestionItem[] = (
        selectedQuestionIndices || []
      ).map((index, order) => ({
        q_content: questions?.[index] || '',
        q_order: order + 1,
      }));

      if (selectedQuestions.length > 0) {
        try {
          await postFixedQuestions({
            survey_id: surveyId,
            questions: selectedQuestions,
          });
        } catch (error) {
          // TODO: 서버에 rollback API가 있다면 여기서 설문/게임 삭제 호출
          // await deleteSurvey(surveyId);
          // await deleteGame(gameId);
          throw new SurveySubmitError(
            '질문 저장에 실패했습니다.',
            'questions',
            error instanceof Error ? error : undefined,
            transactionState
          );
        }
      }

      return surveyUrl;
    },
    onSuccess: (surveyUrl) => {
      setSurveyUrl(surveyUrl);
      options?.onSuccess?.(surveyUrl);
    },
    onError: (error: Error) => {
      if (error instanceof SurveySubmitError) {
        options?.onError?.(error, error.step);
      } else {
        options?.onError?.(error, 'game');
      }
    },
  });
}

export { SurveySubmitError };
export type { SubmitStep, TransactionState };
