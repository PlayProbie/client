/**
 * SurveySessionStartPage - 새 설문 세션 생성 및 리다이렉트
 * URL: /surveys/session/:surveyId
 */

import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { createChatSession } from '@/features/survey-session';

function SurveySessionStartPage() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const isSessionStarted = useRef(false);

  useEffect(() => {
    // StrictMode에서 이중 호출 방지
    if (isSessionStarted.current) return;
    isSessionStarted.current = true;

    const startSession = async () => {
      if (!surveyId) {
        setError('잘못된 설문 ID입니다.');
        return;
      }

      try {
        const response = await createChatSession({
          surveyUuid: surveyId, // URL에서 받은 survey_uuid
        });

        const { session, sse_url: sseUrl } = response.result;

        // 세션 정보를 state로 전달하면서 리다이렉트
        // 첫 질문은 SSE connect 후 question 이벤트로 수신됨
        navigate(`/surveys/session/sessions/${session.session_uuid}`, {
          replace: true,
          state: {
            surveyId: session.survey_id,
            sessionUuid: session.session_uuid,
            sseUrl: sseUrl,
          },
        });
      } catch {
        setError('세션 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    };

    startSession();
  }, [surveyId, navigate]);

  if (error) {
    return (
      <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-destructive mb-4 text-xl font-semibold">오류</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="bg-primary text-primary-foreground rounded-md px-4 py-2"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4">
      <Loader2 className="text-primary mb-4 size-8 animate-spin" />
      <p className="text-muted-foreground">설문을 준비하고 있습니다...</p>
    </div>
  );
}

export default SurveySessionStartPage;
