import { BarChart3, MessageCircle, Tag } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardDescription,CardHeader, CardTitle } from '@/components/ui/Card';

import type { AnswerProfile, ClusterInfo } from '../types';
import { getSentimentColorClass } from '../utils';
import { ClusterDemographics } from './ClusterDemographics';
import { GEQRadarChart } from './GEQRadarChart';

type ClusterDetailPanelProps = {
  readonly cluster: ClusterInfo;
  readonly clusterIndex: number;
  readonly profiles?: Record<string, AnswerProfile>;
};

/**
 * 클러스터 상세 패널
 * 이미지의 세그먼트 분석 (Who), 원인 태그 (Why), 감정 강도 (Intensity) 영역
 */
function ClusterDetailPanel({ cluster, clusterIndex, profiles }: ClusterDetailPanelProps) {


  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg break-words leading-snug">
              클러스터 {clusterIndex + 1}: {cluster.summary}
            </CardTitle>
            <CardDescription>
              {cluster.count}명 응답 ({cluster.percentage}%)
            </CardDescription>
          </div>
          <div className="text-right shrink-0">
            <div className={`text-3xl font-bold ${getSentimentColorClass(cluster.satisfaction)}`}>
              {cluster.satisfaction}
            </div>
            <p className="text-xs text-muted-foreground">만족도</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* 왼쪽: 세그먼트 분석 (Who) & 원인 태그 (Why) */}
          <div className="space-y-4">
            {/* 유저 반응 */}
            <div className="rounded-lg border bg-card p-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="rounded-md bg-primary/10 p-1.5">
                  <MessageCircle className="h-4 w-4 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground">유저 반응</h4>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-md bg-primary/5 px-3 py-2">
                  <span className="text-sm font-medium text-foreground">
                    주요 감정: <span className="text-primary">{cluster.emotion_type}</span>
                  </span>
                  <span className="text-xs text-muted-foreground">{cluster.percentage}%</span>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {cluster.emotion_detail}
                </p>
              </div>
            </div>

            {/* 핵심 키워드 */}
            <div className="rounded-lg border bg-card p-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="rounded-md bg-accent/50 p-1.5">
                  <Tag className="h-4 w-4 text-accent-foreground" />
                </div>
                <h4 className="font-semibold text-foreground">핵심 키워드</h4>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {cluster.keywords && cluster.keywords.length > 0 ? (
                  cluster.keywords.map((keyword) => (
                    <Badge 
                      key={keyword} 
                      variant="secondary" 
                      className="px-3 py-1 text-xs"
                    >
                      #{keyword}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">키워드 정보 없음</p>
                )}
              </div>
            </div>

            {/* 감정 강도 (Intensity) - Top 3 */}
            <div className="rounded-lg border bg-card p-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="rounded-md bg-warning/20 p-1.5">
                  <BarChart3 className="h-4 w-4 text-warning" />
                </div>
                <h4 className="font-semibold text-foreground">
                  감정 강도 (Top 3)
                </h4>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">만족도</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full transition-all ${getSentimentColorClass(cluster.satisfaction, 'bg')}`}
                        style={{ width: `${cluster.satisfaction}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold">
                      {cluster.satisfaction}
                    </span>
                  </div>
                </div>

                <div className="grid gap-2">
                  {[
                    { label: '성취감', score: cluster.geq_scores.competence },
                    { label: '몰입감', score: cluster.geq_scores.immersion },
                    { label: '집중도', score: cluster.geq_scores.flow },
                    { label: '긴장감', score: cluster.geq_scores.tension },
                    { label: '도전감', score: cluster.geq_scores.challenge },
                    {
                      label: '즐거움',
                      score: cluster.geq_scores.positive_affect,
                    },
                    {
                      label: '불쾌감',
                      score: cluster.geq_scores.negative_affect,
                    },
                  ]
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 3)
                    .map((item) => (
                      <div
                        key={item.label}
                        className="flex justify-between rounded-md bg-muted/50 px-3 py-2 text-xs"
                      >
                        <span className="text-muted-foreground">
                          {item.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted-foreground/20">
                            <div
                              className="h-full bg-foreground/70"
                              style={{ width: `${item.score}%` }}
                            />
                          </div>
                          <span className="w-6 text-right font-semibold text-foreground">
                            {item.score}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>



          {/* 오른쪽: GEQ 레이더 차트 & 데모그래픽 */}
          <div className="space-y-6">
            <div className="rounded-lg border bg-card p-4">
              <div className="mb-2">
                <h4 className="font-semibold text-foreground">유저 감정 분석</h4>
              </div>
              
              <div className="flex items-center justify-center">
                <GEQRadarChart scores={cluster.geq_scores} />
              </div>
            </div>

            {/* 인구통계 정보 */}
            <ClusterDemographics 
              answerIds={cluster.answer_ids}
              profiles={profiles}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { ClusterDetailPanel };
