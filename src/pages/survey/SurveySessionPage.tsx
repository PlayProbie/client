/**
 * SurveySessionPage - 설문 세션 진행 페이지
 * URL: /surveys/session/sessions/:sessionUuid
 */

import { useEffect, useState } from 'react';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui';
import { Spinner } from '@/components/ui/loading';
import {
  ChatHeader,
  ChatInput,
  ChatMessageList,
  CompletionModal,
  useChatSession,
} from '@/features/survey-session';

// 설문 완료 후 모달 표시까지 대기 시간 (ms)
const MODAL_OPEN_DELAY_MS = 3000;

function SurveySessionPage() {
  const { sessionUuid: sessionUuidParam } = useParams<{
    sessionUuid: string;
  }>();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // 완료 모달 상태
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  // SurveySessionStartPage에서 전달받은 state 또는 query param
  const state = location.state as {
    surveyUuid?: string;
    sessionUuid?: string;
  } | null;

  // sessionUuid는 문자열로 사용
  const sessionUuid = sessionUuidParam || '';
  // surveyUuid는 state 또는 query param에서 가져옴
  const surveyUuid = state?.surveyUuid || searchParams.get('surveyUuid') || '';

  const { isReady, isComplete, error, messages, sendAnswer } = useChatSession({
    sessionUuid,
    surveyUuid,
  });

  // 완료 시 3초 후 모달 표시
  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => {
        setShowCompleteModal(true);
      }, MODAL_OPEN_DELAY_MS);

      return () => clearTimeout(timer);
    }
  }, [isComplete]);

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
        isLoading={false}
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

      {/* 완료 모달 */}
      {showCompleteModal && (
        <CompletionModal onClose={() => setShowCompleteModal(false)} />
      )}
    </div>
  );
}

export default SurveySessionPage;
