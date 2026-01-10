import { useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import type { SurveyShellContext } from '@/features/survey/components/SurveyShell';
import {
  type SubmitResult, // Assuming SurveyDesignForm exports this or similar via features/survey-design
  SurveyCreated,
  SurveyDesignForm,
} from '@/features/survey-design';
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
  const shellContext = useSurveyShellContextSafe();

  const [isCompleted, setIsCompleted] = useState(false);
  const [surveyUrl, setSurveyUrl] = useState<string | null>(null);

  const handleComplete = (result: SubmitResult) => {
    setSurveyUrl(result.surveyUrl);
    setIsCompleted(true);
  };

  const isEditing = Boolean(shellContext?.survey);
  const title = isEditing
    ? `설문 수정 · ${shellContext?.survey?.surveyName ?? ''}`
    : '새 설문을 설계하세요';

  const description = isEditing
    ? '설문의 문항을 수정하거나 삭제할 수 있습니다.'
    : '새로운 설문을 만들어 테스터에게 배포해 보세요.';

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

      {isCompleted && surveyUrl ? (
        <SurveyCreated surveyUrl={surveyUrl} />
      ) : (
        <SurveyDesignForm onComplete={handleComplete} />
      )}
    </div>
  );
}

export default SurveyDesignPage;
