/**
 * GameShell - 게임 관리 Shell 레이아웃
 * Title + UUID Copy + Tabs + Outlet
 */
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/loading';
import { cn } from '@/lib/utils';

import { useGameDetailQuery } from '../hooks';

const TABS = [
  { label: 'Overview', path: 'overview' },
  { label: 'Builds', path: 'builds' },
  { label: 'Stream Settings', path: 'stream-settings' },
  { label: 'Surveys', path: 'surveys' },
] as const;

export function GameShell() {
  const { gameUuid: routeGameUuid } = useParams<{ gameUuid: string }>();
  // route placeholder(':gameUuid')가 아닌 유효한 UUID만 사용
  const gameUuid =
    routeGameUuid && !routeGameUuid.startsWith(':') ? routeGameUuid : undefined;
  const { data: game, isLoading } = useGameDetailQuery(gameUuid || '');
  const [copied, setCopied] = useState(false);

  const handleCopyUuid = async () => {
    if (!gameUuid) return;
    await navigator.clipboard.writeText(gameUuid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="bg-background border-b px-6 py-4">
        {/* Title */}
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">
            {isLoading ? (
              <Skeleton className="h-8 w-48" />
            ) : (
              game?.gameName || 'Unknown Game'
            )}
          </h1>
        </div>

        {/* UUID */}
        <div className="text-muted-foreground mt-2 flex items-center gap-2 text-sm">
          <span>UUID:</span>
          <code className="bg-muted rounded px-2 py-0.5 font-mono text-xs">
            {gameUuid}
          </code>
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={handleCopyUuid}
            title="Copy UUID"
          >
            {copied ? (
              <Check className="text-success size-3" />
            ) : (
              <Copy className="size-3" />
            )}
          </Button>
        </div>

        {/* Tabs */}
        <nav className="mt-4 flex gap-1">
          {TABS.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                cn(
                  'rounded-t-md px-4 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <Outlet />
      </div>
    </div>
  );
}
