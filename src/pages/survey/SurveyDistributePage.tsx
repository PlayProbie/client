/**
 * SurveyDistributePage - 설문 배포 페이지
 * 3단계 배포 플로우: 빌드 선택 → 리소스 관리 → 설문 오픈
 */
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { PageSpinner } from '@/components/ui/loading';
import { Step } from '@/components/ui/Step';
import type { Build } from '@/features/game-streaming';
import { useStreamingResource } from '@/features/game-streaming-survey';
import {
  BuildSelectionStep,
  ResourceManagementStep,
  SurveyOpenStep,
  type SurveyShellContext,
} from '@/features/survey';

const DISTRIBUTE_STEPS = ['빌드 선택', '리소스 관리', '설문 오픈'];

export default function SurveyDistributePage() {
  const { survey, isLoading, isError, refetch, surveyUuid, gameUuid } =
    useOutletContext<SurveyShellContext>();

  const resolvedSurveyUuid = survey?.surveyUuid ?? surveyUuid ?? '';
  const {
    data: streamingResource,
    isLoading: isResourceLoading,
    refetch: refetchResource,
  } = useStreamingResource(resolvedSurveyUuid, !!resolvedSurveyUuid);

  const [selectedBuild, setSelectedBuild] = useState<Build | null>(null);

  // Determine current step based on state
  const getCurrentStep = () => {
    if (streamingResource) {
      return 2; // Step 3: 설문 오픈
    }
    if (selectedBuild) {
      return 1; // Step 2: 리소스 관리
    }
    return 0; // Step 1: 빌드 선택
  };

  const currentStep = getCurrentStep();

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
      <InlineAlert
        variant="error"
        title="설문을 찾을 수 없습니다."
      >
        다시 확인해 주세요.
      </InlineAlert>
    );
  }

  if (!gameUuid) {
    return (
      <InlineAlert
        variant="error"
        title="게임 정보를 확인할 수 없습니다."
      >
        게임을 다시 선택해주세요.
      </InlineAlert>
    );
  }

  const handleBuildSelect = (build: Build) => {
    setSelectedBuild(build);
  };

  const handleBackToStep1 = () => {
    setSelectedBuild(null);
  };

  const handleResourceCreated = () => {
    refetchResource();
  };

  const renderStepContent = () => {
    // Step 3: 설문 오픈 (리소스가 이미 생성된 경우)
    if (streamingResource) {
      return <SurveyOpenStep surveyUuid={resolvedSurveyUuid} />;
    }

    // Step 2: 리소스 관리 (빌드 선택 완료)
    if (selectedBuild) {
      return (
        <ResourceManagementStep
          surveyUuid={resolvedSurveyUuid}
          selectedBuild={selectedBuild}
          onBack={handleBackToStep1}
          onSuccess={handleResourceCreated}
        />
      );
    }

    // Step 1: 빌드 선택
    return (
      <BuildSelectionStep
        gameUuid={gameUuid}
        onSelectBuild={handleBuildSelect}
      />
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Distribute</h2>
        <p className="text-muted-foreground text-sm">
          빌드 연결과 리소스 관리를 진행합니다.
        </p>
      </div>

      <section className="bg-card space-y-4 rounded-lg border p-6">
        <div>
          <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            Deployment Steps
          </p>
          <h3 className="text-base font-semibold">배포 흐름</h3>
        </div>
        <Step
          steps={DISTRIBUTE_STEPS}
          currentStep={currentStep}
        />
      </section>

      <section className="bg-card rounded-lg border p-6">
        {isResourceLoading ? (
          <PageSpinner message="리소스 정보를 확인하는 중..." />
        ) : (
          renderStepContent()
        )}
      </section>
    </div>
  );
}
