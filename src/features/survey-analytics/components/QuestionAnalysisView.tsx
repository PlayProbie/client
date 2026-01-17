import { useState } from 'react';

import { PageSpinner } from '@/components/ui/loading';

import type { QuestionAnalysisResult } from '../types';
import { QuestionAnalysisDetail } from './QuestionAnalysisDetail';
import { QuestionListSidebar } from './QuestionListSidebar';

type QuestionAnalysisState = {
  [questionId: number]: QuestionAnalysisResult;
};

type QuestionAnalysisData = {
  data: QuestionAnalysisState;
  questionIds: number[];
  isLoading: boolean;
  isError: boolean;
  insufficientData?: boolean;
  isComputing?: boolean; // AI 계산 중 여부
};

type QuestionAnalysisViewProps = {
  readonly questionAnalysis: QuestionAnalysisData;
  /** 필터가 적용된 상태인지 여부 (데이터 부족 메시지 분기용) */
  readonly isFiltered?: boolean;
};

import { InsufficientDataWarning } from './InsufficientDataWarning';

/**
 * 질문별 분석 메인 뷰
 * - 왼쪽: 질문 목록
 * - 오른쪽: 선택한 질문의 상세 분석
 */
function QuestionAnalysisView({ questionAnalysis, isFiltered = false }: QuestionAnalysisViewProps) {
  const { data, questionIds, isLoading, isError, insufficientData, isComputing } = questionAnalysis;

  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(
    null
  );

  // 첫 번째 질문 자동 선택: selectedQuestionId가 없고 questionIds가 있으면 첫 번째 선택
  const effectiveSelectedId =
    selectedQuestionId ?? (questionIds.length > 0 ? questionIds[0] : null);

  const selectedQuestion = effectiveSelectedId
    ? data[effectiveSelectedId]
    : null;

  if (isLoading) {
    return (
      <PageSpinner message="AI 분석 결과를 불러오는 중..." />
    );
  }

  if (isError) {
    return (
      <div className="py-12 text-center text-destructive">
        AI 분석 결과를 불러오는 중 오류가 발생했습니다.
      </div>
    );
  }

  // AI 계산 중이고 캐시된 데이터가 없으면 로딩 표시
  if (isComputing && questionIds.length === 0) {
    return (
      <PageSpinner message="AI가 분석 중입니다..." />
    );
  }

  // 데이터 부족 경고 표시 (문제 5번 해결)
  if (insufficientData) {
    return (
      <InsufficientDataWarning isFiltered={isFiltered} />
    );
  }

  if (questionIds.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        분석할 질문이 없습니다.
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* 왼쪽: 질문 목록 */}
      <QuestionListSidebar
        questions={data}
        questionIds={questionIds}
        selectedQuestionId={effectiveSelectedId}
        onSelectQuestion={setSelectedQuestionId}
      />

      {/* 오른쪽: 선택한 질문 상세 */}
      <div className="min-w-0 flex-1">
        {selectedQuestion ? (
          <QuestionAnalysisDetail data={selectedQuestion} />
        ) : (
          <div className="flex h-96 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="mt-2 text-sm text-muted-foreground">왼쪽에서 질문을 선택해주세요</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { QuestionAnalysisView };

