import { API_BASE_URL } from '@/constants/api';

import type {
  AnalysisFilters,
  QuestionResponseAnalysisWrapper,
} from '../types';

/** Analytics 응답 타입 */
interface AnalyticsResponse {
  analyses: QuestionResponseAnalysisWrapper[];
  status: 'COMPLETED' | 'NO_DATA' | 'INSUFFICIENT_DATA' | 'IN_PROGRESS';
  total_questions: number;
  completed_questions: number;
  total_participants: number;
  survey_summary?: string;
}

/**
 * GET /api/analytics/{surveyUuid} - 설문 질문별 AI 분석 결과
 * SSE에서 REST API로 전환됨
 */
export async function getQuestionAnalysis(
  surveyUuid: string,
  filters: AnalysisFilters | undefined,
  onMessage: (data: QuestionResponseAnalysisWrapper) => void,
  onError?: (error: Error) => void,
  onComplete?: (totalParticipants: number, surveySummary?: string, insufficientData?: boolean, isComputing?: boolean) => void
): Promise<() => void> {
  try {
    // Query Params 생성
    const params = new URLSearchParams();
    if (filters?.gender) params.append('gender', filters.gender);
    if (filters?.ageGroup) params.append('ageGroup', filters.ageGroup);
    if (filters?.preferGenre) params.append('preferGenre', filters.preferGenre);

    const queryString = params.toString();

    // REST API 호출 (Authorization 헤더는 글로벌 인터셉터가 자동 추가)
    const baseUrl = import.meta.env.DEV
      ? `/api/analytics/${surveyUuid}`
      : `${API_BASE_URL}/analytics/${surveyUuid}`;

    const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: AnalyticsResponse = await response.json();

    // 분석 결과 순차 콜백 호출 (기존 인터페이스 호환)
    for (const item of data.analyses) {
      onMessage(item);
    }

    // IN_PROGRESS: 이전 버전 데이터를 표시하지만 계산 중 상태
    const isComputing = data.status === 'IN_PROGRESS';
    
    // 데이터 부족 여부 확인
    const isInsufficientData = data.status === 'INSUFFICIENT_DATA' || data.status === 'NO_DATA';
    
    onComplete?.(data.total_participants || 0, data.survey_summary, isInsufficientData, isComputing);

    return () => {}; // cleanup (REST는 cleanup 불필요)
  } catch (error) {
    onError?.(
      error instanceof Error ? error : new Error('Failed to fetch analytics')
    );
    return () => {};
  }
}

