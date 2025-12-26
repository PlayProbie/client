# Tech Stack

이 문서는 프로젝트의 기술 스택과 버전을 정의합니다. **반드시 명시된 버전에 맞는
문법과 API를 사용해야 합니다.**

---

## Core

| 기술           | 버전      | 비고                        |
| -------------- | --------- | --------------------------- |
| **React**      | `^19.2.0` | React 19 신규 API 사용 가능 |
| **TypeScript** | `~5.9.3`  | 최신 TS 문법 사용           |
| **Vite**       | `^7.2.4`  | 빌드 도구                   |

---

## Styling

| 기술                  | 버전      | 비고                         |
| --------------------- | --------- | ---------------------------- |
| **Tailwind CSS**      | `^4.1.18` | v4 CSS-first 설정 방식 사용  |
| **@tailwindcss/vite** | `^4.1.18` | Vite 플러그인                |
| **tw-animate-css**    | `^1.4.0`  | 애니메이션 유틸리티 (devDep) |

### 유틸리티

| 기술                         | 버전     | 용도                   |
| ---------------------------- | -------- | ---------------------- |
| **class-variance-authority** | `^0.7.1` | 컴포넌트 variants 정의 |
| **clsx**                     | `^2.1.1` | 조건부 클래스 조합     |
| **tailwind-merge**           | `^3.4.0` | Tailwind 클래스 병합   |

---

## 상태 관리 & 데이터 페칭

| 기술                      | 버전       | 용도                          |
| ------------------------- | ---------- | ----------------------------- |
| **Zustand**               | `^5.0.9`   | 클라이언트 상태 관리          |
| **@tanstack/react-query** | `^5.90.12` | 서버 상태 관리 및 데이터 페칭 |

---

## UI 컴포넌트

| 기술                      | 버전       | 용도      |
| ------------------------- | ---------- | --------- |
| **@tanstack/react-table** | `^8.21.3`  | 테이블 UI |
| **lucide-react**          | `^0.562.0` | 아이콘    |

---

## 폼 처리 규칙

### 기본 폼: React 19 `useActionState`

단순한 폼(로그인, 단일 입력 등)은 **React 19의 `useActionState`** 훅을
사용합니다.

```tsx
import { useActionState } from 'react';

function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState
  );

  return <form action={formAction}>{/* form fields */}</form>;
}
```

### 복잡한 폼: react-hook-form

다음과 같은 복잡한 폼은 **react-hook-form**을 사용합니다:

- Step navigation이 있는 멀티스텝 폼
- 복잡한 유효성 검사가 필요한 폼
- 동적 필드 배열이 있는 폼
- Watch/dependency가 많은 폼

```tsx
import { useForm } from 'react-hook-form';

function MultiStepForm() {
  const { register, handleSubmit, watch } = useForm();
  // ...
}
```

> **Note:** react-hook-form은 필요 시 설치합니다.

---

## 코드 품질

| 기술                            | 버전      | 용도                 |
| ------------------------------- | --------- | -------------------- |
| **ESLint**                      | `^9.39.1` | 린팅                 |
| **Prettier**                    | `^3.7.4`  | 포맷팅               |
| **prettier-plugin-tailwindcss** | `^0.7.2`  | Tailwind 클래스 정렬 |

### ESLint 플러그인

- `eslint-plugin-react-hooks` - React Hooks 규칙
- `eslint-plugin-jsx-a11y` - 접근성 규칙
- `eslint-plugin-react-refresh` - Fast Refresh 호환성
- `eslint-plugin-simple-import-sort` - import 정렬
- `@tanstack/eslint-plugin-query` - React Query 규칙

---

## 스크립트

```bash
npm run dev      # 개발 서버 실행
npm run build    # TypeScript 빌드 + Vite 빌드
npm run lint     # ESLint 실행
npm run preview  # 빌드된 앱 미리보기
```

---

## 주의사항

1. **React 19 API 사용**: `useActionState`, `use()`, Server Components 등 React
   19 신규 API 활용
2. **Tailwind CSS v4**: CSS-first 설정 방식 (`tailwind.config.js` 대신 CSS에서
   설정)
3. **forwardRef 제거**: React 19에서는 `forwardRef` 없이 직접 `ref` prop 사용
   가능
4. **ESM 전용**: `"type": "module"` 설정으로 ES Modules 사용
