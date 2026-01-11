/**
 * 테스터 대기열 페이지
 *
 * 게임 스트리밍 입장 전 대기열과 예상 대기시간을 표시합니다.
 * 일정 시간(기본 10초) 후 스트리밍 페이지로 이동합니다.
 */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { useSessionInfo } from '@/features/game-streaming-session';

import { QueuePageSkeleton } from './components/QueuePageSkeleton';

/** 입장까지의 대기 시간 (초) */
const DEFAULT_WAIT_SECONDS = 10;

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
        <div className="bg-surface rounded-xl border border-slate-200 p-8 shadow-md">
          {isAvailable ? (
            <>
              {/* 대기열 위치 */}
              <div className="mb-6 space-y-1">
                <p className="text-muted-foreground text-sm">현재 대기 순번</p>
                <p className="text-primary text-5xl font-bold">
                  {countdown > 0
                    ? queuePosition > 0
                      ? `#${queuePosition}`
                      : '#1'
                    : '접속 가능'}
                </p>
              </div>

              {/* 예상 대기 시간 */}
              {waitTimeSeconds > 0 && (
                <div className="mb-8 space-y-1">
                  <p className="text-muted-foreground text-sm">
                    예상 대기 시간
                  </p>
                  <p className="text-foreground text-2xl font-semibold">
                    약 {Math.ceil(waitTimeSeconds / 60)}분
                  </p>
                </div>
              )}

              <div className="min-h-[140px]">
                {countdown > 0 ? (
                  <>
                    {/* 대기 중 프로그레스 */}
                    <div className="mb-6 space-y-3">
                      <div className="relative h-2 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="bg-primary absolute inset-y-0 left-0 transition-all duration-1000 ease-linear"
                          style={{
                            width: `${((DEFAULT_WAIT_SECONDS - countdown) / DEFAULT_WAIT_SECONDS) * 100}%`,
                          }}
                        />
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {countdown}초 후 입장 가능합니다
                      </p>
                    </div>

                    {/* 대기 중에는 버튼 비활성화 */}
                    <Button
                      className="w-full"
                      disabled
                    >
                      대기 중...
                    </Button>
                  </>
                ) : (
                  <>
                    {/* 대기 완료 표시 */}
                    <div className="mb-6 space-y-3">
                      <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                        <svg
                          className="h-5 w-5 text-emerald-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-emerald-600">
                        입장 준비가 완료되었습니다!
                      </p>
                    </div>

                    {/* 입장 버튼 */}
                    <Button
                      className="w-full"
                      onClick={handleProceedNow}
                    >
                      게임 입장하기
                    </Button>
                  </>
                )}
              </div>
            </>
          ) : (
            // 접속 불가
            <div className="space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                <svg
                  className="h-8 w-8 text-amber-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <p className="text-foreground text-lg font-medium">
                현재 접속 가능한 세션이 없습니다
              </p>
              <p className="text-muted-foreground text-sm">
                잠시 후 다시 시도해주세요.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => refetch()}
              >
                다시 확인하기
              </Button>
            </div>
          )}
        </div>

        {/* 하단 안내 */}
        <p className="text-muted-foreground text-xs">
          게임 스트리밍은 Chrome 최신 버전 / PC 환경에서 최적화되어 있습니다.
        </p>
      </div>
    </div>
  );
}
