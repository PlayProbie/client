import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { Skeleton } from '@/components/ui/loading';
import type { Build } from '@/features/game-streaming';

import { BuildConnectionForm } from './BuildConnectionForm';

interface BuildConnectionNoResourceStateProps {
  gameUuid: string;
  uploadedBuilds: Build[];
  isBuildsLoading: boolean;
  isBuildsError: boolean;
  onRetryBuilds: () => void;
  formAction: (formData: FormData) => void;
  isPending: boolean;
  errorMessage?: string | null;
}

export function BuildConnectionNoResourceState({
  gameUuid,
  uploadedBuilds,
  isBuildsLoading,
  isBuildsError,
  onRetryBuilds,
  formAction,
  isPending,
  errorMessage,
}: BuildConnectionNoResourceStateProps) {
  if (isBuildsLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (isBuildsError) {
    return (
      <InlineAlert
        variant="error"
        title="빌드 목록 로딩 실패"
        actions={
          <Button
            size="sm"
            variant="outline"
            onClick={onRetryBuilds}
          >
            다시 시도
          </Button>
        }
      >
        빌드 목록을 불러오지 못했습니다.
      </InlineAlert>
    );
  }

  if (uploadedBuilds.length === 0) {
    return (
      <InlineAlert
        variant="info"
        title="연결 가능한 빌드가 없습니다."
        actions={
          <Button
            size="sm"
            variant="outline"
            asChild
          >
            <Link to={`/games/${gameUuid}/builds`}>빌드 업로드</Link>
          </Button>
        }
      >
        UPLOADED 상태의 빌드를 업로드한 뒤 연결을 진행해주세요.
      </InlineAlert>
    );
  }

  return (
    <BuildConnectionForm
      uploadedBuilds={uploadedBuilds}
      formAction={formAction}
      isPending={isPending}
      errorMessage={errorMessage}
    />
  );
}
