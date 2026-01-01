# Refactoring Conventions

이 문서는 프로젝트의 리팩토링 가이드라인을 정의합니다. 코드 변경 시 **Kent Beck
스타일의 리팩토링 원칙**을 함께 적용합니다.

---

## Kent Beck 리팩토링 원칙

### 핵심 철학

> "Make the change easy, then make the easy change."
>
> — Kent Beck

리팩토링은 **작은 단계**로 점진적으로 진행하며, 각 단계에서 테스트가 통과해야
합니다.

---

## 주요 원칙

### 1. Small Steps (작은 단계)

- 한 번에 하나의 변경만 수행
- 각 단계에서 빌드 및 테스트 통과 확인
- 실패 시 즉시 롤백 가능한 크기로 유지

```bash
# 각 리팩토링 단계 후 확인
npm run build
npm run lint
```

### 2. Remove Duplication (중복 제거)

- 동일한 코드가 2곳 이상에서 반복되면 추출
- 상수, 유틸리티 함수, 컴포넌트로 통합

```tsx
// ❌ Bad: 중복 코드
const STATUS_LABELS = { ... }; // ComponentA.tsx
const STATUS_LABELS = { ... }; // ComponentB.tsx

// ✅ Good: 한 곳에서 관리
// constants/status.ts
export const STATUS_LABELS = { ... };
```

### 3. Single Responsibility (단일 책임)

- 함수/컴포넌트/훅은 하나의 책임만 가짐
- 너무 큰 파일(200줄 이상)은 분리 고려

```tsx
// ❌ Bad: 여러 책임을 가진 훅
function useQuestionManager() {
  // 질문 선택 로직
  // 피드백 요청 로직
  // 유효성 검사 로직
  // ... 262줄
}

// ✅ Good: 책임별 분리
function useQuestionSelection() { ... }
function useQuestionFeedback() { ... }
function useQuestionManager() {
  const selection = useQuestionSelection();
  const feedback = useQuestionFeedback();
  // 조합만 담당
}
```

### 4. Extract Function/Component (추출)

- 반복되는 패턴은 재사용 가능한 단위로 추출
- 의미 있는 이름으로 의도를 명확히

```tsx
// ❌ Bad: 반복되는 버튼 패턴
<button className="..." aria-label="검색"><Search /></button>
<button className="..." aria-label="메뉴"><Menu /></button>

// ✅ Good: 컴포넌트로 추출
<HeaderActionButton icon={<Search />} label="검색" />
<HeaderActionButton icon={<Menu />} label="메뉴" />
```

### 5. Meaningful Names (의미 있는 이름)

- Magic Numbers/Strings를 상수로 추출
- 변수명으로 의도를 표현

```tsx
// ❌ Bad: Magic Number
currentStep: Math.min(state.currentStep + 1, 4);

// ✅ Good: 의미 있는 상수
const MAX_STEP_INDEX = SURVEY_FORM_STEPS.length - 1;
currentStep: Math.min(state.currentStep + 1, MAX_STEP_INDEX);
```

### 6. Simplify (단순화)

- 복잡한 조건문은 함수로 추출하거나 switch 사용
- 중첩 깊이 최소화

```tsx
// ❌ Bad: 반복되는 조건문
{
  currentStep === 0 && <StepA />;
}
{
  currentStep === 1 && <StepB />;
}
{
  currentStep === 2 && <StepC />;
}

// ✅ Good: switch 패턴
const renderStepContent = () => {
  switch (currentStep) {
    case 0:
      return <StepA />;
    case 1:
      return <StepB />;
    case 2:
      return <StepC />;
    default:
      return null;
  }
};
```

---

## 리팩토링 체크리스트

코드 변경 시 아래 항목을 검토합니다:

- [ ] 중복 코드가 있는가? → 추출
- [ ] 200줄 이상의 파일이 있는가? → 분리 고려
- [ ] Magic Number/String이 있는가? → 상수화
- [ ] 함수/컴포넌트가 여러 책임을 가지는가? → 분리
- [ ] 반복되는 패턴이 있는가? → 컴포넌트/함수 추출
- [ ] 변수/함수 이름이 의도를 명확히 표현하는가?

---

## 리팩토링 우선순위

| 우선순위 | 유형          | 설명                              |
| -------- | ------------- | --------------------------------- |
| 🔴 높음  | 중복 코드     | 버그 발생 가능성, 유지보수 어려움 |
| 🔴 높음  | 거대 파일     | 200줄 이상, 테스트 어려움         |
| 🟡 중간  | Magic Numbers | 의미 파악 어려움                  |
| 🟡 중간  | 깊은 중첩     | 가독성 저하                       |
| 🟢 낮음  | 네이밍 개선   | 코드 이해도 향상                  |

---

## 참고 자료

- [Refactoring: Improving the Design of Existing Code](https://martinfowler.com/books/refactoring.html) -
  Martin Fowler
- [Test-Driven Development By Example](https://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530) -
  Kent Beck
