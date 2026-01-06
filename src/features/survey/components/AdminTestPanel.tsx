import { Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { ButtonLoading, Skeleton, Spinner } from '@/components/ui/loading';
import {
  useResourceStatus,
  useStartTest,
  useStopTest,
} from '@/features/game-streaming-admin';
import type { StreamingResource } from '@/features/game-streaming-survey';
import { useToast } from '@/hooks/useToast';

import { StreamingStatusBadge } from './StreamingStatusBadge';

interface AdminTestPanelProps {
  surveyUuid: string;
  streamingResource: StreamingResource | null | undefined;
  isResourceLoading: boolean;
  isResourceError: boolean;
  onRefetchResource: () => void;
}

export function AdminTestPanel({
  surveyUuid,
  streamingResource,
  isResourceLoading,
  isResourceError,
  onRefetchResource,
}: AdminTestPanelProps) {
  const { toast } = useToast();
  const startTestMutation = useStartTest(surveyUuid);
  const stopTestMutation = useStopTest(surveyUuid);

  const isTesting = streamingResource?.status === 'TESTING';
  const {
    data: resourceStatus,
    isLoading: isStatusLoading,
    isError: isStatusError,
    refetch: refetchStatus,
  } = useResourceStatus(surveyUuid, !!surveyUuid && isTesting);

  const handleStartTest = () => {
    if (!surveyUuid) return;
    startTestMutation.mutate(undefined, {
      onSuccess: (data) => {
        const description =
          data.message || '관리자 테스트가 시작되었습니다.';
        toast({
          variant: 'success',
          title: '테스트 시작',
          description,
        });
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: '테스트 시작 실패',
          description: error.message,
        });
      },
    });
  };

  const handleStopTest = () => {
    if (!surveyUuid) return;
    stopTestMutation.mutate(undefined, {
      onSuccess: (data) => {
        const description =
          data.message || '관리자 테스트가 종료되었습니다.';
        toast({
          variant: 'success',
          title: '테스트 종료',
          description,
        });
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: '테스트 종료 실패',
          description: error.message,
        });
      },
    });
  };

  const renderContent = () => {
    if (isResourceLoading) {
      return (
        <div className="space-y-3">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-20 w-full" />
        </div>
      );
    }

    if (isResourceError) {
      return (
        <InlineAlert
          variant="error"
          title="리소스 조회 실패"
          actions={
            <Button
              size="sm"
              variant="outline"
              onClick={() => onRefetchResource()}
            >
              다시 시도
            </Button>
          }
        >
          스트리밍 리소스를 불러오지 못했습니다.
        </InlineAlert>
      );
    }

    if (!streamingResource) {
      return (
        <InlineAlert variant="info" title="빌드 연결 필요">
          빌드를 연결한 뒤 관리자 테스트를 진행할 수 있습니다.
        </InlineAlert>
      );
    }

    if (
      streamingResource.status === 'PENDING' ||
      streamingResource.status === 'PROVISIONING'
    ) {
      return (
        <InlineAlert variant="info" title="리소스 준비 중">
          스트리밍 리소스가 준비될 때까지 잠시 기다려주세요.
        </InlineAlert>
      );
    }

    if (
      streamingResource.status === 'SCALING' ||
      streamingResource.status === 'ACTIVE'
    ) {
      return (
        <InlineAlert variant="warning" title="서비스 운영 중">
          설문이 진행 중이므로 관리자 테스트를 실행할 수 없습니다.
        </InlineAlert>
      );
    }

    if (
      streamingResource.status === 'CLEANING' ||
      streamingResource.status === 'TERMINATED'
    ) {
      return (
        <InlineAlert variant="warning" title="리소스 정리 중">
          현재 상태에서는 테스트를 진행할 수 없습니다.
        </InlineAlert>
      );
    }

    const capacity =
      resourceStatus?.currentCapacity ?? streamingResource.currentCapacity;
    const instancesReady = resourceStatus?.instancesReady ?? false;
    const statusMessage = instancesReady
      ? '인스턴스 준비 완료'
      : isStatusLoading
        ? '상태 확인 중...'
        : '인스턴스 준비 중...';

    return (
      <div className="space-y-4">
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">현재 상태</dt>
            <dd className="mt-1 font-medium">
              <StreamingStatusBadge status={streamingResource.status} />
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">현재 Capacity</dt>
            <dd className="mt-1 font-medium">
              {capacity} / {streamingResource.maxCapacity}
            </dd>
          </div>
        </dl>

        {isTesting && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {instancesReady ? (
              <Check className="text-success size-4" />
            ) : (
              <Spinner size="sm" />
            )}
            <span>{statusMessage}</span>
          </div>
        )}

        {isStatusError && (
          <InlineAlert
            variant="warning"
            title="상태 확인 실패"
            actions={
              <Button
                size="sm"
                variant="outline"
                onClick={() => refetchStatus()}
              >
                다시 시도
              </Button>
            }
          >
            테스트 상태를 갱신하지 못했습니다.
          </InlineAlert>
        )}

        <div className="flex justify-end gap-2">
          {isTesting ? (
            <Button
              variant="destructive"
              onClick={handleStopTest}
              disabled={stopTestMutation.isPending}
            >
              <ButtonLoading
                isLoading={stopTestMutation.isPending}
                loadingText="종료 중..."
              >
                테스트 종료
              </ButtonLoading>
            </Button>
          ) : (
            <Button
              onClick={handleStartTest}
              disabled={startTestMutation.isPending}
            >
              <ButtonLoading
                isLoading={startTestMutation.isPending}
                loadingText="시작 중..."
              >
                테스트 시작
              </ButtonLoading>
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <section className="bg-card space-y-4 rounded-lg border p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">관리자 테스트</h3>
          <p className="text-muted-foreground text-sm">
            스트리밍 리소스를 0 → 1로 확장해 테스트합니다.
          </p>
        </div>
        {streamingResource && (
          <StreamingStatusBadge status={streamingResource.status} />
        )}
      </div>
      {renderContent()}
    </section>
  );
}
