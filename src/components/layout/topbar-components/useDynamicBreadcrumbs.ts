import { useLocation, useParams } from 'react-router-dom';

import { findNavItemByPath } from '@/config/navigation';
import { useGameDetailQuery } from '@/features/game-streaming/hooks';

interface Breadcrumb {
  label: string;
  to: string;
}

/**
 * Hook to get dynamic breadcrumbs based on current route.
 * Handles special cases like game detail pages where we need to fetch data.
 */
export function useDynamicBreadcrumbs(): {
  breadcrumbs: Breadcrumb[];
  isLoading: boolean;
} {
  const location = useLocation();
  const params = useParams<{ gameUuid?: string }>();

  // Check if we're on a game detail page
  const isGameDetailPage =
    location.pathname.startsWith('/studio/games/') && params.gameUuid;

  // Fetch game data only when on game detail page
  const { data: game, isLoading: isGameLoading } = useGameDetailQuery(
    params.gameUuid || '',
    { enabled: !!isGameDetailPage }
  );

  // Get static breadcrumbs from navigation config
  const { breadcrumbs: staticBreadcrumbs } = findNavItemByPath(
    location.pathname
  );

  // If on game detail page, append game name to breadcrumbs
  if (isGameDetailPage) {
    const gameBreadcrumbs: Breadcrumb[] = [
      ...staticBreadcrumbs,
      {
        label: isGameLoading ? '' : game?.gameName || 'Unknown',
        to: '', // Current page, no link
      },
    ];
    return { breadcrumbs: gameBreadcrumbs, isLoading: isGameLoading };
  }

  return { breadcrumbs: staticBreadcrumbs, isLoading: false };
}
