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

  // AccessDenied
  if (
    error.message?.includes('AccessDenied') ||
    error.code === 'AccessDenied'
  ) {
    return {
      step: 'upload',
      message: 'S3 접근 권한이 없습니다.',
      retriable: false,
    };
  }

  // 자격증명 만료
  if (
    error.message?.includes('ExpiredToken') ||
    error.message?.includes('expired') ||
    error.code === 'ExpiredTokenException'
  ) {
    return {
      step: 'upload',
      message: '업로드 인증이 만료되었습니다. 다시 시작해주세요.',
      retriable: false,
    };
  }

  // 파일 읽기 실패
  if (
    error.message?.includes('could not be read') ||
    error.name === 'NotReadableError'
  ) {
    return {
      step: 'upload',
      message: `파일을 읽을 수 없습니다: ${error.message}`,
      retriable: true,
    };
  }

  // 네트워크 에러
  if (
    error.message?.includes('timeout') ||
    error.message?.includes('network') ||
    error.message?.includes('NetworkError')
  ) {
    return {
      step: 'upload',
      message: '네트워크 문제로 업로드가 중단되었습니다.',
      retriable: true,
    };
  }

  // 기본 업로드 에러
  return {
    step: 'upload',
    message: error.message || '업로드 중 오류가 발생했습니다.',
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
 * STS Credentials 에러를 분석하여 사용자 친화적 에러 정보 반환
 */
export function analyzeStsError(
  error: Error & { code?: string }
): UploadErrorInfo {
  return {
    step: 'sts',
    message: error.message || '업로드 인증 정보 발급 실패',
    retriable: true,
    code: error.code,
  };
}
