/**
 * BuildUploadForm - 빌드 업로드 입력 폼
 * 단일 관심사: 업로드할 빌드 파일 및 메타데이터 입력
 */
import { Upload } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';

import { DragDropFileInput } from './DragDropFileInput';

export interface BuildUploadFormData {
  file: File | null;
  executablePath: string;
  version: string;
  note: string;
}

interface BuildUploadFormProps {
  data: BuildUploadFormData;
  onChange: (data: BuildUploadFormData) => void;
}

export function BuildUploadForm({ data, onChange }: BuildUploadFormProps) {
  const { file, executablePath, version, note } = data;

  const handleFileSelect = (selectedFile: File) => {
    onChange({ ...data, file: selectedFile });
  };

  const handleFileClear = () => {
    onChange({ ...data, file: null });
  };

  return (
    <>
      {/* File Input */}
      <div className="space-y-2">
        <Label htmlFor="build-file">Build File (required)</Label>
        {file ? (
          <div className="bg-muted/50 flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <Upload className="size-4" />
              <span className="text-sm font-medium">{file.name}</span>
              <span className="text-muted-foreground text-xs">
                ({(file.size / (1024 * 1024)).toFixed(2)} MB)
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFileClear}
            >
              변경
            </Button>
          </div>
        ) : (
          <DragDropFileInput onFileSelect={handleFileSelect} />
        )}
      </div>

      {/* Executable Path */}
      <div className="space-y-2">
        <Label htmlFor="executable-path">Executable Path (required)</Label>
        <Input
          id="executable-path"
          placeholder="/Game/Binaries/Win64/MyGame.exe"
          value={executablePath}
          onChange={(e) =>
            onChange({ ...data, executablePath: e.target.value })
          }
        />
        <p className="text-muted-foreground text-xs">
          zip 내부 실행 파일의 상대 경로입니다. 예)
          /Game/Binaries/Win64/MyGame.exe
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
