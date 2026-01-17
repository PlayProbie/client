import { Button } from '@/components/ui/button';

interface QueueStatusCardProps {
  isAvailable: boolean;
  countdown: number;
  queuePosition: number;
  waitTimeSeconds: number;
  defaultWaitSeconds: number;
  onProceed: () => void;
  onRefetch: () => void;
}

export function QueueStatusCard({
  isAvailable,
  countdown,
  queuePosition,
  waitTimeSeconds,
  defaultWaitSeconds,
  onProceed,
  onRefetch,
}: QueueStatusCardProps) {
  return (
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
              <p className="text-muted-foreground text-sm">예상 대기 시간</p>
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
                        width: `${((defaultWaitSeconds - countdown) / defaultWaitSeconds) * 100}%`,
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
                  onClick={onProceed}
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
            onClick={onRefetch}
          >
            다시 확인하기
          </Button>
        </div>
      )}
    </div>
  );
}
