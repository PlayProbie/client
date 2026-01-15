import { useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

import type { QuestionAnalysisResult } from '../types';
import { getSentimentColorClass } from '../utils';
import { AnswerList, type AnswerListItem } from './AnswerList';
import { ClusterDetailPanel } from './ClusterDetailPanel';
import { ClusterSelector } from './ClusterSelector';

type QuestionAnalysisDetailProps = {
  readonly data: QuestionAnalysisResult;
};

/**
 * 질문별 상세 분석 뷰
 * 이미지 기반 새로운 UI:
 * - 상단: 전체 정보 요약
 * - 중단: 클러스터 선택 탭
 * - 하단: 선택된 클러스터 상세 + 원문 리스트
 */
function QuestionAnalysisDetail({ data }: QuestionAnalysisDetailProps) {
  const [selectedClusterIndex, setSelectedClusterIndex] = useState(0);

  // 데이터 유효성 검사: clusters가 없거나 비어있으면 로딩 표시
  if (!data?.clusters || data.clusters.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        클러스터 데이터를 불러오는 중...
      </div>
    );
  }

  // 선택된 인덱스가 범위를 벗어나면 0으로 리셋
  const safeClusterIndex = selectedClusterIndex < data.clusters.length ? selectedClusterIndex : 0;

  // 현재 선택된 클러스터
  const selectedCluster = data.clusters[safeClusterIndex];

  // 현재 선택된 클러스터의 대표 답변 텍스트 매핑
  const representativeAnswers = selectedCluster?.representative_answers ?? [];
  const answerList: AnswerListItem[] = representativeAnswers.map((text, index) => ({
    id: `answer-${index}`,
    text: text, // 서버에서 변환된 실제 답변 텍스트 (Q&A 형식)
    sentiment:
      selectedCluster.satisfaction >= 60
        ? 'positive'
        : selectedCluster.satisfaction <= 40
          ? 'negative'
          : 'neutral',
  }));



  return (
    <div className="space-y-6">
      {/* 상단: 전체 요약 정보 */}
      <Card className="border-primary/20 bg-linear-to-r from-primary/5 to-accent/5">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-foreground">
                질문 분석 결과
              </h2>
              <p className="text-sm text-muted-foreground">
                응답 {data.total_answers}개 • 공감 {data.sentiment.score}%
              </p>
            </div>
            
            <Badge className={`px-3 py-1 text-sm font-semibold ${getSentimentColorClass(data.sentiment.score, 'bg')} ${getSentimentColorClass(data.sentiment.score, 'bg').replace('bg-', 'text-')}-foreground`}>
              {data.sentiment.score}점
            </Badge>
          </div>
        </CardHeader>
        
        {data.meta_summary && (
          <CardContent className="pt-0">
            <p className="text-sm leading-relaxed text-foreground/80">
              {data.meta_summary}
            </p>
          </CardContent>
        )}
      </Card>

      {/* 중단: 클러스터 선택 탭 */}
      <Card>
        <CardHeader className="pb-3">
          <h3 className="text-sm font-semibold text-foreground">
            질문별 응답 요약 (의견 클러스터링)
          </h3>
        </CardHeader>
        <CardContent className="pt-0">
          <ClusterSelector
            clusters={data.clusters}
            selectedClusterIndex={safeClusterIndex}
            onSelectCluster={setSelectedClusterIndex}
          />
        </CardContent>
      </Card>

      {/* 하단: 선택된 클러스터 상세 */}
      {selectedCluster && (
        <>
          <ClusterDetailPanel
            cluster={selectedCluster}
            profiles={data.answer_profiles}
          />

          {/* 대표 답변 */}
          <AnswerList
            answers={answerList}
            title={`대표 답변 (${answerList.length}개)`}
          />
        </>
      )}
    </div>
  );
}

export { QuestionAnalysisDetail };
