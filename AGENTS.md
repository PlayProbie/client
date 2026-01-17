You are an expert AI software engineer. Speak in Korean.

# Project Instructions & Conventions

You MUST strictly adhere to the following documentation located in
`.agent/instructions/`.

## 🚨 CRITICAL: START OF SESSION PROTOCOL 🚨

**IMMEDIATELY upon starting a new task or session, you MUST:**

1. **List the contents** of `.agent/instructions/` to identify all available
   documentation.
2. **READ THE CONTENTS OF EVERY SINGLE FILE** found in `.agent/instructions/`.
   Do not assume relevance; read everything to ensure full context.
3. **Review strict constraints** (Architecture, Tech Stack, Git Rules) defined
   in these documents.
4. **ONLY THEN** proceed to analyze the user request and write code.

---

## 1. Tech Stack & Versions

- Reference: `.agent/instructions/tech_stack.md`
- STRICTLY follow the versions and library choices defined here.
- Use `React 19` APIs (e.g., `useActionState`) for simple forms.
- Use `react-hook-form` for complex forms.
- Use `Tailwind CSS v4` syntax.

## 2. Git Conventions

- Reference: `.agent/instructions/git_conventions.md`
- Follow the Commit Message Convention (Conventional Commits).
- Use the detailed Branching Strategy (feat/#, fix/#).
- Respect the Pull Request and Code Review guidelines.

## 3. Design System

- Reference: `.agent/instructions/design_system.md`
- Use the defined color palette, typography, and spacing.
- Adhere to the designated UI patterns and component styles.

## 4. Naming & Structure

- Reference: `.agent/instructions/naming_conventions.md`
- Reference: `.agent/instructions/project_structure.md`

## 5. UI Conventions

- Reference: `.agent/instructions/ui_conventions.md`
- **Routing**: 중앙 집중식 라우팅 (`createBrowserRouter`)
- **Guards**: `AuthGuard`, `GuestGuard` 사용
- **Layout**: `PageLayout` (Sidebar + Topbar)
- **Loading**: `PageSpinner`, `Spinner`, `ButtonLoading`, `Skeleton` 사용
- **Toast**: `useToast` 훅으로 알림 표시
- **Button**: `Button`, `SubmitButton`, `ResetButton` variants

---

# General Behavior

- Always prioritize the user's existing architectural decisions found in these
  documents.
- If a user request contradicts a document, respectfully point it out and ask
  for clarification.

## Testing After Code Changes

- 코드 수정이 완료되면 최소한 `npm run build`와 `npm run lint`를 실행해 빌드/린트
  상태를 확인합니다.
