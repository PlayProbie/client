/**
 * BuildUploadModal - 빌드 업로드 모달
 * 역할: 업로드 폼과 상태 표시를 조합하고 모달 동작을 관리
 */
import { useCallback, useState } from 'react';
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
import { useToast } from '@/hooks/useToast';

import { useUploadState } from '../hooks';
import { BuildUploadForm, type BuildUploadFormData } from './BuildUploadForm';
import { UploadStatusDisplay } from './UploadStatusDisplay';

interface BuildUploadModalProps {
  gameUuid: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const INITIAL_FORM_DATA: BuildUploadFormData = {
  file: null,
  executablePath: '',
  version: '',
  note: '',
};

export function BuildUploadModal({
  gameUuid,
  open,
  onOpenChange,
}: BuildUploadModalProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] =
    useState<BuildUploadFormData>(INITIAL_FORM_DATA);

  // Cancel confirmation
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Upload state machine
  const { state, startUpload, cancelUpload, reset, isUploading } =
    useUploadState({
      gameUuid,
      onSuccess: () => {
        toast({
          variant: 'success',
          title: '업로드 완료',
          description: '업로드가 완료되었습니다.',
        });
      },
    });

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    reset();
  }, [reset]);

  /** 모달 닫기 시도 */
  const handleClose = useCallback(() => {
    if (isUploading) {
      setShowCancelConfirm(true);
    } else {
      resetForm();
      onOpenChange(false);
    }
  }, [isUploading, resetForm, onOpenChange]);

  /** 업로드 취소 확인 */
  const handleCancelConfirm = useCallback(() => {
    setShowCancelConfirm(false);
    cancelUpload();
    resetForm();
    onOpenChange(false);
  }, [cancelUpload, resetForm, onOpenChange]);

  /** 업로드 시작 */
  const handleStartUpload = useCallback(() => {
    const { file, executablePath, version, note } = formData;
    if (!file || !executablePath.trim()) return;
    startUpload({ file, executablePath: executablePath.trim(), version, note });
  }, [formData, startUpload]);

  /** Stream Settings로 이동 */
  const handleGoToStreamSettings = useCallback(() => {
    onOpenChange(false);
    navigate(`/studio/games/${gameUuid}/stream-settings`);
  }, [gameUuid, navigate, onOpenChange]);

  /** 재시도 */
  const handleRetry = useCallback(() => {
    const { file, executablePath, version, note } = formData;
    if (!file || !executablePath.trim()) return;
    startUpload({ file, executablePath: executablePath.trim(), version, note });
  }, [formData, startUpload]);

  /** 새로 시작 */
  const handleRestart = useCallback(() => {
    reset();
    const { file, executablePath, version, note } = formData;
    if (file && executablePath.trim()) {
      startUpload({
        file,
        executablePath: executablePath.trim(),
        version,
        note,
      });
    }
  }, [formData, reset, startUpload]);

  const isFormValid = !!formData.file && !!formData.executablePath.trim();

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={handleClose}
      >
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle>Upload Build</DialogTitle>
            <DialogDescription>
              게임 실행 파일 패키지(.zip)를 업로드합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Idle: 입력 폼 표시 */}
            {state.step === 'idle' && (
              <BuildUploadForm
                data={formData}
                onChange={setFormData}
              />
            )}

            {/* 업로드 진행 상태 표시 */}
            {state.step !== 'idle' && (
              <UploadStatusDisplay
                state={state}
                filename={formData.file?.name}
                onRetry={handleRetry}
                onRestart={handleRestart}
                onCancel={handleClose}
              />
            )}
          </div>

          <DialogFooter>
            {/* Idle State */}
            {state.step === 'idle' && (
              <>
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
              </>
            )}

            {/* Uploading States */}
            {isUploading && (
              <Button
                variant="outline"
                onClick={() => setShowCancelConfirm(true)}
              >
                Cancel
              </Button>
            )}

            {/* Success State */}
            {state.step === 'success' && (
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
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation */}
      <ConfirmDialog
        open={showCancelConfirm}
        onOpenChange={setShowCancelConfirm}
        title="업로드를 취소할까요?"
        description="지금까지 전송된 데이터는 저장되지 않을 수 있습니다."
        cancelLabel="계속 업로드"
        confirmLabel="취소하고 닫기"
        confirmVariant="destructive"
        onCancel={() => setShowCancelConfirm(false)}
        onConfirm={handleCancelConfirm}
      />
    </>
  );
}
