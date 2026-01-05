/**
 * BuildUploadModal - 빌드 업로드 모달
 * 역할: 업로드 폼 입력 및 전역 업로드 시작
 */
import { useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { useToast } from '@/hooks/useToast';
import { useUploadStore } from '@/stores';

import { BuildUploadForm, type BuildUploadFormData } from './BuildUploadForm';

interface BuildUploadModalProps {
  gameUuid: string;
  gameName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const INITIAL_FORM_DATA: BuildUploadFormData = {
  files: [],
  folderName: '',
  executablePath: '',
  version: '',
  note: '',
  isStreaming: false,
};

export function BuildUploadModal({
  gameUuid,
  gameName,
  open,
  onOpenChange,
}: BuildUploadModalProps) {
  const { toast } = useToast();
  const startUpload = useUploadStore((state) => state.startUpload);

  // Form state
  const [formData, setFormData] =
    useState<BuildUploadFormData>(INITIAL_FORM_DATA);

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
  }, []);

  /** 모달 닫기 */
  const handleClose = useCallback(() => {
    resetForm();
    onOpenChange(false);
  }, [resetForm, onOpenChange]);

  /** 업로드 시작 */
  const handleStartUpload = useCallback(() => {
    const { files, folderName, executablePath, version, note } = formData;
    if (files.length === 0 || !executablePath.trim()) return;

    // 전역 스토어를 통해 업로드 시작
    startUpload({
      gameUuid,
      gameName: gameName || 'Unknown Game', // Fallback for safety
      files,
      folderName,
      executablePath: executablePath.trim(),
      version,
      note,
    });

    toast({
      title: '업로드가 시작되었습니다',
      description: '우측 하단 위젯에서 진행 상황을 확인할 수 있습니다.',
    });

    handleClose();
  }, [formData, gameUuid, gameName, startUpload, toast, handleClose]);

  const isFormValid =
    formData.files.length > 0 && !!formData.executablePath.trim();

  return (
    <Dialog
      open={open}
      onOpenChange={handleClose}
    >
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Upload Build</DialogTitle>
          <DialogDescription>게임 빌드 폴더를 업로드합니다.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <BuildUploadForm
            data={formData}
            onChange={setFormData}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            onClick={handleStartUpload}
            disabled={!isFormValid}
          >
            Start Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
