# Design System - Progressive Refinement

> **Concept**: "Progressive Refinement" - 단순함에서 시작해 복잡함을 질서 있게
> 해결하는 과정
>
> **Key Metaphor**: The Blue Print (설계도) - 명확한 선, 구조적인 레이아웃,
> 논리적인 흐름

---

## 1. Brand Identity

### Core Values

- **Pragmatism (실용주의)**: 실무에 바로 적용 가능한 솔루션
- **Scalability (확장성)**: 프로젝트 성장에 따라 함께 확장
- **Clarity (명료함)**: 복잡한 것도 쉽게 이해 가능

### Tone & Voice

| Tone           | Description                                |
| -------------- | ------------------------------------------ |
| **Insightful** | "어떻게(How)"를 넘어 "왜(Why)"를 설명      |
| **Minimalist** | 핵심(코드/구조)에 집중, 불필요한 수식 배제 |
| **Empathetic** | 개발자의 고민에 공감, 유연한 대안 제시     |
| **Structured** | 논리적 순서, 읽기 쉬운 정보 배치           |

### Design Keywords

`Blueprint` · `Module` · `Scalability` · `Logic`

---

## 2. Visual Goals

### ① High-Focus Readability (고집중 가독성)

- 긴 기술 아티클과 복잡한 코드 블록의 피로도 최소화
- 넓은 행간, 충분한 여백, 코드 가독성 최우선 폰트

### ② Structural Hierarchy (구조적 계층화)

- 정보 레벨(Heading, Body, Code, Tips) 시각적 즉시 구분
- 단계별 숫자 인덱싱, 명확한 타이포그래피 대비

### ③ Modern Tech Aesthetic (현대적 기술미)

- 다크/라이트 모드 완벽 조화
- 정교한 마이크로 인터렉션 (호버 효과 등)
- Indigo & Slate 계열의 차분한 컬러

### ④ Adaptive Componentry (적응형 컴포넌트)

- 인터렉티브한 학습 도구로서의 기능
- 확장 가능한 폴더 구조 UI, 코드 미리보기 연동

---

## 3. Color Palette

### Primary Colors

| Token       | Name        | Hex       | oklch                  | Usage               |
| ----------- | ----------- | --------- | ---------------------- | ------------------- |
| `primary`   | Indigo Blue | `#4F46E5` | `oklch(0.51 0.21 265)` | 버튼, 링크, 강조    |
| `secondary` | Slate Gray  | `#64748B` | `oklch(0.55 0.03 255)` | 보조 텍스트, 비활성 |

### Background & Surface

| Token             | Name        | Hex       | oklch                   | Usage                  |
| ----------------- | ----------- | --------- | ----------------------- | ---------------------- |
| `background`      | Ghost White | `#F8FAFC` | `oklch(0.98 0.005 250)` | 기본 배경 (Light)      |
| `surface`         | Pure White  | `#FFFFFF` | `oklch(1 0 0)`          | 카드, 모달             |
| `background-dark` | Ink Dark    | `#0F172A` | `oklch(0.15 0.02 260)`  | 기본 배경 (Dark)       |
| `surface-dark`    | Slate Dark  | `#1E293B` | `oklch(0.22 0.02 260)`  | 카드 (Dark), 코드 블록 |

### Text Colors

| Token              | Name       | Hex       | Usage          |
| ------------------ | ---------- | --------- | -------------- |
| `foreground`       | Ink Black  | `#0F172A` | 헤드라인, 본문 |
| `muted-foreground` | Slate Gray | `#64748B` | 보조 텍스트    |

### Accent & Semantic

| Token         | Name       | Hex       | oklch                  | Usage                   |
| ------------- | ---------- | --------- | ---------------------- | ----------------------- |
| `accent`      | React Cyan | `#61DAFB` | `oklch(0.82 0.14 200)` | 코드 하이라이트, 포인트 |
| `success`     | Emerald    | `#10B981` | `oklch(0.65 0.17 160)` | 성공                    |
| `destructive` | Red        | `#EF4444` | `oklch(0.58 0.22 25)`  | 에러                    |
| `warning`     | Amber      | `#F59E0B` | `oklch(0.75 0.18 75)`  | 경고                    |
| `info`        | Blue       | `#3B82F6` | `oklch(0.58 0.2 250)`  | 정보                    |

---

## 4. Typography

### Font Families

