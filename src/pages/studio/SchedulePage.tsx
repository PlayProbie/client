/**
 * SchedulePage - 스케줄 설정 페이지
 * Route: /studio/games/:gameUuid/schedule
 */
import { useParams } from 'react-router-dom';

import { ScheduleForm } from '@/features/game-streaming';

export default function SchedulePage() {
  const { gameUuid } = useParams<{ gameUuid: string }>();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">Schedule</h2>
        <p className="text-muted-foreground text-sm">
          게임 스트리밍 활성화 기간을 설정합니다.
        </p>
      </div>

      {/* Form */}
      <div className="bg-card rounded-lg border p-6">
        {gameUuid && <ScheduleForm gameUuid={gameUuid} />}
      </div>
    </div>
  );
}
