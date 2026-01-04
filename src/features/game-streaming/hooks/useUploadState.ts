/**
 * 업로드 상태 머신 Hook
 * 핵심 업로드 로직을 캡슐화
 */
import { useQueryClient } from '@tanstack/react-query';
import type { AxiosProgressEvent } from 'axios';
import { useCallback, useRef, useState } from 'react';

import { postBuildComplete, postPresignedUrl, putS3Upload } from '../api';
import type { UploadError, UploadProgress, UploadState } from '../types';
import {
  analyzeCompleteError,
  analyzePresignedError,
  analyzeUploadError,
} from '../utils/upload-error-handler';
import { buildKeys } from './useBuildsQuery';

export interface UseUploadStateOptions {
  gameUuid: string;
  onSuccess?: (buildId: string) => void;
  onError?: (error: UploadError) => void;
}

export interface UploadParams {
  file: File;
  executablePath: string;
  version?: string;
  note?: string;
}

export function useUploadState({
  gameUuid,
  onSuccess,
  onError,
}: UseUploadStateOptions) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<UploadState>({ step: 'idle' });
  const abortControllerRef = useRef<AbortController | null>(null);
  const startTimeRef = useRef<number>(0);
  const currentStepRef = useRef<string>('idle');

  /** 에러 상태로 전환 */
  const setError = useCallback(
    (errorInfo: UploadError, prevBuildId?: string, prevS3Key?: string) => {
      setState({
        step: 'error',
        error: errorInfo,
        buildId: prevBuildId,
        s3Key: prevS3Key,
      });
      onError?.(errorInfo);
    },
    [onError]
  );

  /** 진행률 계산 */
  const calculateProgress = useCallback(
    (event: AxiosProgressEvent): UploadProgress => {
      const uploaded = event.loaded;
      const total = event.total || uploaded;
      const percent = Math.round((uploaded / total) * 100);

      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const speed = elapsed > 0 ? uploaded / elapsed : 0;
      const remaining = total - uploaded;
      const eta = speed > 0 ? remaining / speed : 0;

      return { percent, uploaded, total, speed, eta };
    },
    []
  );

  /** 업로드 시작 */
  const startUpload = useCallback(
    async ({ file }: UploadParams) => {
      let buildId: string | undefined;
      let s3Key: string | undefined;

      try {
        // Step 1: Presigned URL 요청
        currentStepRef.current = 'requesting_presigned_url';
        setState({ step: 'requesting_presigned_url' });

        const presigned = await postPresignedUrl(gameUuid, {
          filename: file.name,
          file_size: file.size,
        });

        buildId = presigned.buildId;
        s3Key = presigned.s3Key;

        // Step 2: S3 업로드
        currentStepRef.current = 'uploading_to_s3';
        setState({
          step: 'uploading_to_s3',
          buildId,
          s3Key,
          progress: {
            percent: 0,
            uploaded: 0,
            total: file.size,
            speed: 0,
            eta: 0,
          },
        });

        abortControllerRef.current = new AbortController();
        startTimeRef.current = Date.now();

        await putS3Upload({
          file,
          uploadUrl: presigned.uploadUrl,
          signal: abortControllerRef.current.signal,
          onProgress: (event) => {
            const progress = calculateProgress(event);
            setState((prev) => {
              if (prev.step === 'uploading_to_s3') {
                return { ...prev, progress };
              }
              return prev;
            });
          },
        });

        // Step 3: Complete 요청
        currentStepRef.current = 'completing_upload';
        setState({
          step: 'completing_upload',
          buildId,
          s3Key,
        });

        await postBuildComplete(gameUuid, buildId, { s3_key: s3Key });

        // Success
        currentStepRef.current = 'success';
        setState({ step: 'success', buildId });
        queryClient.invalidateQueries({ queryKey: buildKeys.list(gameUuid) });
        onSuccess?.(buildId);
      } catch (err) {
        const error = err as Error & { code?: string };

        // AbortError는 사용자 취소이므로 무시
        if (error.name === 'AbortError') {
          return;
        }

        // 현재 단계에 따라 에러 분석
        const currentStep = currentStepRef.current;
        let errorInfo: UploadError;

        if (currentStep === 'uploading_to_s3') {
          errorInfo = analyzeUploadError(error);
        } else if (currentStep === 'completing_upload') {
          errorInfo = analyzeCompleteError(error);
        } else {
          errorInfo = analyzePresignedError(error);
        }

        setError(errorInfo, buildId, s3Key);
      }
    },
    [gameUuid, calculateProgress, setError, onSuccess, queryClient]
  );

  /** 업로드 취소 */
  const cancelUpload = useCallback(() => {
    abortControllerRef.current?.abort();
    currentStepRef.current = 'idle';
    setState({ step: 'idle' });
  }, []);

  /** 재시도 */
  const retryUpload = useCallback(
    (file: File, executablePath: string) => {
      startUpload({ file, executablePath });
    },
    [startUpload]
  );

  /** 상태 초기화 */
  const reset = useCallback(() => {
    currentStepRef.current = 'idle';
    setState({ step: 'idle' });
  }, []);

  return {
    state,
    startUpload,
    cancelUpload,
    retryUpload,
    reset,
    isUploading: [
      'requesting_presigned_url',
      'uploading_to_s3',
      'completing_upload',
    ].includes(state.step),
  };
}
