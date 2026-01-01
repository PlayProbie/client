# Routing Conventions

이 프로젝트는 **react-router-dom v7**의 `createBrowserRouter`를 사용한 중앙
집중식 라우팅을 사용합니다.

---

## 라우트 구조

```
src/app/router/
├── layouts.tsx   # 레이아웃 컴포넌트 (RootLayout, AuthLayout, GuestLayout)
├── routes.tsx    # 라우트 설정
└── index.ts      # Barrel export
```

### 레이아웃 계층

```
RootLayout                    ← 전역 (Toaster 등)
├── AuthLayout               ← 인증 필요 경로 (AuthGuard 적용)
│   ├── /                    → WorkspaceDashboard
│   ├── /workspace          → WorkspacePage
│   └── /survey/:id         → SurveyDetailPage
├── GuestLayout              ← 비인증 전용 경로 (GuestGuard 적용)
│   └── /login              → LoginPage
└── /*                       → NotFoundPage (404)
```

---

## Guard 컴포넌트

| Guard        | 위치                     | 역할                         |
| ------------ | ------------------------ | ---------------------------- |
| `AuthGuard`  | `src/components/guards/` | 인증 필요 경로 보호          |
| `GuestGuard` | `src/components/guards/` | 로그인 페이지 등 비인증 전용 |

### Guard 동작

- **AuthGuard**: 미인증 → `/login`으로 리다이렉트 (원래 경로 저장)
- **GuestGuard**: 인증됨 → 원래 가려던 경로 또는 `/`로 리다이렉트

---

## 새 라우트 추가 방법

### 1. 인증 필요 라우트

`src/app/router/routes.tsx`의 `AuthLayout` children에 추가:

```tsx
{
  element: <AuthLayout />,
  children: [
    { path: '/', element: <WorkspaceDashboard /> },
    // 새 라우트 추가 ↓
    { path: '/workspace', lazy: () => import('@/pages/workspace/WorkspacePage') },
    { path: '/survey/:surveyId', lazy: () => import('@/pages/survey/SurveyDetailPage') },
  ],
}
```

### 2. 공개 라우트 (로그인 불필요)

`RootLayout` children에 직접 추가:

```tsx
{
  element: <RootLayout />,
  children: [
    { element: <AuthLayout />, children: [...] },
    { element: <GuestLayout />, children: [...] },
    // 공개 라우트 ↓
    { path: '/about', lazy: () => import('@/pages/AboutPage') },
    { path: '*', element: <NotFoundPage /> },
  ],
}
```

### 3. Lazy Loading 사용

코드 스플리팅을 위해 `lazy()` 함수를 사용합니다:

```tsx
// ✅ Lazy loading (권장)
{ path: '/survey/:id', lazy: () => import('@/pages/survey/SurveyDetailPage') }

// ⚠️ 직접 import (초기 번들에 포함됨)
{ path: '/', element: <WorkspaceDashboard /> }
```

---

## 페이지 파일 컨벤션

```
src/pages/
├── WorkspaceDashboard.tsx              # 메인 대시보드
├── NotFoundPage.tsx          # 404 페이지
├── auth/
│   └── LoginPage.tsx         # 로그인
├── workspace/
│   └── WorkspacePage.tsx     # 워크스페이스
└── survey/
    ├── SurveyDetailPage.tsx  # 설문 상세
    └── SurveyChatPage.tsx    # 설문 채팅
```

### Lazy 호환 Export

`lazy()` 사용 시 **default export** 필요:

```tsx
// ✅ 올바른 방식
export default function SurveyDetailPage() {
  return <div>...</div>;
}

// ❌ Named export만 있으면 lazy 불가
export function SurveyDetailPage() { ... }
```
