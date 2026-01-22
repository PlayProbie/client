/**
 * 테스터 대기열 페이지
 *
 * 게임 스트리밍 입장 전 대기열과 예상 대기시간을 표시합니다.
 * 일정 시간(기본 5초) 후 스트리밍 페이지로 이동합니다.
 */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { InlineAlert } from '@/components/ui/InlineAlert';
import {
  QueuePageSkeleton,
  QueueStatusCard,
  useSessionInfo,
} from '@/features/game-streaming-session';

/** 입장까지의 대기 시간 (초) */
const DEFAULT_WAIT_SECONDS = 5;

export default function QueuePage() {
  const { surveyUuid } = useParams<{ surveyUuid: string }>();
  const navigate = useNavigate();

  // 입장 가능 카운트다운
  const [countdown, setCountdown] = useState(DEFAULT_WAIT_SECONDS);

  // 세션 정보 조회
  const {
    data: sessionInfo,
    isLoading,
    isError,
    refetch,
  } = useSessionInfo(surveyUuid || '', !!surveyUuid);

  // 입장 가능 카운트다운
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  // 즉시 이동 핸들러
  const handleProceedNow = () => {
    if (surveyUuid) {
      navigate(`/play/${surveyUuid}`, { replace: true });
    }
  };

  // surveyUuid 없음
  if (!surveyUuid) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 py-10">
        <InlineAlert
          variant="error"
          title="잘못된 접근입니다."
        >
          설문 UUID를 확인해주세요.
        </InlineAlert>
      </div>
    );
  }

  // 로딩 중
  if (isLoading) {
    return <QueuePageSkeleton />;
  }

  // 에러
  if (isError || !sessionInfo) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 py-10">
        <InlineAlert
          variant="error"
          title="세션 정보를 불러오지 못했습니다."
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
          요청에 실패했습니다. 다시 시도해주세요.
        </InlineAlert>
      </div>
    );
  }

  const { gameName, isAvailable, waitTimeSeconds, queuePosition } = sessionInfo;

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* 게임 정보 */}
        <div className="space-y-2">
          <p className="text-primary text-sm font-semibold tracking-wide uppercase">
            Game Streaming
          </p>
          <h1 className="text-foreground text-3xl font-bold">{gameName}</h1>
        </div>

        {/* 대기열 정보 카드 */}
        <QueueStatusCard
          isAvailable={isAvailable}
          countdown={countdown}
          queuePosition={queuePosition}
          waitTimeSeconds={waitTimeSeconds}
          defaultWaitSeconds={DEFAULT_WAIT_SECONDS}
          onProceed={handleProceedNow}
          onRefetch={() => refetch()}
        />

        {/* 하단 안내 */}
        <p className="text-muted-foreground text-xs">
          게임 스트리밍은 Chrome 최신 버전 / PC 환경에서 최적화되어 있습니다.
        </p>
      </div>
    </div>
  );
}
