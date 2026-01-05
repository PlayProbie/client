import { BarChart3, MessageSquare, Smile, Users } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PageSpinner } from '@/components/ui/loading';

import { useQuestionAnalysis } from '../hooks';
import type { SurveyResultsSummary } from '../types';
import {
  calculateAverageGEQ,
  calculateAverageSentiment,
  getSentimentColorClass,
  getSentimentLabel,
} from '../utils';
import { GEQRadarChart } from './GEQRadarChart';

type SurveyOverviewProps = {
  readonly summary: SurveyResultsSummary;
  readonly surveyId: number;
};

function getSentimentBadgeClass(score: number): string {
  if (score >= 70) return 'bg-success/10 text-success';
  if (score >= 50) return 'bg-warning/10 text-warning';
  return 'bg-destructive/10 text-destructive';
}

/**
 * 설문 전체 개요 뷰
 * - 요약 통계 카드
 * - 전체 감정 분석
 * - 전체 GEQ 레이더 차트
 */
function SurveyOverview({ summary, surveyId }: SurveyOverviewProps) {
  const { data, questionIds, isLoading, isError } = useQuestionAnalysis({
    surveyId,
  });

  const averageGEQ = calculateAverageGEQ(data);
  const sentimentStats = calculateAverageSentiment(data);

  return (
    <div className="space-y-6">
      {/* 요약 통계 카드 */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-lg bg-primary/10 p-3">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">설문 수</p>
              <p className="text-2xl font-bold">{summary.surveyCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-lg bg-primary/10 p-3">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">총 응답 수</p>
              <p className="text-2xl font-bold">{summary.responseCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-lg bg-primary/10 p-3">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">분석된 질문</p>
              <p className="text-2xl font-bold">{questionIds.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-lg bg-primary/10 p-3">
              <Smile className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">감정 점수</p>
              <p
                className={`text-2xl font-bold ${getSentimentColorClass(sentimentStats.averageScore)}`}
              >
                {isLoading ? '-' : `${sentimentStats.averageScore}점`}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 분석 결과 로딩/에러 처리 */}
      {isLoading && <PageSpinner message="AI 분석 결과를 불러오는 중..." />}

      {isError && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="py-6 text-center text-destructive">
            AI 분석 결과를 불러오는 중 오류가 발생했습니다.
          </CardContent>
        </Card>
      )}

      {/* 분석 결과 */}
      {!isLoading && !isError && questionIds.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* 전체 감정 분석 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">전체 감정 분석</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">종합 점수</span>
                <span
                  className={`text-2xl font-bold ${getSentimentColorClass(sentimentStats.averageScore)}`}
                >
                  {sentimentStats.averageScore}점
                </span>
              </div>

              <div className="text-center">
                <span
                  className={`inline-block rounded-full px-4 py-2 text-sm font-medium ${getSentimentBadgeClass(sentimentStats.averageScore)}`}
                >
                  {getSentimentLabel(sentimentStats.averageScore)}
                </span>
              </div>

              {/* 감정 분포 바 */}
              <div className="space-y-2">
                <p className="text-sm font-medium">감정 분포</p>
                <div className="flex h-4 overflow-hidden rounded-full">
                  <div
                    className="bg-success transition-all"
                    style={{ width: `${sentimentStats.distribution.positive}%` }}
                  />
                  <div
                    className="bg-muted transition-all"
                    style={{ width: `${sentimentStats.distribution.neutral}%` }}
                  />
                  <div
                    className="bg-destructive transition-all"
                    style={{ width: `${sentimentStats.distribution.negative}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-success" />
                    긍정 {sentimentStats.distribution.positive}%
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-muted" />
                    중립 {sentimentStats.distribution.neutral}%
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-destructive" />
                    부정 {sentimentStats.distribution.negative}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 전체 GEQ 레이더 차트 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">유저 감정 분석 (전체 평균)</CardTitle>
            </CardHeader>
            <CardContent>
              <GEQRadarChart scores={averageGEQ} />

            </CardContent>
          </Card>
        </div>
      )}

      {/* 분석된 질문이 없는 경우 */}
      {!isLoading && !isError && questionIds.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            아직 분석된 질문이 없습니다.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export { SurveyOverview };
