/**
 * 전역 업로드 상태 관리 스토어
 * 페이지 이동 시에도 업로드가 유지되도록 Zustand로 관리
 */
import { useQueryClient } from '@tanstack/react-query';
import { create } from 'zustand';

import {
  createTestGame,
  postBuildComplete,
  postCreateBuild,
  putS3FolderUpload,
} from '@/features/game-streaming/api';
import { buildKeys } from '@/features/game-streaming/hooks';
import type {
  FolderUploadProgress,
  UploadError,
  UploadState,
} from '@/features/game-streaming/types';
import {
  analyzeCompleteError,
  analyzeStsError,
  analyzeUploadError,
} from '@/features/game-streaming/utils/upload-error-handler';

// ----------------------------------------
// Types
// ----------------------------------------

/** 업로드 단건 항목 */
export interface UploadItem {
  id: string;
  gameUuid: string;
  gameName: string;
  folderName: string;
  state: UploadState;
  files: File[];
  executablePath: string;
  version?: string;
  note?: string;
  startedAt: number;
  abortController?: AbortController;
}

/** 업로드 시작 파라미터 */
export interface StartUploadParams {
  gameUuid: string;
  gameName: string;
  files: File[];
  folderName: string;
  executablePath: string;
  version?: string;
  note?: string;
}

interface UploadStoreState {
  /** 업로드 항목 목록 */
  uploads: UploadItem[];
  /** 위젯 최소화 상태 */
  isMinimized: boolean;
}

interface UploadStoreActions {
  /** 업로드 시작 */
  startUpload: (params: StartUploadParams) => string;
  /** 업로드 진행률 업데이트 */
  updateProgress: (id: string, progress: FolderUploadProgress) => void;
  /** 업로드 상태 업데이트 */
  updateState: (id: string, state: UploadState) => void;
  /** 업로드 에러 설정 */
  setError: (id: string, error: UploadError) => void;
  /** 업로드 취소 */
  cancelUpload: (id: string) => void;
  /** 업로드 항목 제거 */
  removeUpload: (id: string) => void;
  /** 모든 완료된 업로드 제거 */
  clearCompleted: () => void;
  /** 위젯 최소화 토글 */
  toggleMinimize: () => void;
}

type UploadStore = UploadStoreState & UploadStoreActions;

// ----------------------------------------
// Store
// ----------------------------------------

export const useUploadStore = create<UploadStore>()((set, get) => ({
  // State
  uploads: [],
  isMinimized: false,

  // Actions
  startUpload: (params) => {
    const id = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const abortController = new AbortController();

    const newItem: UploadItem = {
      id,
      gameUuid: params.gameUuid,
      gameName: params.gameName,
      folderName: params.folderName,
      files: params.files,
      executablePath: params.executablePath,
      version: params.version,
      note: params.note,
      state: { step: 'idle' },
      startedAt: Date.now(),
      abortController,
    };

    set((state) => ({
      uploads: [...state.uploads, newItem],
      isMinimized: false, // 새 업로드 시작 시 위젯 펼치기
    }));

    // 비동기로 업로드 진행
    executeUpload(id, params, abortController);

    return id;
  },

  updateProgress: (id, progress) => {
    set((state) => ({
      uploads: state.uploads.map((item) =>
        item.id === id && item.state.step === 'uploading_to_s3'
          ? {
              ...item,
              state: { ...item.state, progress } as UploadState,
            }
          : item
      ),
    }));
  },

  updateState: (id, newState) => {
    set((state) => ({
      uploads: state.uploads.map((item) =>
        item.id === id ? { ...item, state: newState } : item
      ),
    }));
  },

  setError: (id, error) => {
    set((state) => ({
      uploads: state.uploads.map((item) =>
        item.id === id
          ? {
              ...item,
              state: {
                step: 'error',
                error,
                buildId:
                  item.state.step === 'uploading_to_s3' ||
                  item.state.step === 'completing_upload'
                    ? (item.state as { buildId?: string }).buildId
                    : undefined,
              } as UploadState,
            }
          : item
      ),
    }));
  },

  cancelUpload: (id) => {
    const { uploads } = get();
    const item = uploads.find((u) => u.id === id);
    if (item?.abortController) {
      item.abortController.abort();
    }
    set((state) => ({
      uploads: state.uploads.filter((u) => u.id !== id),
    }));
  },

  removeUpload: (id) => {
    set((state) => ({
      uploads: state.uploads.filter((u) => u.id !== id),
    }));
  },

  clearCompleted: () => {
    set((state) => ({
      uploads: state.uploads.filter(
        (u) => u.state.step !== 'success' && u.state.step !== 'error'
      ),
    }));
  },

  toggleMinimize: () => {
    set((state) => ({ isMinimized: !state.isMinimized }));
  },
}));

