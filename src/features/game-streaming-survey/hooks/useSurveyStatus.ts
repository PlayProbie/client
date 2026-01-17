/**
 * 설문 상태 업데이트 훅
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateSurveyStatus } from '../api';
import type { SurveyStatusValue, UpdateSurveyStatusResponse } from '../types';
import { surveyKeys } from './useSurveys';

interface UpdateSurveyStatusParams {
  status: SurveyStatusValue;
}

/** 설문 상태 업데이트 훅 (ACTIVE/CLOSED) */
export function useUpdateSurveyStatus(surveyUuid: string) {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateSurveyStatusResponse,
    Error,
    UpdateSurveyStatusParams
  >({
    mutationFn: (params) =>
      updateSurveyStatus({ surveyUuid, status: params.status }),
    onSuccess: () => {
      // 설문 목록 새로고침
      queryClient.invalidateQueries({ queryKey: surveyKeys.all });
    },
  });
}
