/**
 * 업로드 상태 머신 Hook
 * STS 토큰 인증 + 폴더 업로드 방식
 */
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef, useState } from 'react';

import {
  postBuildComplete,
  postStsCredentials,
  putS3FolderUpload,
} from '../api';
import type { FolderUploadProgress, UploadError, UploadState } from '../types';
import {
  analyzeCompleteError,
  analyzeStsError,
  analyzeUploadError,
} from '../utils/upload-error-handler';
import { buildKeys } from './useBuildsQuery';

export interface UseUploadStateOptions {
  gameUuid: string;
  onSuccess?: (buildId: string) => void;
  onError?: (error: UploadError) => void;
}

export interface UploadParams {
  files: File[];
  folderName: string;
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
  const currentStepRef = useRef<string>('idle');

  /** 에러 상태로 전환 */
  const setError = useCallback(
    (errorInfo: UploadError, prevBuildId?: string, prevKeyPrefix?: string) => {
      setState({
        step: 'error',
        error: errorInfo,
        buildId: prevBuildId,
        keyPrefix: prevKeyPrefix,
      });
      onError?.(errorInfo);
    },
    [onError]
  );

  /** 업로드 시작 */
  const startUpload = useCallback(
    async ({ files, folderName }: UploadParams) => {
      let buildId: string | undefined;
      let keyPrefix: string | undefined;
      let totalSize = 0;
      let fileCount = 0;

      try {
        // 파일 정보 계산
        totalSize = files.reduce((sum, file) => sum + file.size, 0);
        fileCount = files.length;

        // Step 1: STS Credentials 요청
        currentStepRef.current = 'requesting_sts_credentials';
        setState({ step: 'requesting_sts_credentials' });

        const stsResponse = await postStsCredentials(gameUuid, {
          folder_name: folderName,
          total_file_count: fileCount,
          total_size: totalSize,
        });

        buildId = stsResponse.buildId;
        keyPrefix = stsResponse.keyPrefix;

        // Step 2: S3 폴더 업로드
        currentStepRef.current = 'uploading_to_s3';
        setState({
          step: 'uploading_to_s3',
          buildId,
          keyPrefix,
          progress: {
            totalFiles: fileCount,
            uploadedFiles: 0,
            totalBytes: totalSize,
            uploadedBytes: 0,
            percent: 0,
            speed: 0,
            eta: 0,
            currentFileName: '',
          },
        });

        abortControllerRef.current = new AbortController();

        await putS3FolderUpload({
          files,
          bucket: stsResponse.bucket,
          keyPrefix,
          credentials: stsResponse.credentials,
          signal: abortControllerRef.current.signal,
          onProgress: (progress: FolderUploadProgress) => {
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
          keyPrefix,
          fileCount,
          totalSize,
        });

        await postBuildComplete(gameUuid, buildId, {
          key_prefix: keyPrefix,
          file_count: fileCount,
          total_size: totalSize,
        });

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
          errorInfo = analyzeStsError(error);
        }

        setError(errorInfo, buildId, keyPrefix);
      }
    },
    [gameUuid, setError, onSuccess, queryClient]
  );

  /** 업로드 취소 */
  const cancelUpload = useCallback(() => {
    abortControllerRef.current?.abort();
    currentStepRef.current = 'idle';
    setState({ step: 'idle' });
  }, []);

  /** 재시도 */
  const retryUpload = useCallback(
    (files: File[], folderName: string, executablePath: string) => {
      startUpload({ files, folderName, executablePath });
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
      'requesting_sts_credentials',
      'uploading_to_s3',
      'completing_upload',
    ].includes(state.step),
  };
}
