/**
 * DragDropFileInput - .zip 파일 드래그앤드롭 입력
 */
import { FileArchive, Upload } from 'lucide-react';
import { useCallback, useState } from 'react';

import { cn } from '@/lib/utils';

interface DragDropFileInputProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // bytes
  disabled?: boolean;
  className?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024; // 10GB

export function DragDropFileInput({
  onFileSelect,
  accept = '.zip',
  maxSize = MAX_FILE_SIZE,
  disabled = false,
  className,
}: DragDropFileInputProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback(
    (file: File): boolean => {
      setError(null);

      // 확장자 검증
      if (!file.name.toLowerCase().endsWith('.zip')) {
        setError('.zip 파일만 업로드할 수 있습니다.');
        return false;
      }

      // 용량 검증
      if (file.size > maxSize) {
        const maxSizeGB = (maxSize / (1024 * 1024 * 1024)).toFixed(1);
        setError(`파일 크기가 ${maxSizeGB}GB를 초과합니다.`);
        return false;
      }

      return true;
    },
    [maxSize]
  );

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
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (file && validateFile(file)) {
        onFileSelect(file);
      }
    },
    [disabled, validateFile, onFileSelect]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && validateFile(file)) {
        onFileSelect(file);
      }
      // Reset input
      e.target.value = '';
    },
    [validateFile, onFileSelect]
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
          accept={accept}
          onChange={handleInputChange}
          disabled={disabled}
          className="sr-only"
        />

        <div className="flex flex-col items-center gap-2 p-4 text-center">
          {isDragging ? (
            <>
              <FileArchive className="text-primary size-10" />
              <span className="text-primary text-sm font-medium">
                파일을 여기에 놓으세요
              </span>
            </>
          ) : (
            <>
              <Upload className="text-muted-foreground size-10" />
              <span className="text-sm font-medium">
                파일을 드래그하거나 클릭하여 선택
              </span>
              <span className="text-muted-foreground text-xs">
                .zip 파일만 업로드 가능 (최대 5GB)
              </span>
            </>
          )}
        </div>
      </label>

      {error && <p className="text-destructive mt-2 text-sm">{error}</p>}
    </div>
  );
}
