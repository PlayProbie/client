import {
  BarChart3,
  ClipboardList,
  FolderUp,
  LayoutDashboard,
  Lightbulb,
  type LucideIcon,
  Pencil,
  Rocket,
} from 'lucide-react';

export interface NavItemChild {
  to: string;
  label: string;
}

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  children?: NavItemChild[];
}

/**
 * Survey Control Tower 탭 정의
 * - 상태(DRAFT/ACTIVE/CLOSED)에 따라 일부 탭의 수정 가능 여부가 달라짐
 */
export interface SurveyTab {
  path: string;
  label: string;
  icon: LucideIcon;
  /** DRAFT에서만 수정 가능한 탭인지 */
  editableOnlyInDraft?: boolean;
}

export const SURVEY_TABS: SurveyTab[] = [
  { path: 'overview', label: '개요', icon: BarChart3 },
  {
    path: 'design',
    label: '문항 설계',
    icon: Pencil,
    editableOnlyInDraft: true,
  },
  { path: 'distribute', label: '배포/연동', icon: Rocket },
  { path: 'analyze', label: '결과/인사이트', icon: Lightbulb },
];

/**
 * 설문 상태 정의 (상태 머신)
 * DRAFT → ACTIVE → CLOSED
 */
export type SurveyStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED';

export const SURVEY_STATUS_CONFIG: Record<
  SurveyStatus,
  { label: string; color: string; description: string }
> = {
  DRAFT: {
    label: '작성 중',
    color: 'bg-yellow-100 text-yellow-800',
    description: '문항 수정이 가능합니다.',
  },
  ACTIVE: {
    label: '진행 중',
    color: 'bg-green-100 text-green-800',
    description:
      '설문이 배포되어 응답을 수집 중입니다. 문항 수정이 불가합니다.',
  },
  CLOSED: {
    label: '종료됨',
    color: 'bg-gray-100 text-gray-800',
    description: '설문이 종료되었습니다. 결과 분석만 가능합니다.',
  },
};

// ============================================
// 기존 메인 네비게이션 (점진적 마이그레이션을 위해 유지)
// ============================================

export const NAV_ITEMS: NavItem[] = [
  {
    to: '/games/:gameUuid',
    label: '게임 대시보드',
    icon: LayoutDashboard,
  },
  {
    to: '/games/:gameUuid/surveys',
    label: '설문 목록',
    icon: ClipboardList,
  },
  {
    to: '/games/:gameUuid/builds',
    label: '빌드 저장소',
    icon: FolderUp,
  },
];

// SECONDARY_NAV_ITEMS 제거됨 - 설정 메뉴는 유저 카드 모달로 이동

// Get all nav items flattened for route matching
export function getAllNavItems(): NavItem[] {
  return [...NAV_ITEMS];
}

// Helper to match dynamic routes (e.g., /survey/analytics/:gameUuid)
function matchPath(pattern: string, pathname: string): boolean {
  // Convert pattern to regex (e.g., /survey/analytics/:gameUuid -> /survey/analytics/[^/]+)
  const regexPattern = pattern.replace(/:[^/]+/g, '[^/]+');
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(pathname);
}

// Find nav item by path
export function findNavItemByPath(pathname: string): {
  parent?: NavItem;
  child?: NavItemChild;
  breadcrumbs: { label: string; to: string }[];
} {
  const allItems = getAllNavItems();

  for (const item of allItems) {
    // Check if it's a child route
    if (item.children) {
      for (const child of item.children) {
        if (
          pathname === child.to ||
          pathname.startsWith(child.to + '/') ||
          matchPath(child.to, pathname)
        ) {
          return {
            parent: item,
            child,
            breadcrumbs: [
              { label: item.label, to: item.to },
              { label: child.label, to: child.to },
            ],
          };
        }
      }
    }

    // Check if it's the parent route itself
    if (
      pathname === item.to ||
      pathname.startsWith(item.to + '/') ||
      matchPath(item.to, pathname)
    ) {
      return {
        parent: item,
        breadcrumbs: [{ label: item.label, to: item.to }],
      };
    }
  }

  // Default to dashboard
  return {
    breadcrumbs: [{ label: '대시보드', to: '/games/:gameUuid' }],
  };
}
