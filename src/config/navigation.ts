import {
  FlaskConical,
  Gamepad2,
  Gift,
  LayoutDashboard,
  type LucideIcon,
  Settings,
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

export const NAV_ITEMS: NavItem[] = [
  {
    to: '/dashboard',
    label: '대시보드',
    icon: LayoutDashboard,
  },
  {
    to: '/games',
    label: '내 게임',
    icon: Gamepad2,
    children: [
      { to: '/games/list', label: '게임 목록' },
      { to: '/games/new', label: '새 게임 등록' },
      { to: '/settings/team', label: '팀 관리' },
    ],
  },
  {
    to: '/survey',
    label: '설문 관리',
    icon: FlaskConical,
    children: [
      { to: '/survey', label: '설문 관리' },
      { to: '/survey/create/step-0', label: '설문 생성' },
      { to: '/survey/analytics/1', label: '설문 응답 결과' }, // NOTE: MVP 단계에서는 gameId를 하드코딩해서 사용
    ],
  },
  {
    to: '/rewards',
    label: '리워드 관리',
    icon: Gift,
    children: [
      { to: '/rewards/list', label: '리워드 목록' },
      { to: '/rewards/distribution', label: '지급 현황' },
    ],
  },
];

export const SECONDARY_NAV_ITEMS: NavItem[] = [
  {
    to: '/settings',
    label: '설정',
    icon: Settings,
    children: [{ to: '/settings/account', label: '계정 설정' }],
  },
];

// Get all nav items flattened for route matching
export function getAllNavItems(): NavItem[] {
  return [...NAV_ITEMS, ...SECONDARY_NAV_ITEMS];
}

// Helper to match dynamic routes (e.g., /survey/analytics/:gameId)
function matchPath(pattern: string, pathname: string): boolean {
  // Convert pattern to regex (e.g., /survey/analytics/:gameId -> /survey/analytics/[^/]+)
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
    breadcrumbs: [{ label: '대시보드', to: '/dashboard' }],
  };
}
