/**
 * FolderUploadProgress - 폴더 업로드 진행률 표시
 * 파일 수, bytes, 속도, ETA, 현재 파일명 표시
 */
import { Loader2 } from 'lucide-react';

import { Progress } from '@/components/ui/progress';

import type { FolderUploadProgress as FolderUploadProgressType } from '../types';

interface FolderUploadProgressProps {
  progress: FolderUploadProgressType;
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

function formatEta(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}초`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}분`;
  return `${Math.round(seconds / 3600)}시간`;
}

export function FolderUploadProgress({ progress }: FolderUploadProgressProps) {
  const {
    totalFiles,
    uploadedFiles,
    totalBytes,
    uploadedBytes,
    percent,
    speed,
    eta,
    currentFileName,
  } = progress;

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">업로드 중...</span>
          <span className="text-muted-foreground">{percent}%</span>
        </div>
        <Progress value={percent} />
      </div>

      {/* Stats Grid */}
      <div className="bg-muted/50 grid grid-cols-2 gap-3 rounded-lg p-3 text-sm">
        {/* File Progress */}
        <div>
          <span className="text-muted-foreground">파일</span>
          <p className="font-medium">
            {uploadedFiles} / {totalFiles}
          </p>
        </div>

        {/* Bytes Progress */}
        <div>
          <span className="text-muted-foreground">용량</span>
          <p className="font-medium">
            {formatBytes(uploadedBytes)} / {formatBytes(totalBytes)}
          </p>
        </div>

        {/* Speed */}
        <div>
          <span className="text-muted-foreground">속도</span>
          <p className="font-medium">{formatSpeed(speed)}</p>
        </div>

        {/* ETA */}
        <div>
          <span className="text-muted-foreground">남은 시간</span>
          <p className="font-medium">{eta > 0 ? formatEta(eta) : '-'}</p>
        </div>
      </div>

      {/* Current File */}
      {currentFileName && (
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className="size-4 animate-spin" />
          <span className="text-muted-foreground max-w-[400px] truncate">
            {currentFileName}
          </span>
        </div>
      )}
    </div>
  );
}