```css
--font-sans: 'Inter', 'Geist', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Type Scale (Base: 16px)

| Level   | Size            | Weight          | Line Height | Usage       |
| ------- | --------------- | --------------- | ----------- | ----------- |
| `h1`    | 2.25rem (36px)  | Bold (700)      | 1.2         | 페이지 제목 |
| `h2`    | 1.5rem (24px)   | Semi-bold (600) | 1.3         | 섹션 제목   |
| `h3`    | 1.25rem (20px)  | Semi-bold (600) | 1.4         | 서브 섹션   |
| `body`  | 1rem (16px)     | Regular (400)   | 1.6         | 본문        |
| `small` | 0.875rem (14px) | Medium (500)    | 1.5         | 캡션, 라벨  |
| `code`  | 0.9rem (14.4px) | Regular (400)   | 1.6         | 코드        |

---

## 5. Spacing (8pt Grid System)

모든 간격은 **4px 배수**를 사용합니다.

| Token      | Value | Tailwind |
| ---------- | ----- | -------- |
| `space-1`  | 4px   | `p-1`    |
| `space-2`  | 8px   | `p-2`    |
| `space-3`  | 12px  | `p-3`    |
| `space-4`  | 16px  | `p-4`    |
| `space-6`  | 24px  | `p-6`    |
| `space-8`  | 32px  | `p-8`    |
| `space-12` | 48px  | `p-12`   |
| `space-16` | 64px  | `p-16`   |

### Layout

- **Container Max Width**: 1200px
- **Content Width**: 720px ~ 800px (가독성 최적화)
- **Desktop Grid**: 12-column, Gutter 24px
- **Mobile Grid**: 4-column, Gutter 16px, Margin 16px

---

## 6. Elevation (Shadow)

| Level   | Usage          | Tailwind    | CSS                                |
| ------- | -------------- | ----------- | ---------------------------------- |
| Level 0 | 배경           | -           | flat                               |
| Level 1 | 일반 카드      | `shadow-sm` | `0 1px 3px 0 rgba(0,0,0,0.1)`      |
| Level 2 | 호버, 드롭다운 | `shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.1)`   |
| Level 3 | 모달, FAB      | `shadow-lg` | `0 20px 25px -5px rgba(0,0,0,0.1)` |

---

## 7. Border Radius

일관된 Corner Radius (8px 기준)

| Token        | Value | Tailwind     | Usage         |
| ------------ | ----- | ------------ | ------------- |
| `rounded-sm` | 4px   | `rounded-sm` | 작은 요소     |
| `rounded`    | 6px   | `rounded`    | 기본          |
| `rounded-md` | 8px   | `rounded-md` | 카드, 버튼    |
| `rounded-lg` | 12px  | `rounded-lg` | 모달, 큰 카드 |

---

## 8. Component Guidelines

### Code Block

- **Background**: `#1E293B` (Dark Theme 고정)
- **Border Radius**: 8px
- **Features**: Copy 버튼, 파일명 표시, Syntax Highlighting

### Navigation

- **Sticky Header**: 스크롤 시 메뉴 접근 가능
- **Table of Contents**: 우측 사이드바, 현재 섹션 표시

### Folder Structure UI

- **Tree View**: 폴더/파일 아이콘 구분
- **Indentation**: 20px 단위

---

## 9. Design Guidelines

### Atomic Design

`Button` → `Input` → `Form` → `Card` → `Page` 순서로 컴포넌트 설계

### Consistency

- 동일한 Corner Radius (8px) 적용
- 일관된 색상 토큰 사용

### Accessibility

- 텍스트/배경 대비비: 최소 **4.5:1**
- Focus 상태 명확히 표시
- 키보드 네비게이션 지원

---

## 10. Icon Style: "The Blueprint Line"

아이콘은 디자인 시스템의 통일성을 결정짓는 핵심 요소입니다. '설계도' 컨셉에 맞춰
**Line-based** 스타일을 사용합니다.

### Specifications

| Property          | Value              | Description                  |
| ----------------- | ------------------ | ---------------------------- |
| **Stroke Weight** | 2px                | 일관된 선 굵기로 안정감 부여 |
| **Corner Radius** | 4px                | 전문적이면서 부드러운 곡률   |
| **End Caps**      | Round              | 현대적이고 부드러운 인상     |
| **Size**          | 16px / 20px / 24px | sm / md / lg 사이즈          |
| **Color**         | `currentColor`     | 부모 요소 색상 상속          |

### Icon Library

**Primary**: [Lucide Icons](https://lucide.dev/) - Line-based, 2px stroke, MIT
License

### Usage Classes

```tsx
// Tailwind 클래스로 아이콘 스타일 적용
<Icon className="size-4 stroke-2" />   // 16px, stroke 2px
<Icon className="size-5 stroke-2" />   // 20px, stroke 2px
<Icon className="size-6 stroke-2" />   // 24px, stroke 2px
```

### Icon Categories

| Category        | Usage                   | Examples                              |
| --------------- | ----------------------- | ------------------------------------- |
| **File System** | 폴더, 파일 확장자, 에셋 | `Folder`, `FileCode`, `FileJson`      |
| **Structure**   | 단계별 흐름, 계층       | `Layers`, `GitBranch`, `Network`      |
| **Navigation**  | 서비스 이동, 액션       | `Search`, `ExternalLink`, `Menu`      |
| **Actions**     | 사용자 인터랙션         | `Plus`, `Trash`, `Edit`, `Copy`       |
| **Status**      | 상태 표시               | `Check`, `X`, `AlertTriangle`, `Info` |

### Visual Guidelines

- 내부에 불필요한 장식 배제
- 기능을 직관적으로 보여주는 기하학적 형태
- 아이콘 간 시각적 밸런스 유지
