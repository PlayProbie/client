import { useMemo, useState } from 'react';
import { generatePath, useLocation } from 'react-router-dom';

import type { NavItem, NavItemChild } from '@/config/navigation';

// =============================================================================
// Types
// =============================================================================

interface ResolveParams {
  gameUuid?: string;
  surveyUuid?: string;
}

interface ResolvedChild extends NavItemChild {
  resolvedTo: string;
}

type ActiveState = 'exact' | 'partial' | 'none';

interface NavItemState {
  resolvedPath: string;
  resolvedChildren?: ResolvedChild[];
  activeState: ActiveState;
  isExpanded: boolean;
  setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}

// =============================================================================
// Path Resolution
// =============================================================================

/**
 * 동적 경로를 실제 경로로 변환
 * - :gameUuid가 없으면 원본 경로 반환
 * - :surveyUuid가 있는데 surveyUuid가 없으면:
 *   - /design 경로: 생성 모드(/games/:gameUuid/surveys/design)로 fallback
 *   - 나머지: 설문 목록(/games/:gameUuid/surveys)으로 fallback
 */
export function resolveDynamicPath(
  path: string,
  params: ResolveParams
): string {
  const { gameUuid, surveyUuid } = params;

  // gameUuid가 필요한데 없으면 원본 경로 반환
  if (path.includes(':gameUuid') && !gameUuid) {
    return path;
  }

  // surveyUuid가 필요한데 없으면 fallback 처리
  if (path.includes(':surveyUuid') && !surveyUuid) {
    if (gameUuid) {
      // 문항 설계는 생성 모드로 fallback
      if (path.endsWith('/design')) {
        return `/games/${gameUuid}/surveys/design`;
      }
      // 나머지는 설문 목록으로 fallback
      return `/games/${gameUuid}/surveys`;
    }
    return path;
  }

  try {
    const pathParams: Record<string, string> = {};
    if (gameUuid) pathParams.gameUuid = gameUuid;
    if (surveyUuid) pathParams.surveyUuid = surveyUuid;
    return generatePath(path, pathParams);
  } catch {
    return path;
  }
}

// =============================================================================
// Active State Calculation
// =============================================================================

function calculateActiveState(
  pathname: string,
  resolvedPath: string,
  resolvedChildren?: ResolvedChild[]
): ActiveState {
  const isExactActive = pathname === resolvedPath;
  if (isExactActive) return 'exact';

  const isPathActive = pathname.startsWith(resolvedPath + '/');
  const isChildActive = resolvedChildren?.some(
    (child) =>
      pathname === child.resolvedTo ||
      pathname.startsWith(child.resolvedTo + '/')
  );

  if (isPathActive || isChildActive) return 'partial';
  return 'none';
}

function shouldExpandInitially(
  pathname: string,
  resolvedPath: string,
  resolvedChildren?: ResolvedChild[]
): boolean {
  if (pathname.startsWith(resolvedPath)) return true;
  return (
    resolvedChildren?.some((child) => pathname.startsWith(child.resolvedTo)) ??
    false
  );
}

// =============================================================================
// Hook
// =============================================================================

export function useNavItemState(
  item: NavItem,
  params: ResolveParams
): NavItemState {
  const location = useLocation();
  const pathname = location.pathname;

  const resolvedPath = useMemo(
    () => resolveDynamicPath(item.to, params),
    [item.to, params]
  );

  const resolvedChildren = useMemo(
    () =>
      item.children?.map((child) => ({
        ...child,
        resolvedTo: resolveDynamicPath(child.to, params),
      })),
    [item.children, params]
  );

  const [isExpanded, setIsExpanded] = useState(() =>
    shouldExpandInitially(pathname, resolvedPath, resolvedChildren)
  );

  const activeState = useMemo(
    () => calculateActiveState(pathname, resolvedPath, resolvedChildren),
    [pathname, resolvedPath, resolvedChildren]
  );

  return {
    resolvedPath,
    resolvedChildren,
    activeState,
    isExpanded,
    setIsExpanded,
  };
}
