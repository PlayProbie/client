/**
 * SurveySessionPage - 설문 세션 진행 페이지
 * URL: /surveys/session/sessions/:sessionId
 */

import { useLocation, useParams } from 'react-router-dom';

import { Button } from '@/components/ui';
import { Spinner } from '@/components/ui/loading';
import {
  ChatHeader,
  ChatInput,
  ChatMessageList,
  useChatSession,
} from '@/features/survey-session';

function SurveySessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const location = useLocation();

  // SurveySessionStartPage에서 전달받은 state
  const state = location.state as {
    surveyId?: number;
    sessionUuid?: string;
  } | null;

  // sessionId는 문자열로 사용 (UUID 지원)
  const sessionUuid = sessionId || '';

  const {
    isReady,
    isComplete,
    isLoading,
    isStreaming,
    error,
    messages,
    sendAnswer,
  } = useChatSession({
    sessionUuid,
    surveyId: state?.surveyId,
  });

  // 로딩 상태
  if (!isReady) {
    return (
      <div className="bg-background flex min-h-screen flex-col items-center justify-center">
        <Spinner
          size="lg"
          className="text-primary mb-4"
        />
        <p className="text-muted-foreground">대화를 불러오고 있습니다...</p>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-destructive mb-4 text-xl font-semibold">오류</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>다시 시도</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background flex min-h-screen flex-col">
      {/* 헤더 */}
      <ChatHeader />

      {/* 메시지 목록 */}
      <ChatMessageList
        messages={messages}
        isLoading={isLoading && !isStreaming}
        className="flex-1"
      />

      {/* 입력 영역 */}
      <ChatInput
        onSend={sendAnswer}
        disabled={isComplete}
        placeholder={
          isComplete ? '설문이 완료되었습니다' : '답변을 입력하세요...'
        }
      />
    </div>
  );
}

export default SurveySessionPage;
