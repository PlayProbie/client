# Project Structure

이 프로젝트는 Feature-Sliced Architecture(FSA)를 변형한 도메인 주도 설계를
따릅니다.

## src Directory Structure

```
src/
├── index.css             # 스타일 엔트리 (imports only)
├── styles/               # 디자인 시스템 CSS
│   ├── tokens.css        # Tailwind theme 토큰
│   ├── base.css          # 기본 스타일, 타이포그래피
│   ├── themes/           # 테마 정의
│   │   ├── light.css     # Light 모드 색상
│   │   └── dark.css      # Dark 모드 색상
│   └── components/       # 컴포넌트 스타일
│       └── icons.css     # 아이콘 스타일
├── app/                  # 앱 전역 설정 (Providers, Global Router)
│   ├── providers/        # QueryProvider, ThemeProvider, AuthProvider
│   └── router/           # react-router-dom 설정
├── pages/                # 페이지 컴포넌트 (각 경로는 feature들을 조합만 함)
│   ├── auth/             # 로그인, 리다이렉트 페이지
│   ├── workspace/        # 대시보드, 설정
│   ├── game/             # 게임 관리 상세, 대시보드
│   ├── survey/           # 설문 설계, 설문 진행(Tester), 결과 요약
│   └── reward/           # 스토어, 결제, 발송 관리
├── features/             # 도메인 중심 핵심 비즈니스 로직
│   ├── auth/             # oAuth, 토큰 관리, 세션 상태
│   ├── workspace/        # 권한 관리, 팀원 초대, 사업자 인증
│   ├── game/             # 게임 엔티티 관리, 출시 정보
│   ├── survey-design/    # AI 실시간 검사, 엔티티 충돌 해결, 질문 설계
│   ├── survey-runner/    # [핵심] LangGraph 연동, 실시간 꼬리 질문, 응답 로직
│   ├── survey-analytics/ # 설문 결과 조회, 세션 상세, 응답 통계, 클러스터링
│   └── reward-commerce/  # 상품 리스트, 장바구니, 결제(Portone), 크레딧
├── components/           # 전역 공통 UI (Design System)
│   ├── ui/               # Button, Input, Modal (Radix UI/Shadcn 스타일)
│   ├── charts/           # 공통 차트 래퍼 (Recharts/D3)
│   └── layout/           # Sidebar, Navbar, PageLayout
├── hooks/                # 전역 공통 훅 (useIntersectionObserver 등)
├── services/             # 인프라 성격의 외부 API 클라이언트
│   ├── api-client.ts     # Axios/Fetch 인스턴스 설정 (Interceptors)
│   └── langgraph-client.ts # AI 에이전트 통신 라이브러리
├── store/                # 전역 상태 (Zustand)
│   ├── useAuthStore.ts   # 사용자 세션
│   └── useSharedStore.ts # 워크스페이스 선택 정보 등 전역 상태
├── types/                # 전역 타입 정의
│   ├── api.ts            # API 에러, 응답 래퍼 타입
│   └── utils.ts          # ConfigValue 등 타입 유틸리티
├── constants/            # 프로덕션 상수
│   └── options.ts        # Select/Checkbox 옵션
├── data/                 # 개발용 목업 데이터 (프로덕션 제외)
│   └── *.mock.ts         # 목업 데이터 파일 (예: games.mock.ts)
└── utils/                # 순수 함수 (Date 포맷팅, 숫자 계산 등)
```

## Feature Module Structure

각 `features/` 하위 폴더는 다음과 같은 구조를 가집니다:

```
features/<feature-name>/
├── api/                  # API 요청 (TanStack Query)
│   ├── get-game-context.ts
│   └── post-ai-validation.ts
├── components/           # 해당 feature 전용 컴포넌트
│   ├── EntityConflictModal.tsx
│   └── QuestionInput.tsx
├── hooks/                # 해당 feature 전용 로직
│   ├── useEntityMapping.ts
│   └── useSurveyHealth.ts
├── store/                # 해당 feature 전용 상태 (Zustand)
│   └── useSurveyFormStore.ts
├── types.ts              # 타입 정의
└── index.ts              # Public API (외부 노출용)
```
