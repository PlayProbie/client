# Naming Conventions

이 프로젝트의 네이밍 컨벤션입니다. ESLint `@typescript-eslint/naming-convention`
규칙으로 강제됩니다.

---

## 1. 폴더 및 파일 네이밍

| 대상                | 컨벤션            | 예시                                     |
| ------------------- | ----------------- | ---------------------------------------- |
| **폴더**            | `kebab-case`      | `features/survey-designer/`, `api/`      |
| **컴포넌트 파일**   | `PascalCase.tsx`  | `QuestionInput.tsx`, `SurveyPreview.tsx` |
| **Hooks 파일**      | `camelCase.ts`    | `useAuth.ts`, `useEntityMapping.ts`      |
| **일반 TS/JS 파일** | `kebab-case.ts`   | `api-client.ts`, `date-formatter.ts`     |
| **스타일 파일**     | `name.module.css` | `button.module.css`                      |
| **테스트 파일**     | `name.test.ts`    | `auth-service.test.ts`                   |

---

## 2. 변수 및 함수 네이밍

### 컴포넌트 (PascalCase)

```tsx
// [Domain][Role] 형태
function SurveyList() { ... }
function PaymentModal() { ... }
```

### 이벤트 핸들러

```tsx
// 내부 핸들러: handle 접두사
const handleSubmit = () => { ... }
const handleInputChange = () => { ... }

// Props 전달: on 접두사
<Modal onClose={handleClose} onSuccess={handleSuccess} />
```

### 변수 및 상수

| 유형           | 컨벤션                     | 예시                               |
| -------------- | -------------------------- | ---------------------------------- |
| 일반 변수/함수 | `camelCase`                | `userName`, `fetchData`            |
| 상수           | `SCREAMING_SNAKE_CASE`     | `MAX_RETRY_COUNT`, `API_URL`       |
| 불리언         | `is/has/should/can` 접두사 | `isLoading`, `hasToken`, `canEdit` |

### 타입 및 인터페이스

```tsx
// PascalCase 사용
type UserRole = 'admin' | 'user';
interface SurveyQuestion { ... }
```

---

## 3. TanStack Query 네이밍

### Queries

```tsx
// use[Entity][Action]Query
const { data } = useGameDetailQuery(gameId);
const { data } = useSurveyListQuery();
```

### Mutations

```tsx
// use[Entity][Action]Mutation
const { mutate } = useQuestionCreateMutation();
const { mutate } = usePaymentConfirmMutation();
```

### Query Keys

```tsx
// 객체 형태로 관리
export const surveyKeys = {
  all: ['surveys'] as const,
  detail: (id: string) => [...surveyKeys.all, id] as const,
};
```

---

## 4. Zustand Store 네이밍

### Store Hook

```tsx
// use[Domain]Store
const useAuthStore = create((set) => ({ ... }));
const useDesignerStore = create((set) => ({ ... }));
```

### Actions

```tsx
const useAuthStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }), // Property 기반
  logout: () => set({ user: null }), // 행위 기반
}));
```

---

## 5. 도메인별 네이밍 예시

| 도메인    | 파일/폴더        | Hook/Store          | 컴포넌트                 |
| --------- | ---------------- | ------------------- | ------------------------ |
| Workspace | `workspace-id`   | `useWorkspaceAuth`  | `WorkspaceMemberRole`    |
| Game      | `game-metadata`  | `useGameContext`    | `GameStatus`             |
| Survey    | `survey-goal`    | `useSurveyHealth`   | `QuestionSet`            |
| AI        | `ai-validation`  | `useLangGraphState` | `EntityConflictResolver` |
| Reward    | `reward-catalog` | `useCreditBalance`  | `PaymentCheckout`        |
