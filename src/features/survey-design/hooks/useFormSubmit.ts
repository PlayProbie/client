import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

import { surveyKeys } from '@/features/game-streaming-survey/hooks/useSurveys';

import { postFixedQuestions, postSurvey } from '../api';
import { useSurveyFormStore } from '../store/useSurveyFormStore';
import type {
  ApiFixedQuestionItem,
  SurveyFormData,
  ThemeCategory,
} from '../types';

type SubmitResult = {
  surveyUrl: string;
  surveyUuid: string;
  isFirstSurvey: boolean;
};

type UseFormSubmitOptions = {
  onSuccess?: (result: SubmitResult) => void;
  onError?: (error: Error, step: SubmitStep) => void;
};

/** 트랜잭션 단계 */
type SubmitStep = 'game' | 'survey' | 'questions';

/** 트랜잭션 상태 (롤백용) */
type TransactionState = {
  gameUuid?: string;
  surveyUuid?: string;
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
export function useFormSubmit(options?: UseFormSubmitOptions) {
  const { setSurveyUrl } = useSurveyFormStore();
  const queryClient = useQueryClient();

  const { gameUuid } = useParams<{ gameUuid?: string }>();

  return useMutation({
    mutationFn: async (formData: Partial<SurveyFormData>) => {
      const {
        surveyName,
        startedAt,
        endedAt,
        questions,
        selectedQuestionIndices,
        testStage,
        themePriorities,
        themeDetails,
        versionNote,
      } = formData;

      const transactionState: TransactionState = {};

      // 2. 설문 생성
      let surveyUuid: string;
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

        // themeDetails에서 themePriorities에 없는 키 제거
        const cleanedThemeDetails = themeDetails
          ? Object.fromEntries(
              Object.entries(themeDetails).filter(([key]) =>
                themePriorities?.includes(key as ThemeCategory)
              )
            )
          : {};

        const surveyResponse = await postSurvey({
          game_uuid: gameUuid!,
          survey_name: surveyName || '',
          started_at: formatToISO(startedAt || ''),
          ended_at: formatToISO(endedAt || ''),
          test_stage: testStage,
          theme_priorities: themePriorities || [],
          theme_details: cleanedThemeDetails,
          version_note: versionNote,
        });
        surveyUuid = surveyResponse.result.survey_uuid;
        surveyUrl = `${import.meta.env.VITE_CLIENT_BASE_URL}/surveys/session/${surveyUuid}`;
        transactionState.surveyUuid = surveyUuid;
      } catch (error) {
        // TODO: 서버에 rollback API가 있다면 여기서 게임 삭제 호출
        // await deleteGame(gameUuid);
        throw new SurveySubmitError(
          '설문 생성에 실패했습니다.',
          'survey',
          error instanceof Error ? error : undefined,
          transactionState
        );
      }

      // 3. 고정 질문 생성 (선택된 질문만)
      const selectedQuestions: ApiFixedQuestionItem[] = (
        selectedQuestionIndices || []
      ).map((index, order) => ({
        q_content: questions?.[index] || '',
        q_order: order + 1,
      }));

      if (selectedQuestions.length > 0) {
        try {
          await postFixedQuestions({
            survey_uuid: surveyUuid,
            questions: selectedQuestions,
          });
        } catch (error) {
          // TODO: 서버에 rollback API가 있다면 여기서 설문/게임 삭제 호출
          // await deleteSurvey(surveyUuid);
          // await deleteGame(gameUuid);
          throw new SurveySubmitError(
            '질문 저장에 실패했습니다.',
            'questions',
            error instanceof Error ? error : undefined,
            transactionState
          );
        }
      }

      return { surveyUrl, surveyUuid };
    },
    onSuccess: ({ surveyUrl, surveyUuid }) => {
      setSurveyUrl(surveyUrl);

      // 기존 설문 목록 확인하여 첫 설문인지 판별
      const previousSurveys = queryClient.getQueryData<unknown[]>(
        surveyKeys.list(gameUuid)
      );
      const isFirstSurvey =
        !previousSurveys ||
        (Array.isArray(previousSurveys) && previousSurveys.length === 0);

      queryClient.invalidateQueries({ queryKey: surveyKeys.all });
      options?.onSuccess?.({ surveyUrl, surveyUuid, isFirstSurvey });
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
export type { SubmitResult, SubmitStep, TransactionState };
