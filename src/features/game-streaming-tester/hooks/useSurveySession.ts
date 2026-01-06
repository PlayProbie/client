/**
 * 설문 세션 관련 훅
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getSurveySessionAvailability,
  getSurveySessionStatus,
  postSurveySignal,
  terminateSurveySession,
} from '../api';
import type {
  SignalRequest,
  SignalResponse,
  SurveySessionAvailability,
  SurveySessionStatus,
  TerminateSurveySessionRequest,
} from '../types';

export const testerSessionKeys = {
  all: ['tester-session'] as const,
  availability: (surveyUuid: string) =>
    [...testerSessionKeys.all, 'availability', surveyUuid] as const,
  status: (surveyUuid: string) =>
    [...testerSessionKeys.all, 'status', surveyUuid] as const,
};

export function useSurveySessionAvailability(
  surveyUuid: string,
  enabled = true
) {
  return useQuery<SurveySessionAvailability, Error>({
    queryKey: testerSessionKeys.availability(surveyUuid),
    queryFn: () => getSurveySessionAvailability(surveyUuid),
    enabled: enabled && !!surveyUuid,
  });
}

export function useStartSurveyStream(surveyUuid: string) {
  const queryClient = useQueryClient();

  return useMutation<SignalResponse, Error, SignalRequest>({
    mutationFn: (request) => postSurveySignal(surveyUuid, request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: testerSessionKeys.availability(surveyUuid),
      });
    },
  });
}

export function useTerminateSurveySession(surveyUuid: string) {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, TerminateSurveySessionRequest>({
    mutationFn: (request) => terminateSurveySession(surveyUuid, request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: testerSessionKeys.availability(surveyUuid),
      });
    },
  });
}

export function useSurveySessionStatus(
  surveyUuid: string,
  enabled = true
) {
  return useQuery<SurveySessionStatus, Error>({
    queryKey: testerSessionKeys.status(surveyUuid),
    queryFn: () => getSurveySessionStatus(surveyUuid),
    enabled: enabled && !!surveyUuid,
  });
}
