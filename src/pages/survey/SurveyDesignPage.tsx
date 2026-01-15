import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Link, useLocation, useOutletContext, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import type { SurveyShellContext } from '@/features/survey/components/SurveyShell';
import {
  type SubmitResult, // Assuming SurveyDesignForm exports this or similar via features/survey-design
  SurveyCreated,
  SurveyDesignForm,
} from '@/features/survey-design';
import { useSurveyFormStore } from '@/features/survey-design/store/useSurveyFormStore';
import { versionKeys } from '@/features/version/hooks/keys';
// SubmitResult가 features/survey-design/index.ts에서 export되어야 함. 확인 필요.

function useSurveyShellContextSafe() {
  try {
    return useOutletContext<SurveyShellContext>();
  } catch {
    return undefined;
  }
}

function SurveyDesignPage() {
  const params = useParams<{ gameUuid: string }>();
  const location = useLocation();
  const queryClient = useQueryClient();
  const shellContext = useSurveyShellContextSafe();
  const resetForm = useSurveyFormStore((state) => state.reset);

  // 페이지 진입 시 초기화 로직 (새로고침 제외)
  useEffect(() => {
    const entries = performance.getEntriesByType('navigation');
    const navTiming = entries[0] as PerformanceNavigationTiming;

    // 새로고침(reload)이 아닌 경우에만 스토어 초기화
    // 즉, 다른 페이지에서 진입했거나 뒤로가기로 왔을 때 등은 초기화하여 이전 데이터 삭제
    if (navTiming && navTiming.type !== 'reload') {
      resetForm();
    }
  }, [resetForm]);

  const [isCompleted, setIsCompleted] = useState(false);
  const [createdSurveyUuid, setCreatedSurveyUuid] = useState<string | null>(null);

  const handleComplete = (result: SubmitResult) => {
    setCreatedSurveyUuid(result.surveyUuid);
    setIsCompleted(true);

    // 설문 생성 후 설문 목록 쿼리 무효화 (버전 상세 페이지 갱신용)
    const versionUuid = location.state?.versionUuid;
    if (versionUuid) {
      queryClient.invalidateQueries({ queryKey: versionKeys.surveys(versionUuid) });
    }
  };

  const isEditing = Boolean(shellContext?.survey);
  const title = isEditing
    ? `설문 수정 · ${shellContext?.survey?.surveyName ?? ''}`
    : '새 설문을 설계하세요';

  const description = isEditing
    ? '설문의 문항을 수정하거나 삭제할 수 있습니다.'
    : '새로운 설문을 만들어 테스터에게 배포해 보세요.';

  if (!params.gameUuid) {
    return <div>잘못된 접근입니다.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="border-border bg-card flex flex-col gap-3 rounded-lg border p-6">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-3">
          {isEditing && <Button variant="destructive">설문 삭제</Button>}
          {!isEditing && params.gameUuid && (
            <Button
              variant="ghost"
              size="sm"
              asChild
            >
              <Link to={`/games/${params.gameUuid}/surveys`}>
                설문 관리로 돌아가기
              </Link>
            </Button>
          )}
        </div>
      </div>

      {isCompleted && createdSurveyUuid ? (

        <SurveyCreated
          gameUuid={params.gameUuid}
          surveyUuid={createdSurveyUuid}

        />
      ) : (
        <SurveyDesignForm onComplete={handleComplete} />
      )}
    </div>
  );
}

export default SurveyDesignPage;