// ----------------------------------------
// Upload Execution (Side Effect)
// ----------------------------------------

async function executeUpload(
  id: string,
  params: StartUploadParams,
  abortController: AbortController
) {
  const store = useUploadStore.getState();
  const { files, version } = params;

  let buildId: string | undefined;
  let s3Prefix: string | undefined;
  let currentStep = 'requesting_sts_credentials';

  try {
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const fileCount = files.length;

    const gameUuid = await createTestGame();

    // Step 1: 빌드 생성 및 STS Credentials 요청
    store.updateState(id, { step: 'requesting_sts_credentials' });

    const buildResponse = await postCreateBuild(gameUuid, {
      version: version || '1.0.0',
    });

    buildId = buildResponse.buildId;
    // IAM Policy: arn:aws:s3:::{bucketName}/{gameUuid}/{buildUuid}/*
    // 서버의 s3Prefix 대신 gameUuid/buildId 형식으로 keyPrefix 구성
    s3Prefix = `${gameUuid}/${buildId}`;

    // Step 2: S3 폴더 업로드
    currentStep = 'uploading_to_s3';
    store.updateState(id, {
      step: 'uploading_to_s3',
      buildId,
      keyPrefix: s3Prefix,
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

    // S3 버킷은 credentials에서 추론하거나 환경변수로 설정 필요
    const bucket = import.meta.env.VITE_S3_BUCKET || 'playprobie-builds';

    await putS3FolderUpload({
      files,
      bucket,
      keyPrefix: s3Prefix,
      credentials: buildResponse.credentials,
      signal: abortController.signal,
      onProgress: (progress) => {
        store.updateProgress(id, progress);
      },
    });

    // Step 3: Complete 요청
    currentStep = 'completing_upload';
    store.updateState(id, {
      step: 'completing_upload',
      buildId,
      keyPrefix: s3Prefix,
      fileCount,
      totalSize,
    });

    await postBuildComplete(gameUuid, buildId, {
      expected_file_count: fileCount,
      expected_total_size: totalSize,
      executable_path: params.executablePath,
      os_type: 'WINDOWS', // 현재는 Windows만 지원
      instance_type: 'g4dn.xlarge', // 기본값
      max_capacity: 10, // 기본값 (나중에 StreamSettings에서 관리)
    });

    // Success
    store.updateState(id, { step: 'success', buildId });
  } catch (err) {
    const error = err as Error & { code?: string };

    // AbortError는 사용자 취소이므로 무시
    if (error.name === 'AbortError') {
      return;
    }

    // 현재 단계에 따라 에러 분석
    let errorInfo: UploadError;

    if (currentStep === 'uploading_to_s3') {
      errorInfo = analyzeUploadError(error);
    } else if (currentStep === 'completing_upload') {
      errorInfo = analyzeCompleteError(error);
    } else {
      errorInfo = analyzeStsError(error);
    }

    store.setError(id, errorInfo);
  }
}

// ----------------------------------------
// Derived Selectors
// ----------------------------------------

/** 진행중인 업로드가 있는지 */
export const selectHasActiveUploads = (state: UploadStore) =>
  state.uploads.some((u) =>
    [
      'requesting_sts_credentials',
      'uploading_to_s3',
      'completing_upload',
    ].includes(u.state.step)
  );

/** 전체 업로드 진행률 (0-100) */
export const selectOverallProgress = (state: UploadStore) => {
  const activeUploads = state.uploads.filter(
    (u) => u.state.step === 'uploading_to_s3'
  );
  if (activeUploads.length === 0) return 0;

  const totalBytes = activeUploads.reduce((sum, u) => {
    const progress = (u.state as { progress?: FolderUploadProgress }).progress;
    return sum + (progress?.totalBytes || 0);
  }, 0);

  const uploadedBytes = activeUploads.reduce((sum, u) => {
    const progress = (u.state as { progress?: FolderUploadProgress }).progress;
    return sum + (progress?.uploadedBytes || 0);
  }, 0);

  return totalBytes > 0 ? Math.round((uploadedBytes / totalBytes) * 100) : 0;
};

// ----------------------------------------
// Hook for Query Invalidation
// ----------------------------------------

/**
 * 업로드 완료 시 쿼리 무효화를 위한 훅
 * 컴포넌트에서 사용하여 업로드 완료 시 빌드 목록 갱신
 */
export function useUploadQueryInvalidation() {
  const queryClient = useQueryClient();

  const invalidateBuildQuery = (gameUuid: string) => {
    queryClient.invalidateQueries({ queryKey: buildKeys.list(gameUuid) });
  };

  return { invalidateBuildQuery };
}
