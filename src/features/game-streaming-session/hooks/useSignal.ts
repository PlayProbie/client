/**
 * WebRTC 시그널 교환 훅
 */
import { useMutation } from '@tanstack/react-query';

import { postSignal } from '../api';
import type { SignalRequest, SignalResponse } from '../types';

/** WebRTC 시그널 교환 훅 */
export function useSignal(surveyUuid: string) {
  return useMutation<SignalResponse, Error, SignalRequest>({
    mutationFn: (request) => postSignal(surveyUuid, request),
  });
}
