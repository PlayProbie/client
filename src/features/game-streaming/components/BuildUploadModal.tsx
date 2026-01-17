/**
 * BuildUploadModal - 빌드 업로드 모달
 * 역할: 업로드 폼 입력 및 업로드 진행 상태 표시
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { useToast } from '@/hooks/useToast';
import { useUploadStore } from '@/stores';

import { BuildUploadForm, type BuildUploadFormData } from './BuildUploadForm';
import { UploadProgressDisplay } from './UploadProgressDisplay';

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
  const cancelUpload = useUploadStore((state) => state.cancelUpload);
  const removeUpload = useUploadStore((state) => state.removeUpload);
  const setModalOpen = useUploadStore((state) => state.setModalOpen);
  const collapseToWidget = useUploadStore((state) => state.collapseToWidget);
  const expandedUploadId = useUploadStore((state) => state.expandedUploadId);

  const [formData, setFormData] =
    useState<BuildUploadFormData>(INITIAL_FORM_DATA);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const toastGuardRef = useRef<Set<string>>(new Set());

  const uploadItem = useUploadStore((state) =>
    uploadId ? state.uploads.find((item) => item.id === uploadId) : undefined
  );

  // 위젯에서 확장된 업로드 아이템
  const expandedUploadItem = useUploadStore((state) =>
    expandedUploadId
      ? state.uploads.find((item) => item.id === expandedUploadId)
      : undefined
  );

  // 현재 표시할 아이템 (직접 업로드 또는 확장된 업로드)
  const currentItem = uploadItem || expandedUploadItem;
  const uploadState = currentItem?.state;
  const isIdle = !uploadState || uploadState.step === 'idle';
  const isUploading = uploadState
    ? [
        'requesting_sts_credentials',
        'uploading_to_s3',
        'completing_upload',
      ].includes(uploadState.step)
    : false;
  const isSuccess = uploadState?.step === 'success';
  const isError = uploadState?.step === 'error';

  useEffect(() => {
    if (
      uploadId &&
      uploadState?.step === 'success' &&
      !toastGuardRef.current.has(uploadId)
    ) {
      toast({
        variant: 'success',
        title: '업로드 완료',
        description: '업로드가 완료되었습니다.',
      });
      toastGuardRef.current.add(uploadId);
    }
  }, [toast, uploadId, uploadState?.step]);

  // 모달 열림 상태를 store에 동기화
  useEffect(() => {
    setModalOpen(open || !!expandedUploadId);
  }, [open, expandedUploadId, setModalOpen]);

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setFormError(null);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    setUploadId(null);
    onOpenChange(false);
  }, [onOpenChange, resetForm]);

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      // 위젯에서 확장된 경우 위젯으로 축소
      if (expandedUploadId) {
        collapseToWidget();
        onOpenChange(false);
        return;
      }
      // 업로드 진행 중이면 위젯 표시 (모달 닫으면 자동으로 위젯이 보임)
      // setModalOpen은 handleClose에서 onOpenChange를 통해 간접적으로 호출됨
      handleClose();
    }
  };

  const handleStartUpload = useCallback(() => {
    setFormError(null);
    const { files, folderName, executablePath, version, note } = formData;
    if (files.length === 0) {
      setFormError('빌드 폴더를 선택해주세요.');
      return;
    }
    if (!executablePath.trim()) {
      setFormError('Executable Path를 입력해주세요.');
      return;
    }

    const newUploadId = startUpload({
      gameUuid,
      gameName: gameName || 'Unknown Game',
      files,
      folderName: folderName || 'build',
      executablePath: executablePath.trim(),
      version,
      note,
    });

    setUploadId(newUploadId);
  }, [formData, gameUuid, gameName, startUpload]);

  const handleCancel = () => {
    // 모달이 닫히면 useEffect에서 isModalOpen이 false가 되어 위젯이 자동으로 표시됨
    handleClose();
  };

  const handleStopUpload = () => {
    if (uploadId) {
      cancelUpload(uploadId);
    }
    handleClose();
  };

  const handleRestart = () => {
    const targetItem = currentItem;
    if (!targetItem) return;
    removeUpload(targetItem.id);
    const newUploadId = startUpload({
      gameUuid: targetItem.gameUuid,
      gameName: targetItem.gameName,
      files: targetItem.files,
      folderName: targetItem.folderName,
      executablePath: targetItem.executablePath,
      version: targetItem.version,
      note: targetItem.note,
    });
    setUploadId(newUploadId);
    // 확장된 상태였다면 초기화
    if (expandedUploadId) {
      collapseToWidget();
    }
  };

  const handleFormChange = (nextData: BuildUploadFormData) => {
    setFormData(nextData);
    if (formError) {
      setFormError(null);
    }
  };

  const isFormValid =
    formData.files.length > 0 && !!formData.executablePath.trim();

  // 위젯에서 확장된 경우 모달 자동 열기
  const isModalOpen = open || !!expandedUploadId;

  return (
    <>
      <Dialog
        open={isModalOpen}
        onOpenChange={handleDialogOpenChange}
      >
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle>Upload Build</DialogTitle>
            <DialogDescription>
              게임 빌드 폴더를 업로드합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {formError && (
              <InlineAlert
                variant="error"
                title="입력 오류"
              >
                {formError}
              </InlineAlert>
            )}

            {isIdle || !uploadState ? (
              <BuildUploadForm
                data={formData}
                onChange={handleFormChange}
              />
            ) : (
              <UploadProgressDisplay uploadState={uploadState} />
            )}
          </div>

          <DialogFooter>
            {isSuccess ? (
              <Button
                variant="outline"
                onClick={handleClose}
              >
                Close
              </Button>
            ) : isError ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleClose}
                >
                  Close
                </Button>
                <Button onClick={handleRestart}>
                  {uploadState?.error?.retriable ? 'Retry' : 'Restart'}
                </Button>
              </>
            ) : isUploading ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                >
                  닫기
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleStopUpload}
                >
                  중단하기
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleStartUpload}
                  disabled={!isFormValid}
                >
                  Start Upload
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
