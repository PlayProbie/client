import { BarChart3, MessageCircle, Tag } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';

import type { AnswerProfile, ClusterInfo } from '../types';
import { getSentimentColorClass } from '../utils';
import { ClusterDemographics } from './ClusterDemographics';
import { GEQRadarChart } from './GEQRadarChart';

type ClusterDetailPanelProps = {
  readonly cluster: ClusterInfo;
  readonly profiles?: Record<string, AnswerProfile>;
};

/**
 * 클러스터 상세 패널
 * 이미지의 세그먼트 분석 (Who), 원인 태그 (Why), 감정 강도 (Intensity) 영역
 */
function ClusterDetailPanel({ cluster, profiles }: ClusterDetailPanelProps) {
  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-lg leading-snug break-words">
              {cluster.summary}
            </CardTitle>
            <CardDescription>
              {cluster.count}명 응답 ({cluster.percentage}%)
            </CardDescription>
          </div>
          <div className="shrink-0 text-right">
            <div
              className={`text-3xl font-bold ${getSentimentColorClass(cluster.satisfaction)}`}
            >
              {cluster.satisfaction}
            </div>
            <p className="text-muted-foreground text-xs">만족도</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* 왼쪽: 세그먼트 분석 (Who) & 원인 태그 (Why) */}
          <div className="space-y-4">
            {/* 유저 반응 */}
            <div className="bg-card rounded-lg border p-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="bg-primary/10 rounded-md p-1.5">
                  <MessageCircle className="text-primary h-4 w-4" />
                </div>
                <h4 className="text-foreground font-semibold">유저 반응</h4>
              </div>

              <div className="space-y-3">
                <div className="bg-primary/5 flex items-center justify-between rounded-md px-3 py-2">
                  <span className="text-foreground text-sm font-medium">
                    주요 감정:{' '}
                    <span className="text-primary">{cluster.emotion_type}</span>
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {cluster.percentage}%
                  </span>
                </div>

                <p className="text-muted-foreground text-sm">
                  {cluster.emotion_detail}
                </p>
              </div>
            </div>

            {/* 핵심 키워드 */}
            <div className="bg-card rounded-lg border p-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="bg-accent/50 rounded-md p-1.5">
                  <Tag className="text-accent-foreground h-4 w-4" />
                </div>
                <h4 className="text-foreground font-semibold">핵심 키워드</h4>
              </div>

              <div className="flex flex-wrap gap-2">
                {cluster.keywords && cluster.keywords.length > 0 ? (
                  cluster.keywords.map((keyword) => (
                    <Badge
                      key={keyword}
                      variant="secondary"
                      className="bg-primary/10 text-primary hover:bg-primary/20 rounded-md px-2.5 py-0.5 text-xs font-medium"
                    >
                      #{keyword}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">
                    키워드 정보 없음
                  </p>
                )}
              </div>
            </div>

            {/* 감정 강도 (Intensity) - Top 3 */}
            <div className="bg-card rounded-lg border p-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="bg-warning/20 rounded-md p-1.5">
                  <BarChart3 className="text-warning h-4 w-4" />
                </div>
                <h4 className="text-foreground font-semibold">
                  감정 강도 (Top 3)
                </h4>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">만족도</span>
                  <div className="flex items-center gap-2">
                    <div className="bg-muted h-2 w-32 overflow-hidden rounded-full">
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
                        className="bg-muted/50 flex justify-between rounded-md px-3 py-2 text-xs"
                      >
                        <span className="text-muted-foreground">
                          {item.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="bg-muted-foreground/20 h-1.5 w-16 overflow-hidden rounded-full">
                            <div
                              className="bg-foreground/70 h-full"
                              style={{ width: `${item.score}%` }}
                            />
                          </div>
                          <span className="text-foreground w-6 text-right font-semibold">
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
            <div className="bg-card rounded-lg border p-4">
              <div className="mb-2">
                <h4 className="text-foreground font-semibold">
                  유저 감정 분석
                </h4>
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
