import { useEffect, useRef, useState } from 'react';

import { getQuestionAnalysis } from '../api';
import type {
  AnalysisFilters,
  QuestionAnalysisResult,
  QuestionResponseAnalysisWrapper,
} from '../types';

type UseQuestionAnalysisOptions = {
  surveyUuid: string | null;
  filters?: AnalysisFilters;
  enabled?: boolean;
};

type QuestionAnalysisState = {
  [questionId: number]: QuestionAnalysisResult;
};

/**
 * 설문 질문별 AI 분석 결과 페칭 훅 (SSE)
 */
export function useQuestionAnalysis({
  surveyUuid,
  filters,
  enabled = true,
}: UseQuestionAnalysisOptions) {
  // 단일 객체 상태로 통합
  const [state, setState] = useState({
    data: {} as QuestionAnalysisState,
    error: null as Error | null,
    status: 'idle' as 'idle' | 'loading' | 'complete' | 'error',
    totalParticipants: 0,
    surveySummary: '' as string,
    insufficientData: false,
    isComputing: false, // AI가 계산 중인지 여부
    isBackgroundRefreshing: false, // 백그라운드 갱신 중 여부 (silent refetch)
  });

  // ref를 사용해 중복 요청 방지 (React StrictMode 대응)
  const requestedSurveyUuidRef = useRef<string | null>(null);
  const lastFilterKeyRef = useRef<string>('{}');
  // 요청 시점의 필터 키 저장 (응답 수신 시 비교용)
  const requestFilterKeyRef = useRef<string>('{}');
  const isRequestingRef = useRef(false);
  // silent refetch 여부 (true면 기존 데이터 유지, 로딩 UI 숨김)
  const silentRefetchRef = useRef(false);

  // Derived state (계산된 값)
  const isLoading = state.status === 'loading';
  const isError = state.status === 'error';
  const isComplete = state.status === 'complete';

  // Refetch control - 단일 refetch만 허용
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const refetch = (options?: { silent?: boolean }) => {
    // 이미 요청 중이면 무시 (중복 refetch 방지)
    if (isRequestingRef.current) {
      return;
    }
    // silent 옵션 저장 (true면 기존 데이터 유지, 로딩 UI 숨김)
    silentRefetchRef.current = options?.silent ?? false;
    // Reset requesting ref to allow new request
    requestedSurveyUuidRef.current = null;
    setRefetchTrigger((c) => c + 1);
  };

  useEffect(() => {
    if (!surveyUuid || !enabled) {
      return;
    }

    // 필터 직렬화하여 비교 (변경 감지용)
    const currentFilterKey = JSON.stringify(filters ?? {});

    // 이미 요청 중이면 스킵 (동일 필터+surveyUuid로 진행 중인 요청)
    if (isRequestingRef.current) {
      return;
    }

    // 같은 surveyUuid+필터로 완료된 요청이 있으면 스킵
    // 조건:
    // 1. requestedSurveyUuidRef가 null이 아님 (이미 한 번 요청 완료)
    // 2. 같은 surveyUuid
    // 3. 같은 필터
    // refetchTrigger가 변경되면 위 조건과 관계없이 재요청
    if (
      requestedSurveyUuidRef.current !== null &&
      surveyUuid === requestedSurveyUuidRef.current &&
      currentFilterKey === lastFilterKeyRef.current
    ) {
      return;
    }

    requestedSurveyUuidRef.current = surveyUuid;
    lastFilterKeyRef.current = currentFilterKey;
    requestFilterKeyRef.current = currentFilterKey;
    isRequestingRef.current = true;

    // silent 모드: 기존 데이터 유지, 백그라운드 갱신 표시만
    // 일반 모드: 전체 초기화 + 로딩 상태
    if (silentRefetchRef.current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState((prev) => ({
        ...prev,
        isBackgroundRefreshing: true,
      }));
    } else {
      setState({
        data: {},
        error: null,
        status: 'loading',
        totalParticipants: 0,
        surveySummary: '',
        insufficientData: false,
        isComputing: false,
        isBackgroundRefreshing: false,
      });
    }

    let cleanupFn: (() => void) | null = null;
    let isCancelled = false;

    getQuestionAnalysis(
      surveyUuid,
      filters,
      (item: QuestionResponseAnalysisWrapper) => {
        if (isCancelled) return;
        // 필터가 변경되었으면 무시 (중요!)
        if (requestFilterKeyRef.current !== currentFilterKey) {
          return;
        }
        // 질문별 분석 결과를 받을 때마다 상태 업데이트
        try {
          const parsed: QuestionAnalysisResult = JSON.parse(item.result_json);
          setState((prev) => ({
            ...prev,
            data: {
              ...prev.data,
              [item.fixed_question_id]: parsed,
            },
          }));
        } catch {
          // JSON 파싱 실패 시 무시
        }
      },
      (err: Error) => {
        if (isCancelled) return;
        setState((prev) => ({
          ...prev,
          error: err,
          status: 'error',
          isBackgroundRefreshing: false,
        }));
        isRequestingRef.current = false;
        silentRefetchRef.current = false;
        // 에러 시에는 재시도할 수 있도록 requestedSurveyUuidRef 초기화
        requestedSurveyUuidRef.current = null;
      },
      (
        totalParticipants: number,
        surveySummary?: string,
        insufficientData?: boolean,
        isComputing?: boolean
      ) => {
        // 필터가 변경되었으면 무시 (문제 4번 해결)
        if (requestFilterKeyRef.current !== currentFilterKey) {
          isRequestingRef.current = false;
          return;
        }
        setState((prev) => ({
          ...prev,
          status: 'complete',
          totalParticipants,
          surveySummary: surveySummary || '',
          insufficientData: insufficientData || false,
          isComputing: isComputing || false, // AI 계산 중인지 여부
          isBackgroundRefreshing: false, // 갱신 완료
        }));
        isRequestingRef.current = false;
        silentRefetchRef.current = false;
        // 성공 완료 시에는 requestedSurveyUuidRef 유지 (중복 요청 방지)
      }
    ).then((cleanup) => {
      cleanupFn = cleanup;
    });

    return () => {
      isCancelled = true;
      cleanupFn?.();
      isRequestingRef.current = false;
      // 언마운트 시 ref 초기화 (StrictMode에서 두 번째 마운트 시 재요청 허용)
      requestedSurveyUuidRef.current = null;
    };
  }, [
    surveyUuid,
    enabled,
    refetchTrigger,
    filters?.gender,
    filters?.ageGroup,
    filters?.preferGenre,
    filters,
  ]);

  return {
    data: state.data,
    questionIds: Object.keys(state.data).map(Number),
    refetch,
    isLoading,
    isError,
    error: state.error,
    isComplete,
    totalParticipants: state.totalParticipants,
    surveySummary: state.surveySummary,
    insufficientData: state.insufficientData,
    isComputing: state.isComputing, // AI 계산 중 여부
    isBackgroundRefreshing: state.isBackgroundRefreshing, // 백그라운드 갱신 중 여부
  };
}
