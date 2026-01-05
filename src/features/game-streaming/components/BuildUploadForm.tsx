/**
 * BuildUploadForm - 빌드 업로드 입력 폼
 * 단일 관심사: 업로드할 빌드 폴더 및 메타데이터 입력
 */
import { FolderOpen } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';

import { DragDropFolderInput } from './DragDropFolderInput';

export interface BuildUploadFormData {
  files: File[];
  folderName: string;
  executablePath: string;
  version: string;
  note: string;
}

interface BuildUploadFormProps {
  data: BuildUploadFormData;
  onChange: (data: BuildUploadFormData) => void;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

export function BuildUploadForm({ data, onChange }: BuildUploadFormProps) {
  const { files, folderName, executablePath, version, note } = data;

  const handleFolderSelect = (
    selectedFiles: File[],
    selectedFolderName: string
  ) => {
    onChange({ ...data, files: selectedFiles, folderName: selectedFolderName });
  };

  const handleFolderClear = () => {
    onChange({ ...data, files: [], folderName: '' });
  };

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  return (
    <>
      {/* Folder Input */}
      <div className="space-y-2">
        <Label htmlFor="build-folder">Build Folder (required)</Label>
        {files.length > 0 ? (
          <div className="bg-muted/50 flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <FolderOpen className="size-4" />
              <span className="text-sm font-medium">{folderName}</span>
              <span className="text-muted-foreground text-xs">
                ({files.length}개 파일, {formatBytes(totalSize)})
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFolderClear}
            >
              변경
            </Button>
          </div>
        ) : (
          <DragDropFolderInput onFolderSelect={handleFolderSelect} />
        )}
      </div>

      {/* Executable Path */}
      <div className="space-y-2">
        <Label htmlFor="executable-path">Executable Path (required)</Label>
        <Input
          id="executable-path"
          placeholder="Binaries/Win64/MyGame.exe"
          value={executablePath}
          onChange={(e) =>
            onChange({ ...data, executablePath: e.target.value })
          }
        />
        <p className="text-muted-foreground text-xs">
          업로드 폴더 내 실행 파일의 상대 경로입니다. 예)
          Binaries/Win64/MyGame.exe
        </p>
      </div>

      {/* Version (optional) */}
      <div className="space-y-2">
        <Label htmlFor="version">Version (optional)</Label>
        <Input
          id="version"
          placeholder="1.0.0"
          value={version}
          onChange={(e) => onChange({ ...data, version: e.target.value })}
        />
      </div>

      {/* Note (optional) */}
      <div className="space-y-2">
        <Label htmlFor="note">Note (optional)</Label>
        <Textarea
          id="note"
          placeholder="빌드에 대한 메모를 입력하세요"
          value={note}
          onChange={(e) => onChange({ ...data, note: e.target.value })}
          rows={2}
        />
      </div>
    </>
  );
}
