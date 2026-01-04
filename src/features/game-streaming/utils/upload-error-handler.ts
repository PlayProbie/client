/**
 * 업로드 에러 처리 유틸리티
 * 단일 관심사: 에러 유형에 따른 메시지 매핑
 */
import type { UploadErrorStep } from '../types';

export interface UploadErrorInfo {
  step: UploadErrorStep;
  message: string;
  retriable: boolean;
  code?: string;
}

/**
 * S3 업로드 에러를 분석하여 사용자 친화적 에러 정보 반환
 */
export function analyzeUploadError(
  error: Error & { code?: string }
): UploadErrorInfo {
  // 사용자 취소
  if (error.name === 'AbortError') {
    return {
      step: 'upload',
      message: '업로드가 취소되었습니다.',
      retriable: false,
    };
  }

  // CORS 에러
  if (error.message?.includes('CORS')) {
    return {
      step: 'upload',
      message: 'CORS 설정 문제로 업로드가 차단되었습니다.',
      retriable: true,
    };
  }

  // 네트워크 에러
  if (
    error.message?.includes('timeout') ||
    error.message?.includes('network')
  ) {
    return {
      step: 'upload',
      message: '네트워크 문제로 업로드가 중단되었습니다.',
      retriable: true,
    };
  }

  // URL 만료 (기본 S3 업로드 에러)
  return {
    step: 'upload',
    message: '업로드 URL이 만료되었을 수 있습니다.',
    retriable: true,
  };
}

/**
 * Complete API 에러를 분석하여 사용자 친화적 에러 정보 반환
 */
export function analyzeCompleteError(
  error: Error & { code?: string }
): UploadErrorInfo {
  const isRetriable = error.code === 'G004';

  return {
    step: 'complete',
    message: error.message || '빌드 완료 처리에 실패했습니다.',
    retriable: isRetriable,
    code: error.code,
  };
}

/**
 * Presigned URL 에러를 분석하여 사용자 친화적 에러 정보 반환
 */
export function analyzePresignedError(
  error: Error & { code?: string }
): UploadErrorInfo {
  return {
    step: 'presigned',
    message: error.message || '업로드 URL 발급 실패',
    retriable: true,
    code: error.code,
  };
}
