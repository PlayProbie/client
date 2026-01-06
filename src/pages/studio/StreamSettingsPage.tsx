/**
 * StreamSettingsPage - 스트리밍 설정 페이지
 * Route: /games/:gameUuid/stream-settings
 */
import { useParams } from 'react-router-dom';

import { StreamSettingsForm } from '@/features/game-streaming';

export default function StreamSettingsPage() {
  const { gameUuid: routeGameUuid } = useParams<{ gameUuid: string }>();
  // route placeholder(':gameUuid')가 아닌 유효한 UUID만 사용
  const gameUuid =
    routeGameUuid && !routeGameUuid.startsWith(':') ? routeGameUuid : undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">Stream Settings</h2>
        <p className="text-muted-foreground text-sm">
          스트리밍 환경 설정을 구성합니다.
        </p>
      </div>

      {/* Form */}
      <div className="bg-card rounded-lg border p-6">
        {gameUuid && <StreamSettingsForm gameUuid={gameUuid} />}
      </div>
    </div>
  );
}
