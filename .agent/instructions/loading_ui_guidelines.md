# Loading UI Guidelines

## 🚨 CRITICAL: 로딩 UI 구현 전 필수 확인

새로운 컴포넌트에서 로딩 상태를 표시할 때, **반드시 기존 로딩 UI 컴포넌트를 먼저
확인**하세요. 인라인으로 `animate-spin`이나 스켈레톤을 직접 구현하지 마세요.

---

## 사용 가능한 로딩 컴포넌트

| 컴포넌트        | Import                          | 용도                |
| --------------- | ------------------------------- | ------------------- |
| `Skeleton`      | `@/components/ui/Skeleton`      | 콘텐츠 플레이스홀더 |
| `Spinner`       | `@/components/ui/Spinner`       | 인라인 로딩 표시    |
| `PageSpinner`   | `@/components/ui/PageSpinner`   | 전체 페이지 로딩    |
| `TableSkeleton` | `@/components/ui/TableSkeleton` | 테이블 데이터 로딩  |
| `ButtonLoading` | `@/components/ui/ButtonLoading` | 버튼 로딩 상태      |

---

## 사용 예시

### 페이지 로딩

```tsx
import { PageSpinner } from '@/components/ui';

function MyPage() {
  const { isLoading, data } = useQuery(...);

  if (isLoading) {
    return <PageSpinner message="데이터를 불러오는 중..." />;
  }

  return <div>{/* content */}</div>;
}
```

### 테이블 로딩

```tsx
import { TableSkeleton } from '@/components/ui';

function DataTable() {
  if (isLoading) {
    return (
      <TableSkeleton
        columns={5}
        rows={10}
      />
    );
  }

  return <table>{/* ... */}</table>;
}
```

### 버튼 로딩

```tsx
import { ButtonLoading } from '@/components/ui';

function SubmitButton({ isPending }: { isPending: boolean }) {
  return (
    <button disabled={isPending}>
      <ButtonLoading
        isLoading={isPending}
        loadingText="저장 중..."
      >
        저장
      </ButtonLoading>
    </button>
  );
}
```

### 스켈레톤 조합

```tsx
import { Skeleton } from '@/components/ui';

function CardSkeleton() {
  return (
    <div className="space-y-3 rounded-lg border p-4">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}
```

### 스피너 (인라인)

```tsx
import { Spinner } from '@/components/ui';

function LoadingIndicator() {
  return (
    <div className="flex items-center gap-2">
      <Spinner size="sm" />
      <span>처리 중...</span>
    </div>
  );
}
```

---

## ⚠️ 주의사항

### ❌ 하지 마세요

```tsx
// ❌ 인라인 스피너 직접 구현
<div className="animate-spin rounded-full border-2 border-primary border-t-transparent h-4 w-4" />

// ❌ 인라인 스켈레톤 직접 구현
<div className="animate-pulse bg-muted h-4 rounded" />
```

### ✅ 이렇게 하세요

```tsx
// ✅ Spinner 컴포넌트 사용
<Spinner size="sm" />

// ✅ Skeleton 컴포넌트 사용
<Skeleton className="h-4" />
```

---

## 컴포넌트 속성

### Skeleton

| Prop        | Type      | Default | Description           |
| ----------- | --------- | ------- | --------------------- |
| `shimmer`   | `boolean` | `false` | 시머 효과 사용 여부   |
| `className` | `string`  | -       | 추가 스타일 (h, w 등) |

### Spinner

| Prop   | Type                   | Default | Description |
| ------ | ---------------------- | ------- | ----------- |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'`  | 스피너 크기 |

### PageSpinner

| Prop      | Type     | Default | Description |
| --------- | -------- | ------- | ----------- |
| `message` | `string` | -       | 로딩 메시지 |

### TableSkeleton

| Prop         | Type      | Default | Description    |
| ------------ | --------- | ------- | -------------- |
| `columns`    | `number`  | `4`     | 컬럼 수        |
| `rows`       | `number`  | `5`     | 행 수          |
| `showHeader` | `boolean` | `true`  | 헤더 표시 여부 |

### ButtonLoading

| Prop          | Type        | Default        | Description         |
| ------------- | ----------- | -------------- | ------------------- |
| `isLoading`   | `boolean`   | `false`        | 로딩 상태           |
| `loadingText` | `string`    | `'로딩 중...'` | 로딩 중 표시 텍스트 |
| `children`    | `ReactNode` | -              | 기본 버튼 내용      |

---

## 디자인 시스템 연동

- **색상**: `--primary` (스피너), `--muted` (스켈레톤)
- **애니메이션**: Tailwind `animate-pulse`, `animate-spin`
- **다크모드**: 자동 지원 (디자인 토큰 기반)
