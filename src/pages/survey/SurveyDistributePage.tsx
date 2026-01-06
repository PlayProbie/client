import { useOutletContext } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { PageSpinner } from '@/components/ui/loading';
import { Step } from '@/components/ui/Step';
import { useStreamingResource } from '@/features/game-streaming-survey';
import {
  AdminTestPanel,
  BuildConnectionCard,
  type SurveyShellContext,
} from '@/features/survey';

const DISTRIBUTE_STEPS = ['빌드 연결', '관리자 테스트', '설문 오픈'];

export default function SurveyDistributePage() {
  const { survey, isLoading, isError, refetch, surveyUuid, gameUuid } =
    useOutletContext<SurveyShellContext>();

  const resolvedSurveyUuid = survey?.surveyUuid ?? surveyUuid ?? '';
  const {
    data: streamingResource,
    isLoading: isResourceLoading,
    isError: isResourceError,
    refetch: refetchResource,
  } = useStreamingResource(resolvedSurveyUuid, !!resolvedSurveyUuid);

  if (isLoading) {
    return <PageSpinner message="설문 정보를 불러오는 중..." />;
  }

  if (isError) {
    return (
      <InlineAlert
        variant="error"
        title="설문 로딩 실패"
        actions={
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
          >
            다시 시도
          </Button>
        }
      >
        설문 정보를 불러오지 못했습니다.
      </InlineAlert>
    );
  }

  if (!survey) {
    return (
      <InlineAlert variant="error" title="설문을 찾을 수 없습니다.">
        다시 확인해 주세요.
      </InlineAlert>
    );
  }

  if (!gameUuid) {
    return (
      <InlineAlert variant="error" title="게임 정보를 확인할 수 없습니다.">
        게임을 다시 선택해주세요.
      </InlineAlert>
    );
  }

  const currentStep = streamingResource
    ? survey.status === 'ACTIVE' || survey.status === 'CLOSED'
      ? 2
      : 1
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Distribute</h2>
        <p className="text-muted-foreground text-sm">
          빌드 연결과 관리자 테스트를 진행합니다.
        </p>
      </div>

      <section className="bg-card space-y-4 rounded-lg border p-6">
        <div>
          <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
            Deployment Steps
          </p>
          <h3 className="text-base font-semibold">배포 흐름</h3>
        </div>
        <Step steps={DISTRIBUTE_STEPS} currentStep={currentStep} />
        {!streamingResource && !isResourceLoading && (
          <InlineAlert variant="info" title="1. 빌드를 먼저 연결하세요">
            빌드 연결이 완료되어야 관리자 테스트를 진행할 수 있습니다.
          </InlineAlert>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <BuildConnectionCard
          gameUuid={gameUuid}
          surveyUuid={resolvedSurveyUuid}
          streamingResource={streamingResource}
          isResourceLoading={isResourceLoading}
          isResourceError={isResourceError}
          onRefetchResource={refetchResource}
        />
        <AdminTestPanel
          surveyUuid={resolvedSurveyUuid}
          streamingResource={streamingResource}
          isResourceLoading={isResourceLoading}
          isResourceError={isResourceError}
          onRefetchResource={refetchResource}
        />
      </div>
    </div>
  );
}
