import { API_BASE_URL } from '@/constants/api';

import type { QuestionResponseAnalysisWrapper } from '../types';

/**
 * GET /api/analytics/{surveyId} - 설문 질문별 AI 분석 결과 (SSE 스트리밍)
 * 개발 환경(MSW)에서는 일반 JSON 응답으로 처리
 */
export async function getQuestionAnalysis(
  surveyId: number,
  onMessage: (data: QuestionResponseAnalysisWrapper) => void,
  onError?: (error: Error) => void,
  onComplete?: () => void
): Promise<() => void> {
  // MSW 환경에서는 일반 fetch 사용
  if (import.meta.env.DEV && import.meta.env.VITE_MSW_ENABLED === 'true') {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/${surveyId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: QuestionResponseAnalysisWrapper[] = await response.json();
      
      // 배열로 받은 데이터를 순차적으로 처리 (SSE 시뮬레이션)
      for (const item of data) {
        onMessage(item);
      }
      
      onComplete?.();
      
      // cleanup 함수 (MSW에서는 아무 것도 안 함)
      return () => {};
    } catch (error) {
      onError?.(
        error instanceof Error ? error : new Error('Failed to fetch analytics')
      );
      return () => {};
    }
  }

  // 프로덕션: 실제 SSE 사용
  const eventSource = new EventSource(
    `${API_BASE_URL}/analytics/${surveyId}`
  );

  eventSource.onmessage = (event) => {
    try {
      const data: QuestionResponseAnalysisWrapper = JSON.parse(event.data);
      onMessage(data);
    } catch (error) {
      console.error('Failed to parse SSE data:', error);
      onError?.(
        error instanceof Error ? error : new Error('Failed to parse SSE data')
      );
    }
  };

  eventSource.onerror = (event) => {
    console.error('SSE connection error:', event);
    eventSource.close();
    onError?.(new Error('SSE connection failed'));
  };

  // SSE 완료 감지 (서버에서 연결 종료 시)
  const originalOnError = eventSource.onerror;
  eventSource.onerror = (event) => {
    // readyState가 CLOSED(2)면 정상 종료로 간주
    if (eventSource.readyState === EventSource.CLOSED) {
      onComplete?.();
    } else {
      originalOnError?.call(eventSource, event);
    }
  };

  // cleanup 함수 반환
  return () => {
    eventSource.close();
  };
}
