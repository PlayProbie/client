import { useActionState, useState } from 'react';

import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { Skeleton } from '@/components/ui/loading';
import type { Build } from '@/features/game-streaming';
import { useBuildsQuery } from '@/features/game-streaming';
import type {
  CreateStreamingResourceRequest,
  StreamingResource,
} from '@/features/game-streaming-survey';
import {
  useCreateStreamingResource,
  useDeleteStreamingResource,
} from '@/features/game-streaming-survey';
import { useToast } from '@/hooks/useToast';

import { BuildConnectionNoResourceState } from './build-connection/BuildConnectionNoResourceState';
import { BuildConnectionSummary } from './build-connection/BuildConnectionSummary';
import { StreamingStatusBadge } from './StreamingStatusBadge';

interface BuildConnectionCardProps {
  gameUuid: string;
  surveyUuid: string;
  streamingResource: StreamingResource | null | undefined;
  isResourceLoading: boolean;
  isResourceError: boolean;
  onRefetchResource: () => void;
}

interface FormState {
  error: string | null;
}

const initialState: FormState = {
  error: null,
};

type ToastFn = ReturnType<typeof useToast>['toast'];

type CreateStreamingResource = (
  request: CreateStreamingResourceRequest
) => Promise<StreamingResource>;

interface BuildConnectionActionDeps {
  surveyUuid: string;
  builds: Build[] | undefined;
  createStreamingResource: CreateStreamingResource;
  toast: ToastFn;
}

function BuildConnectionSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}

function createBuildConnectionAction({
  surveyUuid,
  builds,
  createStreamingResource,
  toast,
}: BuildConnectionActionDeps) {
  return async (_prevState: FormState, formData: FormData): Promise<FormState> => {
    const buildUuid = (formData.get('buildUuid') as string)?.trim();
    const instanceType = (formData.get('instanceType') as string)?.trim();
    const maxCapacityValue = (formData.get('maxCapacity') as string)?.trim();

    if (!surveyUuid) {
      return { error: '설문 정보를 확인할 수 없습니다.' };
    }

    if (!buildUuid) {
      return { error: '빌드를 선택해주세요.' };
    }

    if (!instanceType) {
      return { error: '인스턴스 타입을 선택해주세요.' };
    }

    const maxCapacity = Number(maxCapacityValue);
    if (!Number.isFinite(maxCapacity) || maxCapacity < 1) {
      return { error: '목표 동시 접속자 수는 1 이상이어야 합니다.' };
    }

    const selectedBuild = builds?.find((build) => build.uuid === buildUuid);
    if (!selectedBuild) {
      return { error: '선택한 빌드를 찾을 수 없습니다.' };
    }

    if (selectedBuild.status !== 'READY') {
      return { error: 'READY 상태의 빌드만 연결할 수 있습니다.' };
    }

    try {
      await createStreamingResource({
        buildUuid,
        instanceType,
        maxCapacity,
      });
      toast({
        variant: 'success',
        title: '빌드 연결 완료',
        description: '스트리밍 리소스가 생성되었습니다.',
      });
      return { error: null };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '빌드 연결에 실패했습니다.';
      toast({
        variant: 'destructive',
        title: '빌드 연결 실패',
        description: message,
      });
      return { error: message };
    }
  };
}

export function BuildConnectionCard({
  gameUuid,
  surveyUuid,
  streamingResource,
  isResourceLoading,
  isResourceError,
  onRefetchResource,
}: BuildConnectionCardProps) {
  const { toast } = useToast();
  const {
    data: builds,
    isLoading: isBuildsLoading,
    isError: isBuildsError,
    refetch: refetchBuilds,
  } = useBuildsQuery(gameUuid);

  const createMutation = useCreateStreamingResource(surveyUuid);
  const deleteMutation = useDeleteStreamingResource(surveyUuid);
  const [isDisconnectOpen, setIsDisconnectOpen] = useState(false);

  const readyBuilds = (builds ?? []).filter((build) => build.status === 'READY');
  const connectedBuild = null;

  const [state, formAction, isPending] = useActionState(
    createBuildConnectionAction({
      surveyUuid,
      builds,
      createStreamingResource: createMutation.mutateAsync,
      toast,
    }),
    initialState
  );

  const handleDisconnectConfirm = async () => {
    try {
      await deleteMutation.mutateAsync();
      toast({
        variant: 'success',
        title: '연결 해제 완료',
        description: '스트리밍 리소스 연결이 해제되었습니다.',
      });
      setIsDisconnectOpen(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '연결 해제에 실패했습니다.';
      toast({
        variant: 'destructive',
        title: '연결 해제 실패',
        description: message,
      });
    }
  };

  const renderContent = () => {
    if (isResourceLoading) {
      return <BuildConnectionSkeleton />;
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
              onClick={onRefetchResource}
            >
              다시 시도
            </Button>
          }
        >
          스트리밍 리소스를 불러오지 못했습니다.
        </InlineAlert>
      );
    }

    if (streamingResource) {
      return (
        <BuildConnectionSummary
          streamingResource={streamingResource}
          connectedBuild={connectedBuild}
          isBuildsError={isBuildsError}
          onRetryBuilds={refetchBuilds}
          onDisconnect={() => setIsDisconnectOpen(true)}
          isDisconnecting={deleteMutation.isPending}
        />
      );
    }

    return (
      <BuildConnectionNoResourceState
        gameUuid={gameUuid}
        readyBuilds={readyBuilds}
        isBuildsLoading={isBuildsLoading}
        isBuildsError={isBuildsError}
        onRetryBuilds={refetchBuilds}
        formAction={formAction}
        isPending={isPending}
        errorMessage={state.error}
      />
    );
  };

  return (
    <section className="bg-card space-y-4 rounded-lg border p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">빌드 연결</h3>
          <p className="text-muted-foreground text-sm">
            업로드된 빌드와 스트리밍 리소스를 연결합니다.
          </p>
        </div>
        {streamingResource && (
          <StreamingStatusBadge status={streamingResource.status} />
        )}
      </div>

      {renderContent()}

      <ConfirmDialog
        open={isDisconnectOpen}
        onOpenChange={setIsDisconnectOpen}
        title="빌드 연결을 해제할까요?"
        description="연결을 해제하면 스트리밍 리소스가 삭제됩니다. 계속 진행할까요?"
        confirmLabel="연결 해제"
        confirmVariant="destructive"
        onCancel={() => setIsDisconnectOpen(false)}
        onConfirm={handleDisconnectConfirm}
      />
    </section>
  );
}
