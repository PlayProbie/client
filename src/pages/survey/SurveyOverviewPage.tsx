import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/Card';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { PageSpinner } from '@/components/ui/loading';
import {} from '@/components/ui/Table';
import { SURVEY_STATUS_CONFIG } from '@/config/navigation';
import { useUpdateSurveyStatus } from '@/features/game-streaming-survey';
import type { SurveyStatusValue } from '@/features/game-streaming-survey/types';
import { StatusChangeModal, type SurveyShellContext } from '@/features/survey';
import {
  ProvisioningStatusStep,
  SurveyLifecycleActions,
  SurveyStatusStep,
} from '@/features/survey/components/overview';
import { useToast } from '@/hooks/useToast';
import { useProvisioningStore } from '@/stores/useProvisioningStore';

export default function SurveyOverviewPage() {
  const { survey, isLoading, isError, refetch, surveyUuid } =
    useOutletContext<SurveyShellContext>();
  const items = useProvisioningStore((state) => state.items);
  const { toast } = useToast();
  const [nextStatus, setNextStatus] = useState<SurveyStatusValue | null>(null);

  const resolvedSurveyUuid = survey?.surveyUuid ?? surveyUuid ?? '';
  const relatedItems = items.filter(
    (item) => item.surveyUuid === resolvedSurveyUuid
  );

  const { mutate: updateStatus, isPending } =
    useUpdateSurveyStatus(resolvedSurveyUuid);

  const statusConfig = survey ? SURVEY_STATUS_CONFIG[survey.status] : null;

  const handleModalOpenChange = (open: boolean) => {
    if (!open && !isPending) {
      setNextStatus(null);
    }
  };

  const handleConfirmStatusChange = () => {
    if (!nextStatus || !resolvedSurveyUuid) return;

    updateStatus(
      { status: nextStatus },
      {
        onSuccess: () => {
          toast({
            variant: 'success',
            title: '설문 상태 변경 완료',
            description:
              nextStatus === 'ACTIVE'
                ? '설문이 시작되었습니다.'
                : '설문이 종료되었습니다.',
          });
          setNextStatus(null);
        },
        onError: (error) => {
          toast({
            variant: 'destructive',
            title: '설문 상태 변경 실패',
            description: error.message,
          });
        },
      }
    );
  };

  if (isLoading) {
    return <PageSpinner message="설문 정보를 불러오는 중..." />;
  }

  if (isError) {
    return (
      <InlineAlert
        variant="error"
        title="설문 로딩 실패"
        actions={
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
          >
            다시 시도
          </Button>
        }
      >
        설문 정보를 불러오지 못했습니다.
      </InlineAlert>
    );
  }

  if (!survey || !statusConfig) {
    return (
      <InlineAlert
        variant="error"
        title="설문을 찾을 수 없습니다."
      >
        다시 확인해 주세요.
      </InlineAlert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column: Survey Management */}
        <Card className="flex h-full flex-col overflow-hidden border-none shadow-md">
          <div className="bg-muted/30 border-b p-6 pb-4">
            <h3 className="font-semibold tracking-tight">설문 상태 및 관리</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              설문의 생명 주기 관리 및 상태 변경
            </p>
          </div>
          <CardContent className="flex flex-1 flex-col justify-between space-y-6 p-6">
            <SurveyStatusStep status={survey.status} />

            <div className="px-4">
              <SurveyLifecycleActions
                status={survey.status}
                isPending={isPending}
                canExecute={!!resolvedSurveyUuid}
                onSetStatus={setNextStatus}
              />
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Provisioning Status */}
        <Card className="flex h-full flex-col overflow-hidden border-none shadow-md">
          <div className="bg-muted/30 border-b p-6 pb-4">
            <h3 className="font-semibold tracking-tight">프로비저닝 상태</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              게임 스트리밍 리소스 프로비저닝 현황
            </p>
          </div>
          <CardContent className="flex flex-1 flex-col p-6">
            <ProvisioningStatusStep relatedItems={relatedItems} />
          </CardContent>
        </Card>
      </div>

      {nextStatus && (
        <StatusChangeModal
          open={!!nextStatus}
          onOpenChange={handleModalOpenChange}
          nextStatus={nextStatus}
          isPending={isPending}
          onConfirm={handleConfirmStatusChange}
        />
      )}
    </div>
  );
}
