/**
 * BuildUploadModal - 빌드 업로드 모달
 * 역할: 업로드 폼 입력 및 업로드 진행 상태 표시
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
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
  const navigate = useNavigate();
  const { toast } = useToast();
  const startUpload = useUploadStore((state) => state.startUpload);
  const cancelUpload = useUploadStore((state) => state.cancelUpload);
  const removeUpload = useUploadStore((state) => state.removeUpload);

  const [formData, setFormData] =
    useState<BuildUploadFormData>(INITIAL_FORM_DATA);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const toastGuardRef = useRef<Set<string>>(new Set());

  const uploadItem = useUploadStore((state) =>
    uploadId ? state.uploads.find((item) => item.id === uploadId) : undefined
  );
  const uploadState = uploadItem?.state;
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
      if (isUploading) {
        setIsCancelConfirmOpen(true);
        return;
      }
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
    if (isUploading) {
      setIsCancelConfirmOpen(true);
      return;
    }
    handleClose();
  };

  const handleCancelConfirm = () => {
    if (uploadId) {
      cancelUpload(uploadId);
    }
    setIsCancelConfirmOpen(false);
    handleClose();
  };

  const handleRestart = () => {
    if (!uploadItem) return;
    removeUpload(uploadItem.id);
    const newUploadId = startUpload({
      gameUuid: uploadItem.gameUuid,
      gameName: uploadItem.gameName,
      files: uploadItem.files,
      folderName: uploadItem.folderName,
      executablePath: uploadItem.executablePath,
      version: uploadItem.version,
      note: uploadItem.note,
    });
    setUploadId(newUploadId);
  };

  const handleGoToStreamSettings = () => {
    handleClose();
    navigate(`/games/${gameUuid}/stream-settings`);
  };

  const handleFormChange = (nextData: BuildUploadFormData) => {
    setFormData(nextData);
    if (formError) {
      setFormError(null);
    }
  };

  const isFormValid =
    formData.files.length > 0 && !!formData.executablePath.trim();

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={handleDialogOpenChange}
      >
        <DialogContent
          className="sm:max-w-[720px]"
          closeDisabled={isUploading}
          closeTitle={
            isUploading ? '업로드 진행 중에는 닫을 수 없습니다.' : '닫기'
          }
        >
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
              <>
                <Button
                  variant="outline"
                  onClick={handleClose}
                >
                  Close
                </Button>
                <Button onClick={handleGoToStreamSettings}>
                  Go to Stream Settings
                </Button>
              </>
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
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                {isIdle && (
                  <Button
                    onClick={handleStartUpload}
                    disabled={!isFormValid}
                  >
                    Start Upload
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isCancelConfirmOpen}
        onOpenChange={setIsCancelConfirmOpen}
        title="업로드를 취소할까요?"
        description="지금까지 전송된 데이터는 저장되지 않을 수 있습니다."
        cancelLabel="계속 업로드"
        confirmLabel="취소하고 닫기"
        confirmVariant="destructive"
        onCancel={() => setIsCancelConfirmOpen(false)}
        onConfirm={handleCancelConfirm}
      />
    </>
  );
}
