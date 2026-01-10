/**
 * UploadStatusWidget - 플로팅 업로드 상태 위젯
 * 우측 하단에 고정되어 업로드 진행 상태를 표시
 */
import { Upload, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/ScrollArea';
import {
  selectHasActiveUploads,
  selectOverallProgress,
  type UploadItem,
  useUploadQueryInvalidation,
  useUploadStore,
} from '@/stores/useUploadStore';

import { StatusWidgetContainer } from './StatusWidgetContainer';
import { StatusWidgetHeader } from './StatusWidgetHeader';
import { UploadItemRow } from './UploadItemRow';

export function UploadStatusWidget() {
  const uploads = useUploadStore((state) => state.uploads);
  const isMinimized = useUploadStore((state) => state.isMinimized);
  const hasActiveUploads = useUploadStore(selectHasActiveUploads);
  const overallProgress = useUploadStore(selectOverallProgress);

  const toggleMinimize = useUploadStore((state) => state.toggleMinimize);
  const cancelUpload = useUploadStore((state) => state.cancelUpload);
  const removeUpload = useUploadStore((state) => state.removeUpload);
  const clearCompleted = useUploadStore((state) => state.clearCompleted);
  const startUpload = useUploadStore((state) => state.startUpload);

  const { invalidateBuildQuery } = useUploadQueryInvalidation();
  const handledUploadsRef = useRef<Set<string>>(new Set());

  // 완료된 업로드에 대해 쿼리 무효화
  useEffect(() => {
    uploads.forEach((upload) => {
      if (
        upload.state.step === 'success' &&
        !handledUploadsRef.current.has(upload.id)
      ) {
        invalidateBuildQuery(upload.gameUuid);
        handledUploadsRef.current.add(upload.id);
      }
    });
  }, [uploads, invalidateBuildQuery]);

  // 업로드 항목이 없으면 위젯 숨김
  if (uploads.length === 0) {
    return null;
  }

  const activeCount = uploads.filter((u) =>
    [
      'requesting_sts_credentials',
      'uploading_to_s3',
      'completing_upload',
    ].includes(u.state.step)
  ).length;

  const completedCount = uploads.filter(
    (u) => u.state.step === 'success' || u.state.step === 'error'
  ).length;

  // 재시도 핸들러
  const handleRetry = (item: UploadItem) => {
    removeUpload(item.id);
    startUpload({
      gameUuid: item.gameUuid,
      gameName: item.gameName,
      files: item.files,
      folderName: item.folderName,
      executablePath: item.executablePath,
      version: item.version,
      note: item.note,
    });
  };

  // 모든 진행중 업로드 취소
  const handleCancelAll = () => {
    uploads.forEach((u) => {
      if (
        [
          'requesting_sts_credentials',
          'uploading_to_s3',
          'completing_upload',
        ].includes(u.state.step)
      ) {
        cancelUpload(u.id);
      }
    });
  };

  return (
    <StatusWidgetContainer bottomPosition="bottom-24">
      <StatusWidgetHeader
        icon={<Upload className="size-4" />}
        title="업로드"
        count={uploads.length}
        progressInfo={
          hasActiveUploads && activeCount > 0 ? (
            <span className="text-muted-foreground ml-1 text-xs">
              {overallProgress}%
            </span>
          ) : undefined
        }
        isMinimized={isMinimized}
        onToggleMinimize={toggleMinimize}
        showClearCompleted={completedCount > 0}
        onClearCompleted={clearCompleted}
        extraActions={
          hasActiveUploads ? (
            <Button
              size="icon"
              variant="ghost"
              className="size-6"
              onClick={handleCancelAll}
              title="모든 업로드 취소"
            >
              <X className="size-4" />
            </Button>
          ) : undefined
        }
      />

      {/* Content (최소화 상태가 아닐 때만) */}
      {!isMinimized && (
        <ScrollArea className="max-h-80">
          <div className="divide-y">
            {uploads.map((item) => (
              <UploadItemRow
                key={item.id}
                item={item}
                onCancel={cancelUpload}
                onRemove={removeUpload}
                onRetry={handleRetry}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </StatusWidgetContainer>
  );
}
