/**
 * UploadStatusWidget - 플로팅 업로드 상태 위젯
 * 우측 하단에 고정되어 업로드 진행 상태를 표시
 */
import { ChevronDown, ChevronUp, Upload, X } from 'lucide-react';
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
    <div className="bg-background border-border fixed right-4 bottom-4 z-50 w-80 overflow-hidden rounded-lg border shadow-lg">
      {/* Header */}
      <div className="bg-muted/50 flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <Upload className="size-4" />
          <span className="text-sm font-medium">
            업로드 ({uploads.length})
            {hasActiveUploads && activeCount > 0 && (
              <span className="text-muted-foreground ml-1 text-xs">
                {overallProgress}%
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* 모두 지우기 (완료된 항목이 있을 때만) */}
          {completedCount > 0 && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-xs"
              onClick={clearCompleted}
            >
              완료 지우기
            </Button>
          )}

          {/* 최소화/최대화 */}
          <Button
            size="icon"
            variant="ghost"
            className="size-6"
            onClick={toggleMinimize}
          >
            {isMinimized ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </Button>

          {/* 모두 취소 (진행중일 때만) */}
          {hasActiveUploads && (
            <Button
              size="icon"
              variant="ghost"
              className="size-6"
              onClick={handleCancelAll}
              title="모든 업로드 취소"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      </div>

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
    </div>
  );
}
