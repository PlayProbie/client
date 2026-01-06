import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { PageSpinner } from '@/components/ui/loading';
import { SURVEY_STATUS_CONFIG } from '@/config/navigation';
import { useUpdateSurveyStatus } from '@/features/game-streaming-survey';
import type { SurveyStatusValue } from '@/features/game-streaming-survey/types';
import { StatusChangeModal, type SurveyShellContext } from '@/features/survey';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';

export default function SurveyOverviewPage() {
  const { survey, isLoading, isError, refetch, surveyId } =
    useOutletContext<SurveyShellContext>();
  const { toast } = useToast();
  const [nextStatus, setNextStatus] = useState<SurveyStatusValue | null>(
    null
  );

  const surveyUuid = survey?.surveyUuid ?? surveyId ?? '';
  const {
    mutate: updateStatus,
    isPending,
  } = useUpdateSurveyStatus(surveyUuid);

  const handleModalOpenChange = (open: boolean) => {
    if (!open && !isPending) {
      setNextStatus(null);
    }
  };

  const handleConfirmStatusChange = () => {
    if (!nextStatus || !surveyUuid) return;

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

  if (!survey) {
    return (
      <InlineAlert
        variant="error"
        title="설문을 찾을 수 없습니다."
      >
        다시 확인해 주세요.
      </InlineAlert>
    );
  }

  const statusConfig = SURVEY_STATUS_CONFIG[survey.status];
  const createdAtText = new Date(survey.createdAt).toLocaleDateString();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Overview</h2>
        <p className="text-muted-foreground text-sm">
          설문 상태를 확인하고 변경할 수 있습니다.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="bg-card rounded-lg border p-6">
          <div className="space-y-4">
            <div>
              <p className="text-muted-foreground text-sm">설문 상태</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <span
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium',
                    statusConfig.color
                  )}
                >
                  {statusConfig.label}
                </span>
                <span className="text-muted-foreground text-xs">
                  {survey.status}
                </span>
              </div>
              <p className="text-muted-foreground mt-2 text-sm">
                {statusConfig.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {survey.status === 'DRAFT' && (
                <Button
                  variant="default"
                  onClick={() => setNextStatus('ACTIVE')}
                  disabled={!surveyUuid || isPending}
                >
                  설문 시작
                </Button>
              )}
              {survey.status === 'ACTIVE' && (
                <Button
                  variant="destructive"
                  onClick={() => setNextStatus('CLOSED')}
                  disabled={!surveyUuid || isPending}
                >
                  설문 종료
                </Button>
              )}
              {survey.status === 'CLOSED' && (
                <Button
                  variant="outline"
                  disabled
                >
                  설문 종료됨
                </Button>
              )}
            </div>
          </div>
        </section>

        <section className="bg-card rounded-lg border p-6">
          <p className="text-muted-foreground text-sm">기본 정보</p>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">설문명</dt>
              <dd className="font-medium">{survey.surveyName}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">설문 UUID</dt>
              <dd className="bg-muted rounded px-2 py-0.5 font-mono text-xs">
                {survey.surveyUuid}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">생성일</dt>
              <dd className="font-medium">{createdAtText}</dd>
            </div>
          </dl>
        </section>
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
