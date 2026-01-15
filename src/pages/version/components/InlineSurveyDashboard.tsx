/**
 * InlineSurveyDashboard
 *
 * 버전 상세 페이지 내에서 선택된 설문의 대시보드를 인라인으로 표시
 */

import { X } from 'lucide-react';
import { useEffect } from 'react';

import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Skeleton } from '@/components/ui/loading/Skeleton';
import { StreamingResourceStatus, useStreamingResource } from '@/features/game-streaming-survey';
import type { SurveyStatus, SurveyStatusValue } from '@/features/game-streaming-survey/types';
import {
  ProvisioningStatusStep,
  SurveyLifecycleActions,
  SurveyStatusStep,
} from '@/features/survey/components/overview';
import { DistributionCard } from '@/features/survey/components/overview/DistributionCard';
import {
  getSurveyPlayUrl,
  getSurveySessionUrl,
} from '@/features/survey/utils/url';
import {
  mapToProvisioningStatus,
  useProvisioningStore,
} from '@/stores/useProvisioningStore';

interface InlineSurveyDashboardProps {
  surveyUuid: string;
  surveyName: string;
  surveyStatus: SurveyStatusValue;
  onClose: () => void;
}

export function InlineSurveyDashboard({
  surveyUuid,
  surveyName,
  surveyStatus,
  onClose,
}: InlineSurveyDashboardProps) {
  const items = useProvisioningStore((state) => state.items);
  const restoreItem = useProvisioningStore((state) => state.restoreItem);

  const relatedItems = items.filter((item) => item.surveyUuid === surveyUuid);

  // 스토어에 해당 survey의 아이템이 없을 때만 API 조회
  const shouldFetchResource = !!surveyUuid && relatedItems.length === 0;
  const { data: streamingResource, isLoading } = useStreamingResource(surveyUuid, shouldFetchResource);

  // API 응답으로 스토어 복원
  useEffect(() => {
    if (!streamingResource || !surveyUuid) return;
    if (streamingResource.status === StreamingResourceStatus.TERMINATED) return;

    const mappedStatus = mapToProvisioningStatus(streamingResource.status);
    restoreItem({
      surveyUuid,
      status: mappedStatus,
    });
  }, [streamingResource, surveyUuid, restoreItem]);

  const surveySessionUrl = surveyUuid ? getSurveySessionUrl(surveyUuid) : '';
  const surveyPlayUrl = surveyUuid ? getSurveyPlayUrl(surveyUuid) : '';

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <span>📋</span>
          {surveyName}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="size-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column: Survey Management */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">설문 상태</h4>
            <SurveyStatusStep status={surveyStatus} />
            <SurveyLifecycleActions
              status={surveyStatus}
              isPending={false}
              canExecute={true}
              onSetStatus={() => {}}
            />
          </div>

          {/* Right Column: Provisioning Status */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">프로비저닝 상태</h4>
            {isLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <ProvisioningStatusStep relatedItems={relatedItems} />
            )}
          </div>

          {/* Distribution Cards */}
          <DistributionCard
            title="인터뷰 링크"
            description="for 설문"
            url={surveySessionUrl}
            isLoading={false}
            enabled={surveyStatus === 'ACTIVE'}
          />

          <DistributionCard
            title="게임 플레이 링크"
            description="for 설문 & 게임"
            url={surveyPlayUrl}
            isLoading={false}
            enabled={
              surveyStatus === 'ACTIVE' &&
              relatedItems.length > 0 &&
              (relatedItems[relatedItems.length - 1].status === 'READY' ||
                relatedItems[relatedItems.length - 1].status === 'ACTIVE')
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}

