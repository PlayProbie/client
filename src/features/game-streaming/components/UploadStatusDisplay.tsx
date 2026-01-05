/**
 * UploadStatusDisplay - 업로드 상태별 UI 표시
 * 단일 관심사: 업로드 진행 상태를 시각적으로 표시
 */
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { InlineAlert } from '@/components/ui/InlineAlert';

import type {
  FolderUploadProgress as FolderUploadProgressType,
  UploadState,
} from '../types';
import { FolderUploadProgress } from './FolderUploadProgress';

interface UploadStatusDisplayProps {
  state: UploadState;
  filename?: string;
  onRetry?: () => void;
  onRestart?: () => void;
  onCancel?: () => void;
}

export function UploadStatusDisplay({
  state,
  filename,
  onRetry,
  onRestart,
  onCancel,
}: UploadStatusDisplayProps) {
  switch (state.step) {
    case 'requesting_sts_credentials':
      return (
        <div className="flex flex-col items-center gap-4 py-8">
          <Loader2 className="text-primary size-10 animate-spin" />
          <p className="text-muted-foreground text-sm">업로드 준비 중...</p>
        </div>
      );

    case 'uploading_to_s3':
      return (
        <div className="space-y-4 py-4">
          <FolderUploadProgress
            progress={state.progress as FolderUploadProgressType}
          />
          {filename && (
            <p className="text-muted-foreground text-xs">폴더: {filename}</p>
          )}
        </div>
      );

    case 'completing_upload':
      return (
        <div className="flex flex-col items-center gap-4 py-8">
          <Loader2 className="text-primary size-10 animate-spin" />
          <p className="text-muted-foreground text-sm">
            업로드 완료 처리 중...
          </p>
        </div>
      );

    case 'success':
      return (
        <InlineAlert
          variant="success"
          title="업로드 완료"
        >
          빌드가 성공적으로 업로드되었습니다.
        </InlineAlert>
      );

    case 'error':
      return (
        <InlineAlert
          variant="error"
          title="업로드 실패"
          actions={
            <>
              {state.error.retriable && onRetry && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRetry}
                >
                  다시 시도
                </Button>
              )}
              {onRestart && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRestart}
                >
                  처음부터 다시
                </Button>
              )}
              {onCancel && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onCancel}
                >
                  취소
                </Button>
              )}
            </>
          }
        >
          {state.error.message}
        </InlineAlert>
      );

    default:
      return null;
  }
}
