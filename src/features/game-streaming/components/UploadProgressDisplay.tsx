import { InlineAlert } from '@/components/ui/InlineAlert';
import { Spinner } from '@/components/ui/loading';
import { Progress } from '@/components/ui/progress';
import { Step } from '@/components/ui/Step';

import type { UploadState } from '../types';
import { formatBytes, formatTime } from '../utils';

interface UploadProgressDisplayProps {
  uploadState: UploadState;
}

const UPLOAD_STEPS = ['STS 인증', '파일 업로드', '완료 처리'];

const getStepIndex = (state?: UploadState) => {
  if (!state) return 0;
  if (state.step === 'requesting_sts_credentials') return 0;
  if (state.step === 'uploading_to_s3') return 1;
  if (state.step === 'completing_upload') return 2;
  if (state.step === 'success') return 2;
  if (state.step === 'error') {
    if (state.error.step === 'upload') return 1;
    if (state.error.step === 'complete') return 2;
  }
  return 0;
};

export function UploadProgressDisplay({
  uploadState,
}: UploadProgressDisplayProps) {
  const isError = uploadState.step === 'error';
  const isSuccess = uploadState.step === 'success';
  const progress =
    uploadState.step === 'uploading_to_s3' ? uploadState.progress : null;

  return (
    <div className="space-y-6">
      <Step
        steps={UPLOAD_STEPS}
        currentStep={getStepIndex(uploadState)}
      />

      {progress && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {progress.uploadedFiles} / {progress.totalFiles} 파일
            </span>
            <span className="font-medium">{progress.percent}%</span>
          </div>
          <Progress value={progress.percent} />
          <div className="text-muted-foreground flex flex-wrap justify-between gap-2 text-xs">
            <span>
              {formatBytes(progress.uploadedBytes)} /{' '}
              {formatBytes(progress.totalBytes)}
            </span>
            <span>속도 {formatBytes(progress.speed)}/s</span>
            <span>ETA {formatTime(progress.eta)}</span>
          </div>
          <p className="text-muted-foreground text-xs">
            현재 파일: {progress.currentFileName || '-'}
          </p>
        </div>
      )}

      {uploadState.step === 'requesting_sts_credentials' && (
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Spinner size="sm" />
          업로드 인증 정보를 발급하는 중입니다.
        </div>
      )}

      {uploadState.step === 'completing_upload' && (
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Spinner size="sm" />
          업로드 완료 처리를 진행 중입니다.
        </div>
      )}

      {isError && (
        <InlineAlert
          variant="error"
          title="업로드 실패"
        >
          {uploadState.error.message}
        </InlineAlert>
      )}

      {isSuccess && (
        <InlineAlert
          variant="success"
          title="업로드 완료"
        >
          빌드 업로드가 성공적으로 완료되었습니다.
        </InlineAlert>
      )}
    </div>
  );
}
