/**
 * UploadItemRow - 개별 업로드 항목 표시 컴포넌트
 */
import { AlertCircle, CheckCircle2, Loader2, RotateCcw, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { UploadItem } from '@/stores/useUploadStore';

interface UploadItemRowProps {
  item: UploadItem;
  onCancel: (id: string) => void;
  onRemove: (id: string) => void;
  onRetry?: (item: UploadItem) => void;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function formatSpeed(bytesPerSecond: number): string {
  return `${formatBytes(bytesPerSecond)}/s`;
}

export function UploadItemRow({
  item,
  onCancel,
  onRemove,
  onRetry,
}: UploadItemRowProps) {
  const { state, gameName, folderName } = item;

  // 상태별 아이콘 및 색상
  const getStatusIcon = () => {
    switch (state.step) {
      case 'requesting_sts_credentials':
      case 'completing_upload':
        return <Loader2 className="text-primary size-4 animate-spin" />;
      case 'uploading_to_s3':
        return <Loader2 className="text-primary size-4 animate-spin" />;
      case 'success':
        return <CheckCircle2 className="text-success size-4" />;
      case 'error':
        return <AlertCircle className="text-destructive size-4" />;
      default:
        return null;
    }
  };

  const getProgress = () => {
    if (state.step === 'uploading_to_s3') {
      return state.progress;
    }
    return null;
  };

  const progress = getProgress();
  const isActive = [
    'requesting_sts_credentials',
    'uploading_to_s3',
    'completing_upload',
  ].includes(state.step);

  return (
    <div className="border-border space-y-2 border-b p-3 last:border-b-0">
      {/* Header: 게임명, 폴더명, 상태 아이콘 */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {getStatusIcon()}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{gameName}</p>
            <p className="text-muted-foreground truncate text-xs">
              {folderName}
            </p>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex shrink-0 items-center gap-1">
          {/* 에러 시 재시도 버튼 */}
          {state.step === 'error' && state.error.retriable && onRetry && (
            <Button
              size="icon"
              variant="ghost"
              className="size-6"
              onClick={() => onRetry(item)}
              title="다시 시도"
            >
              <RotateCcw className="size-3" />
            </Button>
          )}

          {/* 진행중일 때 취소 버튼 */}
          {isActive && (
            <Button
              size="icon"
              variant="ghost"
              className="size-6"
              onClick={() => onCancel(item.id)}
              title="취소"
            >
              <X className="size-3" />
            </Button>
          )}

          {/* 완료/에러 시 제거 버튼 */}
          {(state.step === 'success' || state.step === 'error') && (
            <Button
              size="icon"
              variant="ghost"
              className="size-6"
              onClick={() => onRemove(item.id)}
              title="제거"
            >
              <X className="size-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Progress Bar (업로드 중일 때만) */}
      {progress && (
        <div className="space-y-1">
          <Progress
            value={progress.percent}
            className="h-1.5"
          />
          <div className="text-muted-foreground flex justify-between text-xs">
            <span>
              {formatBytes(progress.uploadedBytes)} /{' '}
              {formatBytes(progress.totalBytes)}
            </span>
            <span>{formatSpeed(progress.speed)}</span>
          </div>
        </div>
      )}

      {/* 에러 메시지 */}
      {state.step === 'error' && (
        <p className="text-destructive text-xs">{state.error.message}</p>
      )}

      {/* 상태 텍스트 */}
      {state.step === 'requesting_sts_credentials' && (
        <p className="text-muted-foreground text-xs">업로드 준비 중...</p>
      )}
      {state.step === 'completing_upload' && (
        <p className="text-muted-foreground text-xs">완료 처리 중...</p>
      )}
      {state.step === 'success' && (
        <p className="text-success text-xs">업로드 완료</p>
      )}
    </div>
  );
}
