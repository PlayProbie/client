import { Button } from '@/components/ui/button';
import { InlineAlert } from '@/components/ui/InlineAlert';
import type { Build } from '@/features/game-streaming';
import { BuildStatusBadge } from '@/features/game-streaming';
import {
  type StreamingResource,
  StreamingResourceStatus,
} from '@/features/game-streaming-survey';

import { INSTANCE_TYPE_LABELS } from './constants';

interface BuildConnectionSummaryProps {
  streamingResource: StreamingResource;
  connectedBuild: Build | null;
  isBuildsError: boolean;
  onRetryBuilds: () => void;
  onDisconnect: () => void;
  isDisconnecting: boolean;
}

export function BuildConnectionSummary({
  streamingResource,
  connectedBuild,
  isBuildsError,
  onRetryBuilds,
  onDisconnect,
  isDisconnecting,
}: BuildConnectionSummaryProps) {
  const instanceTypeLabel =
    INSTANCE_TYPE_LABELS[streamingResource.instanceType] ??
    streamingResource.instanceType;

  return (
    <div className="space-y-4">
      {streamingResource.status === StreamingResourceStatus.PROVISIONING && (
        <InlineAlert variant="info" title="리소스 생성 중">
          스트리밍 리소스를 준비하고 있습니다. 준비가 완료되면 테스트를 시작할
          수 있습니다.
        </InlineAlert>
      )}

      <dl className="grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">연결된 빌드</dt>
          <dd className="mt-1 font-medium">
            {connectedBuild?.filename || '-'}
          </dd>
          {connectedBuild && (
            <div className="mt-2">
              <BuildStatusBadge status={connectedBuild.status} />
            </div>
          )}
        </div>
        <div>
          <dt className="text-muted-foreground">Instance Type</dt>
          <dd className="mt-1 font-medium">{instanceTypeLabel}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Capacity</dt>
          <dd className="mt-1 font-medium">
            {streamingResource.currentCapacity} / {streamingResource.maxCapacity}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">리소스 UUID</dt>
          <dd className="mt-1 break-all font-mono text-xs">
            {streamingResource.uuid}
          </dd>
        </div>
      </dl>

      {isBuildsError && (
        <InlineAlert
          variant="warning"
          title="빌드 정보 확인 필요"
          actions={
            <Button
              size="sm"
              variant="outline"
              onClick={onRetryBuilds}
            >
              다시 시도
            </Button>
          }
        >
          연결된 빌드 정보를 갱신하지 못했습니다.
        </InlineAlert>
      )}

      <div className="flex justify-end gap-2">
        <Button
          variant="destructive"
          onClick={onDisconnect}
          disabled={isDisconnecting}
        >
          연결 해제
        </Button>
      </div>
    </div>
  );
}
