/**
 * StreamSettingsForm - 스트리밍 설정 폼 컴포넌트
 */
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button, InlineAlert, Skeleton } from '@/components/ui';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {
  getStreamingResource,
  streamingResourceKeys,
  StreamingResourceStatus,
} from '@/features/game-streaming-survey';

import {
  useStreamSettingsMutation,
  useStreamSettingsQuery,
  useUnsavedChanges,
} from '../hooks';
import type { StreamSettings } from '../types';
import { GpuProfileSelect } from './GpuProfileSelect';
import { ResolutionSelect } from './ResolutionSelect';

interface StreamSettingsFormProps {
  gameUuid: string;
  surveyUuid?: string;
  onStreamingResourceReady?: () => void;
}

/** Outer component - handles data fetching and loading/error states */
export function StreamSettingsForm({
  gameUuid,
  surveyUuid,
  onStreamingResourceReady,
}: StreamSettingsFormProps) {
  const { data, isLoading, isError, refetch } =
    useStreamSettingsQuery(gameUuid);
  const mutation = useStreamSettingsMutation(gameUuid);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <InlineAlert
        variant="error"
        title="로딩 실패"
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
        스트림 설정을 불러오지 못했습니다.
      </InlineAlert>
    );
  }

  if (!data) {
    return null;
  }

  // Key pattern: remount StreamSettingsFormContent when gameUuid changes
  return (
    <StreamSettingsFormContent
      key={gameUuid}
      initialData={data}
      mutation={mutation}
      surveyUuid={surveyUuid}
      onStreamingResourceReady={onStreamingResourceReady}
    />
  );
}

interface StreamSettingsFormContentProps {
  initialData: StreamSettings;
  mutation: ReturnType<typeof useStreamSettingsMutation>;
  surveyUuid?: string;
  onStreamingResourceReady?: () => void;
}

/** Inner form component - receives guaranteed data, initializes state directly */
function StreamSettingsFormContent({
  initialData,
  mutation,
  surveyUuid,
  onStreamingResourceReady,
}: StreamSettingsFormContentProps) {
  const [pollingRequestId, setPollingRequestId] = useState(0);
  const lastNotifiedRequestIdRef = useRef(0);
  const { control, register, handleSubmit, formState, reset } =
    useForm<StreamSettings>({
      defaultValues: initialData,
      mode: 'onChange',
    });
  const { showDialog, confirmLeave, cancelLeave } = useUnsavedChanges({
    hasChanges: formState.isDirty || mutation.isPending,
    message: '변경사항이 저장되지 않았습니다. 페이지를 떠나시겠습니까?',
  });

  const shouldEnablePolling = pollingRequestId > 0 && !!surveyUuid;
  const {
    data: streamingResource,
    isError: isPollingError,
    error: pollingError,
    refetch: refetchStreamingResource,
  } = useQuery({
    queryKey: streamingResourceKeys.detail(surveyUuid ?? ''),
    queryFn: () => getStreamingResource(surveyUuid ?? ''),
    enabled: shouldEnablePolling,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (!shouldEnablePolling || status === StreamingResourceStatus.ACTIVE) {
        return false;
      }
      return 5000;
    },
  });

  const isPolling =
    shouldEnablePolling &&
    streamingResource?.status !== StreamingResourceStatus.ACTIVE;

  useEffect(() => {
    if (!shouldEnablePolling || !streamingResource) {
      return;
    }

    if (
      streamingResource.status === StreamingResourceStatus.ACTIVE &&
      pollingRequestId > lastNotifiedRequestIdRef.current
    ) {
      lastNotifiedRequestIdRef.current = pollingRequestId;
      onStreamingResourceReady?.();
    }
  }, [
    shouldEnablePolling,
    streamingResource,
    pollingRequestId,
    onStreamingResourceReady,
  ]);

  const onSubmit = (data: StreamSettings) => {
    mutation.mutate(data, {
      onSuccess: () => {
        reset(data);
        if (surveyUuid) {
          setPollingRequestId((prev) => prev + 1);
          void refetchStreamingResource();
        }
      },
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {mutation.isError && (
        <InlineAlert
          variant="error"
          title="저장 실패"
        >
          저장에 실패했습니다. 다시 시도해주세요.
        </InlineAlert>
      )}
      {isPolling && isPollingError && (
        <InlineAlert
          variant="error"
          title="리소스 상태 확인 실패"
          actions={
            <Button
              size="sm"
              variant="outline"
              onClick={() => refetchStreamingResource()}
            >
              다시 시도
            </Button>
          }
        >
          {pollingError instanceof Error
            ? pollingError.message
            : '스트리밍 리소스 상태 조회에 실패했습니다.'}
        </InlineAlert>
      )}
      {isPolling && !isPollingError && (
        <InlineAlert
          variant="info"
          title="스트리밍 리소스 활성화 확인 중"
        >
          리소스가 ACTIVE 상태가 될 때까지 자동으로 확인합니다.
        </InlineAlert>
      )}

      <GpuProfileSelect control={control} />
      <ResolutionSelect register={register} />

      {/* Max Sessions (Capacity Target) */}
      <div className="space-y-2">
        <Label htmlFor="max-sessions">Capacity Target (Max Sessions)</Label>
        <Input
          id="max-sessions"
          type="number"
          min={0}
          {...register('maxSessions', {
            setValueAs: (value) => Math.max(0, Number(value) || 0),
          })}
          placeholder="0 (OFF)"
        />
        <p className="text-muted-foreground text-xs">
          동시 스트리밍 세션 최대 수 (0 = 비활성화)
        </p>
      </div>

      {/* OS (Readonly) */}
      <div className="space-y-2">
        <Label>OS</Label>
        <div className="bg-muted text-muted-foreground rounded-md border px-3 py-2 text-sm">
          {initialData.os}
        </div>
      </div>

      {/* Region (Readonly) */}
      <div className="space-y-2">
        <Label>Region</Label>
        <div className="bg-muted text-muted-foreground rounded-md border px-3 py-2 text-sm">
          {initialData.region}
        </div>
      </div>

      <input
        type="hidden"
        {...register('os')}
      />
      <input
        type="hidden"
        {...register('region')}
      />

      {/* Submit Button */}
      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="submit"
          disabled={!formState.isDirty || mutation.isPending || isPolling}
        >
          {mutation.isPending
            ? '저장 중...'
            : isPolling
              ? '상태 확인 중...'
              : '저장'}
        </Button>
      </div>

      <ConfirmDialog
        open={showDialog}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) cancelLeave();
        }}
        title="변경사항이 저장되지 않았습니다"
        description="이동하면 현재 입력이 사라집니다."
        cancelLabel="취소"
        confirmLabel="이동"
        onCancel={cancelLeave}
        onConfirm={confirmLeave}
      />
    </form>
  );
}
