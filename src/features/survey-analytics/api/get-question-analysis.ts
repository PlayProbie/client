import { API_BASE_URL } from '@/constants/api';

import type { QuestionResponseAnalysisWrapper } from '../types';

/**
 * GET /api/analytics/{surveyId} - 설문 질문별 AI 분석 결과 (SSE 스트리밍)
 * 개발 환경(MSW)에서는 일반 JSON 응답으로 처리
 */
export async function getQuestionAnalysis(
  surveyUuid: string,
  onMessage: (data: QuestionResponseAnalysisWrapper) => void,
  onError?: (error: Error) => void,
  onComplete?: () => void
): Promise<() => void> {
  // MSW 환경에서는 일반 fetch 사용
  if (import.meta.env.DEV && import.meta.env.VITE_MSW_ENABLED === 'true') {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/${surveyUuid}`);
      
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
  // 개발 환경에서는 Vite proxy를 통해야 하므로 상대 경로 사용
  const sseUrl = import.meta.env.DEV
    ? `/api/analytics/${surveyUuid}`
    : `${API_BASE_URL}/analytics/${surveyUuid}`;

  const eventSource = new EventSource(sseUrl);

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

  // 서버에서 보내는 'complete' 이벤트 리스닝
  eventSource.addEventListener('complete', () => {
    eventSource.close();
    onComplete?.();
  });

  eventSource.onerror = (event) => {
    // readyState가 CONNECTING(0)이면 재연결 시도 중이므로 무시
    if (eventSource.readyState === EventSource.CONNECTING) {
      return;
    }
    console.error('SSE connection error:', event);
    eventSource.close();
    onError?.(new Error('SSE connection failed'));
  };

  // cleanup 함수 반환
  return () => {
    eventSource.close();
  };
}
