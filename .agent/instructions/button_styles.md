# Button 스타일 가이드

프로젝트의 버튼 컴포넌트 사용 가이드입니다. 새로운 버튼이 필요한 경우 반드시 이
컴포넌트들을 사용합니다.

---

## Import 경로

```tsx
import {
  Button,
  SubmitButton,
  ResetButton,
  buttonVariants,
} from '@/components/ui';
```

---

## Button (기본 버튼)

**기본 variant**: `outline` (primary는 SubmitButton 전용)

```tsx
// Variants
<Button>Outline (기본)</Button>               // 테두리만
<Button variant="default">Primary</Button>   // ⚠️ SubmitButton 사용 권장
<Button variant="destructive">Delete</Button> // 삭제 (Red)
<Button variant="secondary">Secondary</Button> // 보조
<Button variant="ghost">Ghost</Button>        // 배경 없음
<Button variant="link">Link</Button>          // 링크 스타일

// Sizes
<Button size="sm">Small</Button>   // 32px 높이
<Button size="md">Medium</Button>  // 36px 높이 (기본)
<Button size="lg">Large</Button>   // 40px 높이
<Button size="icon">Icon Only</Button> // 36x36

// asChild (Link로 렌더링)
<Button asChild>
  <a href="/path">Link Button</a>
</Button>
```

---

## SubmitButton (폼 제출)

`isPending` prop으로 로딩 상태를 관리합니다.

### React 19 useActionState

```tsx
const [state, formAction, isPending] = useActionState(
  submitAction,
  initialState
);

<form action={formAction}>
  <SubmitButton isPending={isPending}>제출</SubmitButton>
</form>;
```

### react-hook-form

```tsx
const {
  handleSubmit,
  formState: { isSubmitting },
} = useForm();

<form onSubmit={handleSubmit(onSubmit)}>
  <SubmitButton isPending={isSubmitting}>저장</SubmitButton>
</form>;
```

---

## ResetButton (폼 초기화)

기본 variant는 `ghost`이며, RotateCcw 아이콘이 자동 포함됩니다.

```tsx
<form>
  <ResetButton>초기화</ResetButton>
</form>
```

---

## buttonVariants (커스텀 스타일)

버튼 스타일을 다른 요소에 적용할 때 사용합니다.

```tsx
import { buttonVariants } from '@/components/ui';
import { Link } from 'react-router-dom';

<Link className={buttonVariants({ variant: 'outline' })}>Navigate</Link>;
```
