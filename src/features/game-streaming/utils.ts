/**
 * Game Streaming Feature 유틸리티
 */

import { fetchWithAuth } from '@/services/api-client';

/**
 * localStorage에서 JSON 데이터 읽기
 * @param key - localStorage key
 * @param defaultValue - 파싱 실패 시 기본값
 */
export function getStoredData<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored) as T;
    }
  } catch {
    // Parse error, return default
  }
  return defaultValue;
}

/**
 * localStorage에 JSON 데이터 저장
 * @param key - localStorage key
 * @param data - 저장할 데이터
 */
export function setStoredData<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

/**
 * 바이트를 읽기 쉬운 형식으로 변환
 * @param bytes - 바이트 수
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(i > 1 ? 2 : 0)} ${sizes[i]}`;
}

/**
 * 초를 읽기 쉬운 형식으로 변환
 * @param seconds - 초
 */
export function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}초`;
  }
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}분 ${secs}초`;
  }
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}시간 ${mins}분`;
}

/**
 * 날짜를 한국어 형식으로 변환
 * @param dateString - ISO 8601 날짜 문자열
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * 날짜+시간을 한국어 형식으로 변환
 * @param dateString - ISO 8601 날짜 문자열
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ----------------------------------------
// API Fetch Utilities
// ----------------------------------------

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface FetchOptions<TBody = unknown> {
  method: HttpMethod;
  body?: TBody;
}

/**
 * API 요청 유틸리티 함수
 * @param url - API 엔드포인트
 * @param options - 요청 옵션
 * @param errorMessage - 에러 발생 시 표시할 메시지
 */
export async function apiFetch<TResponse, TBody = unknown>(
  url: string,
  options: FetchOptions<TBody>,
  errorMessage: string
): Promise<TResponse> {
  const fetchOptions: RequestInit = {
    method: options.method,
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  };

  const response = await fetchWithAuth(url, fetchOptions);

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  // DELETE 요청 시 빈 응답 처리
  if (options.method === 'DELETE') {
    return undefined as TResponse;
  }

  return response.json() as Promise<TResponse>;
}
