# UI Conventions

이 문서는 프로젝트의 UI 패턴과 규칙을 정의합니다. 라우팅, 인증 가드, 레이아웃,
로딩 상태, 알림(Toast), 버튼 스타일 등의 사용법을 설명합니다.

---

## 목차

- [라우팅 (Routing)](#라우팅-routing)
- [인증 가드 (Guards)](#인증-가드-guards)
- [레이아웃 (Layout)](#레이아웃-layout)
- [로딩 상태 (Loading)](#로딩-상태-loading)
- [버튼 스타일 (Button)](#버튼-스타일-button)
- [알림 (Toast)](#알림-toast)

모든 라우트는 `src/app/router/routes.tsx`에서 `createBrowserRouter`를 사용하여
정의합니다.

```tsx
// src/app/router/routes.tsx
import { createBrowserRouter } from 'react-router-dom';
import { AuthLayout, GuestLayout, RootLayout } from './layouts';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // 인증이 필요한 라우트
      { element: <AuthLayout />, children: [...] },
      // 비인증 사용자 전용 라우트
      { element: <GuestLayout />, children: [...] },
      // 404 페이지
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
```

### 라우트 레이아웃

| 레이아웃      | 용도                               | 포함 요소                   |
| ------------- | ---------------------------------- | --------------------------- |
| `RootLayout`  | 전역 레이아웃 (Toast 등)           | `<Outlet />`, `<Toaster />` |
| `AuthLayout`  | 인증된 사용자 전용                 | `AuthGuard`, `PageLayout`   |
| `GuestLayout` | 비인증 사용자 전용 (로그인 페이지) | `GuestGuard`                |

### 라우트 추가 규칙

1. **보호된 라우트**: `AuthLayout` children에 추가
2. **공개 라우트**: `RootLayout` children에 직접 추가 (Guard 없이)
3. **비인증 전용**: `GuestLayout` children에 추가

```tsx
// 새 보호된 라우트 추가 예시
{
  element: <AuthLayout />,
  children: [
    { path: '/new-page', element: <NewPage /> },
  ],
}
```

---

## 인증 가드 (Guards)

### AuthGuard

인증된 사용자만 접근 가능한 경로를 보호합니다.

```tsx
// src/components/guards/AuthGuard.tsx
// - 미인증 시 /login으로 리다이렉트 (원래 경로 저장)
// - 로딩 중 PageSpinner 표시
// - useAuthStore의 isAuthenticated, isLoading 사용
```

### GuestGuard

비인증 사용자만 접근 가능한 경로를 보호합니다 (로그인 페이지 등).

```tsx
// src/components/guards/GuestGuard.tsx
// - 이미 인증된 경우 홈(/) 또는 이전 경로로 리다이렉트
// - 로딩 중 PageSpinner 표시
```

---

## 레이아웃 (Layout)

### PageLayout

인증된 페이지의 기본 레이아웃입니다. Sidebar와 Topbar를 포함합니다.

```
┌──────────────────────────────────────────┐
│ Sidebar │ Topbar                         │
│         │────────────────────────────────│
│         │                                │
│         │   Main Content                 │
│         │   (children)                   │
│         │                                │
└──────────────────────────────────────────┘
```

### 구조

```
src/components/layout/
├── PageLayout.tsx        # 메인 레이아웃 (Sidebar + Topbar + Content)
├── Sidebar.tsx           # 사이드바 컨테이너
├── Topbar.tsx            # 상단바 컨테이너
├── sidebar-components/   # Sidebar 하위 컴포넌트
│   ├── SidebarHeader.tsx
│   ├── SidebarNav.tsx
│   ├── NavItem.tsx
│   ├── UserProfile.tsx
│   ├── CollapseToggle.tsx
│   └── useSidebar.ts     # Sidebar 상태 훅
└── topbar-components/    # Topbar 하위 컴포넌트
    ├── BreadcrumbNav.tsx
    ├── WorkspaceSelector.tsx
    └── NotificationButton.tsx
```

### 네비게이션 설정

네비게이션 메뉴는 `src/config/navigation.ts`에서 관리합니다.

```tsx
export const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: '대시보드', icon: LayoutDashboard },
  {
    to: '/games',
    label: '내 게임',
    icon: Gamepad2,
    children: [
      { to: '/games/list', label: '게임 목록' },
      { to: '/games/new', label: '새 게임 등록' },
    ],
  },
];
```

---

## 로딩 상태 (Loading)

### 컴포넌트 종류

| 컴포넌트        | 용도                     | 사용 위치               |
| --------------- | ------------------------ | ----------------------- |
| `PageSpinner`   | 전체 페이지 로딩         | 페이지 초기 로딩, Guard |
| `Spinner`       | 인라인 로딩              | 버튼 옆, 섹션 내부      |
| `ButtonLoading` | 버튼 내부 로딩 상태      | 폼 제출 버튼            |
| `Skeleton`      | 콘텐츠 플레이스홀더      | 카드, 텍스트 로딩       |
| `TableSkeleton` | 테이블 로딩 플레이스홀더 | 테이블 데이터 로딩      |

### 사용 예시

```tsx
import { PageSpinner, Spinner, ButtonLoading, Skeleton } from '@/components/ui/loading';

// 페이지 로딩
if (isLoading) return <PageSpinner message="데이터를 불러오는 중..." />;

// 인라인 로딩
<div className="flex items-center gap-2">
  <Spinner size="sm" />
  <span>처리 중...</span>
</div>

// 버튼 로딩
<Button disabled={isPending}>
  <ButtonLoading isLoading={isPending} loadingText="저장 중...">
    저장하기
  </ButtonLoading>
</Button>

// 스켈레톤
<div className="space-y-2">
  <Skeleton className="h-4 w-3/4" />
  <Skeleton className="h-4 w-1/2" />
</div>
```

### 로딩 상태 처리 패턴

```tsx
function MyPage() {
  const { data, isLoading, isError } = useQuery(...);

  if (isLoading) return <PageSpinner />;
  if (isError) return <ErrorMessage />;
  return <Content data={data} />;
}
```

---

## 버튼 스타일 (Button)

### Import

```tsx
import {
  Button,
  SubmitButton,
  ResetButton,
  buttonVariants,
} from '@/components/ui';
```

### Button Variants

| Variant       | 용도                     |
| ------------- | ------------------------ |
| `outline`     | 기본 (테두리만)          |
| `default`     | Primary (SubmitButton용) |
| `destructive` | 삭제 (Red)               |
| `secondary`   | 보조                     |
| `ghost`       | 배경 없음                |
| `link`        | 링크 스타일              |

### Button Sizes

| Size   | 높이  |
| ------ | ----- |
| `sm`   | 32px  |
| `md`   | 36px  |
| `lg`   | 40px  |
| `icon` | 36x36 |

### SubmitButton (폼 제출)

`isPending` prop으로 로딩 상태를 관리합니다:

```tsx
// React 19 useActionState
const [state, formAction, isPending] = useActionState(
  submitAction,
  initialState
);

<form action={formAction}>
  <SubmitButton isPending={isPending}>제출</SubmitButton>
</form>;

// react-hook-form
const {
  handleSubmit,
  formState: { isSubmitting },
} = useForm();

<form onSubmit={handleSubmit(onSubmit)}>
  <SubmitButton isPending={isSubmitting}>저장</SubmitButton>
</form>;
```

### ResetButton (폼 초기화)

기본 variant는 `ghost`이며, RotateCcw 아이콘이 자동 포함됩니다:

```tsx
<form>
  <ResetButton>초기화</ResetButton>
</form>
```

### buttonVariants (커스텀 스타일)

버튼 스타일을 다른 요소에 적용할 때 사용합니다:

```tsx
import { buttonVariants } from '@/components/ui';

<Link className={buttonVariants({ variant: 'outline' })}>Navigate</Link>;
```

---

## 알림 (Toast)

### useToast 훅

Toast 알림은 `useToast` 훅을 사용하여 표시합니다.

```tsx
import { useToast } from '@/hooks/useToast';

function MyComponent() {
  const { toast } = useToast();

  const handleSuccess = () => {
    toast({
      variant: 'success',
      title: '저장 완료',
      description: '설정이 성공적으로 저장되었습니다.',
    });
  };

  const handleError = () => {
    toast({
      variant: 'destructive',
      title: '오류 발생',
      description: '저장 중 오류가 발생했습니다.',
    });
  };
}
```

### Toast Variants

| Variant       | 색상 | 용도              |
| ------------- | ---- | ----------------- |
| `default`     | 기본 | 일반 알림         |
| `success`     | 초록 | 성공 메시지       |
| `destructive` | 빨강 | 에러, 실패 메시지 |
| `warning`     | 노랑 | 경고 메시지       |
| `info`        | 파랑 | 정보성 메시지     |

### 설정

- 자동 사라짐: 5초
- 최대 표시 개수: 5개
- 위치: 화면 우측 상단

### Toaster 설정

`Toaster` 컴포넌트는 `RootLayout`에서 전역으로 렌더링됩니다.

```tsx
// src/app/router/layouts.tsx
export function RootLayout() {
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
}
```

---

## 체크리스트

새 페이지/컴포넌트 추가 시:

- [ ] 적절한 라우트 레이아웃 선택 (AuthLayout / GuestLayout / 없음)
- [ ] 로딩 상태에 적절한 로딩 컴포넌트 사용
- [ ] API 호출 결과에 Toast 알림 추가 (성공/실패)
- [ ] 에러 상태 UI 구현
