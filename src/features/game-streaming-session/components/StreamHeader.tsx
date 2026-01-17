import { Clock, Gamepad2, Wifi, WifiOff } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { formatTime } from '../lib/time';
import type { StreamSettingsInfo } from '../types';

interface StreamHeaderProps {
  gameName?: string;
  streamSettings?: StreamSettingsInfo | null;
  isConnected: boolean;
  isConnecting: boolean;
  isTerminating: boolean;
  sessionUuid?: string;
  remainingTime: number;
  onDisconnect: () => void;
}

export function StreamHeader({
  gameName,
  streamSettings,
  isConnected,
  isConnecting,
  isTerminating,
  sessionUuid,
  remainingTime,
  onDisconnect,
}: StreamHeaderProps) {
  // 남은 시간 경고 상태
  const isTimeWarning = remainingTime <= 30 && remainingTime > 0;
  const isTimeCritical = remainingTime <= 10 && remainingTime > 0;

  return (
    <header className="bg-surface flex items-center justify-between border-b border-slate-200 px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-lg">
          <Gamepad2 className="text-primary h-5 w-5" />
        </div>
        <div>
          <h1 className="text-foreground text-base font-semibold">
            {gameName}
          </h1>
          {streamSettings && (
            <p className="text-muted-foreground text-xs">
              {streamSettings.resolution} • {streamSettings.fps} FPS
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* 연결 상태 표시 */}
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <Wifi className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-600">
                연결됨
              </span>
            </>
          ) : isConnecting ? (
            <>
              <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
              <span className="text-muted-foreground text-sm">연결 중...</span>
            </>
          ) : (
            <>
              <WifiOff className="text-muted-foreground h-4 w-4" />
              <span className="text-muted-foreground text-sm">연결 대기</span>
            </>
          )}
        </div>

        {/* 남은 시간 표시 */}
        {isConnected && (
          <div
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 ${
              isTimeCritical
                ? 'animate-pulse bg-red-100 text-red-600'
                : isTimeWarning
                  ? 'bg-amber-100 text-amber-600'
                  : 'bg-slate-100 text-slate-600'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span className="font-mono text-sm font-medium">
              {formatTime(remainingTime)}
            </span>
          </div>
        )}

        {/* 세션 종료 버튼 */}
        {isConnected && sessionUuid && (
          <Button
            variant="destructive"
            size="sm"
            onClick={onDisconnect}
            disabled={isTerminating}
          >
            {isTerminating ? '종료 중...' : '게임 종료'}
          </Button>
        )}
      </div>
    </header>
  );
}
