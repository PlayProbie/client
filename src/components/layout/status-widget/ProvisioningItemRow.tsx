/**
 * ProvisioningItemRow - 개별 프로비저닝 항목 표시 컴포넌트
 */
import { AlertCircle, CheckCircle2, Loader2, Server, X } from 'lucide-react';
import { memo } from 'react';

import { Button } from '@/components/ui/button';
import {
  type ProvisioningItem,
  ProvisioningStatus,
} from '@/stores/useProvisioningStore';

import { StatusItemRow } from './StatusItemRow';

interface ProvisioningItemRowProps {
  item: ProvisioningItem;
  now?: number;
  onRemove: (id: string) => void;
}

function formatElapsedTime(startedAt: number, now: number): string {
  const elapsed = Math.floor((now - startedAt) / 1000);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  if (minutes > 0) {
    return `${minutes}분 ${seconds}초`;
  }
  return `${seconds}초`;
}

function getStatusIcon(status: ProvisioningStatus) {
  switch (status) {
    case ProvisioningStatus.CREATING:
      return <Loader2 className="text-primary size-4 animate-spin" />;
    case ProvisioningStatus.PROVISIONING:
      return <Server className="text-warning size-4 animate-pulse" />;
    case ProvisioningStatus.READY:
    case ProvisioningStatus.ACTIVE:
      return <CheckCircle2 className="text-success size-4" />;
    case ProvisioningStatus.ERROR:
      return <AlertCircle className="text-destructive size-4" />;
    default:
      return null;
  }
}

function getStatusText(status: ProvisioningStatus): string {
  switch (status) {
    case ProvisioningStatus.CREATING:
      return '리소스 생성 중...';
    case ProvisioningStatus.PROVISIONING:
      return '프로비저닝 중...';
    case ProvisioningStatus.READY:
      return '준비 완료';
    case ProvisioningStatus.ACTIVE:
      return '활성화 완료';
    case ProvisioningStatus.ERROR:
      return '오류 발생';
    default:
      return '대기 중...';
  }
}

function ProvisioningItemRowComponent({
  item,
  now,
  onRemove,
}: ProvisioningItemRowProps) {
  const { id, buildName, status, startedAt, errorMessage } = item;

  const isActive =
    status === ProvisioningStatus.CREATING ||
    status === ProvisioningStatus.PROVISIONING;
  const isComplete =
    status === ProvisioningStatus.ACTIVE ||
    status === ProvisioningStatus.READY ||
    status === ProvisioningStatus.ERROR;
  const elapsedTime = isActive
    ? formatElapsedTime(startedAt, now ?? startedAt)
    : '';

  // 액션 버튼들
  const renderActions = () => (
    <>
      {/* 완료/에러 시 제거 버튼 */}
      {isComplete && (
        <Button
          size="icon"
          variant="ghost"
          className="size-6"
          onClick={() => onRemove(id)}
          title="제거"
        >
          <X className="size-3" />
        </Button>
      )}
    </>
  );

  return (
    <StatusItemRow
      icon={getStatusIcon(status)}
      title={buildName}
      actions={renderActions()}
      className="space-y-1"
    >
      {/* 상태 텍스트 & 경과 시간 */}
      <div className="text-muted-foreground flex items-center justify-between text-xs">
        <span>{getStatusText(status)}</span>
        {isActive && <span>{elapsedTime}</span>}
      </div>

      {/* 에러 메시지 */}
      {status === ProvisioningStatus.ERROR && errorMessage && (
        <p className="text-destructive text-xs">{errorMessage}</p>
      )}
    </StatusItemRow>
  );
}

export const ProvisioningItemRow = memo(ProvisioningItemRowComponent);
