/**
 * DragDropFolderInput - 폴더 드래그앤드롭 입력
 * webkitdirectory 속성을 사용하여 폴더 선택 지원
 */
import { FolderOpen, Upload } from 'lucide-react';
import { useCallback, useState } from 'react';

import { cn } from '@/lib/utils';

interface DragDropFolderInputProps {
  onFolderSelect: (files: File[], folderName: string) => void;
  maxSize?: number; // bytes
  disabled?: boolean;
  className?: string;
}

const MAX_FOLDER_SIZE = 10 * 1024 * 1024 * 1024; // 10GB

export function DragDropFolderInput({
  onFolderSelect,
  maxSize = MAX_FOLDER_SIZE,
  disabled = false,
  className,
}: DragDropFolderInputProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFiles = useCallback(
    (files: File[]): boolean => {
      setError(null);

      if (files.length === 0) {
        setError('폴더가 비어있습니다.');
        return false;
      }

      // 총 용량 계산
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);

      if (totalSize > maxSize) {
        const maxSizeGB = (maxSize / (1024 * 1024 * 1024)).toFixed(1);
        setError(`전체 용량이 ${maxSizeGB}GB를 초과합니다.`);
        return false;
      }

      return true;
    },
    [maxSize]
  );

  const extractFolderName = (files: File[]): string => {
    // webkitRelativePath에서 폴더명 추출
    if (files[0]?.webkitRelativePath) {
      return files[0].webkitRelativePath.split('/')[0];
    }
    return 'upload';
  };

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const items = e.dataTransfer.items;
      const files: File[] = [];

      // DataTransferItem에서 폴더 내 파일 추출
      const processEntry = async (entry: FileSystemEntry): Promise<void> => {
        if (entry.isFile) {
          const fileEntry = entry as FileSystemFileEntry;
          return new Promise((resolve) => {
            fileEntry.file((file) => {
              // webkitRelativePath 설정을 위해 새 File 객체 생성
              const relativePath = entry.fullPath.slice(1); // 앞의 '/' 제거
              Object.defineProperty(file, 'webkitRelativePath', {
                value: relativePath,
                writable: false,
              });
              files.push(file);
              resolve();
            });
          });
        } else if (entry.isDirectory) {
          const dirEntry = entry as FileSystemDirectoryEntry;
          const reader = dirEntry.createReader();
          return new Promise((resolve) => {
            reader.readEntries(async (entries) => {
              for (const e of entries) {
                await processEntry(e);
              }
              resolve();
            });
          });
        }
      };

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const entry = item.webkitGetAsEntry?.();
        if (entry) {
          await processEntry(entry);
        }
      }

      if (files.length > 0 && validateFiles(files)) {
        const folderName = extractFolderName(files);
        onFolderSelect(files, folderName);
      }
    },
    [disabled, validateFiles, onFolderSelect]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = e.target.files;
      if (!fileList) return;

      const files = Array.from(fileList);
      if (validateFiles(files)) {
        const folderName = extractFolderName(files);
        onFolderSelect(files, folderName);
      }

      // Reset input
      e.target.value = '';
    },
    [validateFiles, onFolderSelect]
  );

  return (
    <div className={className}>
      <label
        className={cn(
          'flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50',
          disabled && 'cursor-not-allowed opacity-50'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          // @ts-expect-error - webkitdirectory is not in the type definitions
          webkitdirectory=""
          onChange={handleInputChange}
          disabled={disabled}
          className="sr-only"
        />

        <div className="flex flex-col items-center gap-2 p-4 text-center">
          {isDragging ? (
            <>
              <FolderOpen className="text-primary size-10" />
              <span className="text-primary text-sm font-medium">
                폴더를 여기에 놓으세요
              </span>
            </>
          ) : (
            <>
              <Upload className="text-muted-foreground size-10" />
              <span className="text-sm font-medium">
                폴더를 드래그하거나 클릭하여 선택
              </span>
              <span className="text-muted-foreground text-xs">
                빌드 폴더 전체를 업로드합니다 (최대 10GB)
              </span>
            </>
          )}
        </div>
      </label>

      {error && <p className="text-destructive mt-2 text-sm">{error}</p>}
    </div>
  );
}
