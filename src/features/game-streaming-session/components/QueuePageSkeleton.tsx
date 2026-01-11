import { Skeleton } from '@/components/ui/loading/Skeleton';

// 로딩 스켈레톤 컴포넌트
export function QueuePageSkeleton() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* 게임 정보 스켈레톤 */}
        <div className="space-y-4">
          <Skeleton className="mx-auto h-4 w-32" />
          <Skeleton className="mx-auto h-9 w-64" />
        </div>

        {/* 대기열 정보 카드 스켈레톤 */}
        <div className="bg-surface space-y-8 rounded-xl border border-slate-200 p-8 shadow-md">
          {/* 대기열 위치 */}
          <div className="space-y-2">
            <Skeleton className="mx-auto h-5 w-24" />
            <Skeleton className="mx-auto h-16 w-32" />
          </div>

          {/* 예상 대기 시간 */}
          <div className="space-y-2">
            <Skeleton className="mx-auto h-5 w-24" />
            <Skeleton className="mx-auto h-8 w-40" />
          </div>

          {/* 하단 컨트롤 영역 (min-h-[140px] 대응) */}
          <div className="min-h-[140px] space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-2 w-full rounded-full" />
              <Skeleton className="mx-auto h-5 w-48" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        {/* 하단 안내 스켈레톤 */}
        <Skeleton className="mx-auto h-4 w-80" />
      </div>
    </div>
  );
}
