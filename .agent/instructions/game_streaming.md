# Game Streaming - Phase 1 클라이언트 구현 가이드

> 클라우드 스트리밍 기반 게임 플레이테스트 플랫폼 - Creator Studio + Tester
> Placeholder

---

## 📋 제품/범위 요약 (Phase 1 MVP)

### A. Creator Studio (관리자 웹, Desktop only)

| 기능               | 상태               | 설명                                                   |
| ------------------ | ------------------ | ------------------------------------------------------ |
| Build 업로드       | ✅ 핵심            | Presigned URL → S3 PUT → 완료 처리(complete)           |
| Stream Settings UI | 🔧 필수 (API 없음) | GPU / 해상도·FPS 설정 폼                               |
| Schedule UI        | 🔧 필수 (API 없음) | 활성 기간(start/end), timezone, capacity(max sessions) |

### B. Tester Experience (Phase 1)

- WebRTC/Signaling 명세가 없으므로 `/play/:gameUuid` 페이지는 **placeholder**
  수준으로만 구현

---

## 🛠 기술 스택 및 규칙

- **Core**: React + TypeScript (Vite 기반)
- **Styling**: TailwindCSS
- **Routing**: React Router
- **Data Fetching**: React Query (TanStack Query)
- **State**: 최소화 (필요시 Zustand)
- **HTTP**: fetch 또는 axios (업로드 `onUploadProgress` 필요하면 axios 권장)
- **Target**: Desktop only, 기본 화면 폭 1280px

### 공통 UI 규칙

| 상태                    | UI 컴포넌트                                        |
| ----------------------- | -------------------------------------------------- |
| Loading / Empty / Error | 모든 페이지 필수                                   |
| 성공/실패 피드백        | `Toast`                                            |
| 폼 오류                 | `FieldError` / `InlineAlert`                       |
| 업로드 중               | `SpinnerOverlay` + `StepIndicator` + `ProgressBar` |
| 저장되지 않은 변경사항  | 탭 이동 시 `ConfirmDialog`                         |

---

## 🗺 라우팅 구조

```
/studio/games                           # Screen A: 게임 목록
/studio/games/:gameUuid/overview        # Screen B: 게임 개요 + 탭 쉘
/studio/games/:gameUuid/builds          # Screen C: 빌드 목록
/studio/games/:gameUuid/stream-settings # Screen E: 스트리밍 설정
/studio/games/:gameUuid/schedule        # Screen F: 스케줄 설정
/play/:gameUuid                         # Screen G: 테스터 플레이 (placeholder)
```

---

## 📱 화면별 요구사항

### Screen A. Games 목록

- **Route**: `/studio/games`
- **목적**: gameUuid 선택 진입

#### 테이블 컬럼

| 컬럼         | 설명           |
| ------------ | -------------- |
| Game Name    | 게임 이름      |
| Game UUID    | 복사 버튼 포함 |
| Builds count | 없으면 "-"     |
| UpdatedAt    | 마지막 수정일  |

#### 동작

- Row click → `/studio/games/:uuid/overview`
- `Create Game` 버튼은 **API가 없으면 숨김**

#### 상태별 UI

| 상태    | UI                                        |
| ------- | ----------------------------------------- |
| Loading | skeleton 6 rows                           |
| Empty   | "등록된 게임이 없습니다"                  |
| Error   | "게임 목록을 불러오지 못했습니다" + Retry |

> **NOTE**: Games 목록 API가 없으면 mock 데이터로 대체 (구조는 실제처럼)

---

### Screen B. Game Shell + Tabs

- **Route**: `/studio/games/:gameUuid/*`

#### 레이아웃

- **상단**
  - Breadcrumb: `Games / {GameName}`
  - Title: `{GameName}`
  - Secondary: `UUID: {gameUuid}` + Copy 버튼
- **Tabs**: Overview | Builds | Stream Settings | Schedule

#### 탭 이동 규칙

업로드/저장 중 이동 시 `ConfirmDialog`:

| 항목        | 내용                               |
| ----------- | ---------------------------------- |
| Title       | "변경사항이 저장되지 않았습니다"   |
| Description | "이동하면 현재 입력이 사라집니다." |
| Buttons     | 취소 / 이동                        |

---

### Screen C. Builds 탭 (리스트)

- **Route**: `/studio/games/:gameUuid/builds`

#### 페이지 구성

- **PageHeader**
  - Title: "Builds"
  - Subtitle: "게임 실행 파일 패키지(.zip)를 업로드하고 상태를 확인합니다."
- **CTA**: Upload Build (모달 오픈)
- **Hint Box**: "ExecutablePath는 zip 내부 실행 파일의 상대 경로입니다. 예)
  `/Game/Binaries/Win64/MyGame.exe`"

#### 테이블 컬럼

| 컬럼        | 설명                                                        |
| ----------- | ----------------------------------------------------------- |
| Filename    | 파일명                                                      |
| StatusBadge | `PENDING` / `UPLOADED` / `REGISTERING` / `READY` / `FAILED` |
| Size        | 파일 크기                                                   |
| CreatedAt   | 생성일                                                      |
| Actions     | Copy S3Key, View details (옵션)                             |

#### 상태별 UI

| 상태  | UI                                        |
| ----- | ----------------------------------------- |
| Empty | "첫 빌드를 업로드하세요" + Upload Build   |
| Error | "빌드 목록을 불러오지 못했습니다" + Retry |

> **NOTE**: Builds 목록 API가 없으면 mock 처리 가능

---

### Screen D. Upload Build Modal (핵심)

- **Trigger**: Builds 탭의 "Upload Build"
- **Modal width**: 720px

#### 입력 Step (Idle)

| 필드           | 타입                    | 필수 | 설명                  |
| -------------- | ----------------------- | ---- | --------------------- |
| Build File     | Drag&Drop + Choose File | ✅   | `.zip` only, 최대 5GB |
| ExecutablePath | 텍스트 입력             | ✅   |                       |
| Version        | 텍스트 입력             | ❌   |                       |
| Note           | 텍스트 입력             | ❌   |                       |

**버튼**: Cancel / Start Upload

#### 업로드 상태 머신

```mermaid
stateDiagram-v2
    [*] --> idle
    idle --> requesting_presigned_url
    requesting_presigned_url --> uploading_to_s3
    uploading_to_s3 --> completing_upload
    completing_upload --> success
    requesting_presigned_url --> error
    uploading_to_s3 --> error
    completing_upload --> error
    success --> [*]
    error --> idle : retry
```

#### 에러 객체 구조

```ts
type UploadError = {
  step: 'presigned' | 'upload' | 'complete';
  code?: string;
  message: string;
  retriable: boolean;
};
```

#### API 연동 (명세 확정)

##### 1. Presigned URL 발급

```http
POST /games/{gameUuid}/builds/presigned-url

Request Body:
{ filename, fileSize }

Response:
{ buildId, uploadUrl, s3Key, expiresInSeconds }
```

##### 2. S3 업로드

```http
PUT {uploadUrl}

진행률 표시 필수:
- percent
- uploaded / total
- speed (대략)
- eta (대략)
```

##### 3. 완료 처리

```http
POST /games/{gameUuid}/builds/{buildId}/complete

Request Body:
{ s3Key }

Response:
{ status: "UPLOADED" }
```

#### 실패 UX

| 실패 단계 | 조건      | 메시지                                      | 액션                     |
| --------- | --------- | ------------------------------------------- | ------------------------ |
| Presigned | 발급 실패 | "업로드 URL 발급 실패"                      | Retry / Cancel           |
| Upload    | 네트워크  | "네트워크 문제로 업로드가 중단되었습니다."  | Retry / Restart / Cancel |
| Upload    | URL 만료  | "업로드 URL이 만료되었을 수 있습니다…"      | Restart (new URL)        |
| Upload    | CORS      | "CORS 설정 문제로 업로드가 차단되었습니다." | Restart / Cancel         |
| Complete  | G003      | "업로드된 파일을 찾을 수 없습니다"          | Restart                  |
| Complete  | G002      | "빌드 세션을 찾을 수 없습니다"              | Restart                  |
| Complete  | G004      | "S3 확인 중 오류가 발생했습니다"            | Retry / Cancel           |

#### 업로드 성공 후

- **Toast**: "업로드가 완료되었습니다."
- **Footer**:
  - Primary: "Go to Stream Settings"
  - Secondary: "Close"

#### 업로드 중 모달 닫기 정책

- X 버튼: disabled + tooltip
- Cancel 제공 + ConfirmDialog:
  - 메시지: "업로드를 취소할까요? 지금까지 전송된 데이터는 저장되지 않을 수
    있습니다."
  - Buttons: 계속 업로드 / 취소하고 닫기

---

### Screen E. Stream Settings 탭 (UI 중심, API 없음)

- **Route**: `/studio/games/:gameUuid/stream-settings`

#### Form 필드

| 필드           | 타입     | 옵션                       |
| -------------- | -------- | -------------------------- |
| GPU Profile    | Select   | Entry / Performance / High |
| Resolution/FPS | Radio    | 720p30 / 1080p60 (권장)    |
| OS             | Readonly | Windows Server 2022        |
| Region         | Readonly | ap-northeast-2             |

#### 동작

- **성공 Toast**: "스트리밍 설정이 저장되었습니다."
- **실패 InlineAlert**: "저장에 실패했습니다. 다시 시도해주세요."

> **NOTE**: 저장/조회 API가 없으므로 임시로 local mock store
> (Zustand/localStorage)로 동작

---

### Screen F. Schedule 탭 (UI 중심, API 없음)

- **Route**: `/studio/games/:gameUuid/schedule`

#### Form 필드

| 필드            | 타입                  | 설명                    |
| --------------- | --------------------- | ----------------------- |
| Active Window   | DateTime Range Picker | start < end validation  |
| Timezone        | Select                | 기본 Asia/Seoul (UTC+9) |
| Capacity Target | Number Input          | maxSessions (0이면 OFF) |

#### Status Preview

- 현재 상태: `ACTIVE` / `INACTIVE`
- 다음 활성화/비활성화 시간 프리뷰

#### 동작

- **성공 Toast**: "스케줄이 저장되었습니다."
- **실패 InlineAlert**: "스케줄 저장에 실패했습니다."

> **NOTE**: API 없으므로 mock store로 동작

---

### Screen G. Tester Placeholder

- **Route**: `/play/:gameUuid`

#### Requirements Check

- WebRTC 지원 여부
- Desktop 환경 여부 (모바일이면 차단)

#### 동작

- `Start Streaming` 버튼은 placeholder (동작 X)
- **Unsupported 문구**: "지원하지 않는 환경입니다. Chrome 최신버전/PC로
  접속하세요."

---

## 📡 추가 필요 API (명세 없음)

클라이언트 완전 동작을 위해 필요한 API 목록 (없으면 mock 대체):

| API                  | Method | Endpoint                             |
| -------------------- | ------ | ------------------------------------ |
| Builds 목록          | GET    | `/games/{gameUuid}/builds`           |
| Stream Settings 조회 | GET    | `/games/{gameUuid}/stream-settings`  |
| Stream Settings 저장 | PUT    | `/games/{gameUuid}/stream-settings`  |
| Schedule 조회        | GET    | `/games/{gameUuid}/schedule`         |
| Schedule 저장        | PUT    | `/games/{gameUuid}/schedule`         |
| Build 상세 (선택)    | GET    | `/games/{gameUuid}/builds/{buildId}` |

---

## 🧩 컴포넌트 명세 (Phase 1 필수)

### Layout

- `AppShell` - TopBar, SidebarNav
- `GameShell` - Breadcrumb, Title, UUID Copy, Tabs, Outlet

### UI

- `DataTable` + `StatusBadge`
- `EmptyState`, `InlineAlert`, `Toast`
- `ConfirmDialog`

### Build Upload

- `BuildUploadModal` - props: `gameUuid`, `onSuccess(build)`
- `DragDropFileInput` - `.zip` only
- `UploadProgressBar` - percent/speed/eta/transferred

### Forms

- `GPUProfileSelect`
- `ResolutionFpsRadioGroup`
- `DateTimeRangePicker`
- `TimezoneSelect`
- `NumberInput`

---

## 📝 문구(카피) 고정

### Toast 성공

- "업로드가 완료되었습니다."
- "스트리밍 설정이 저장되었습니다."
- "스케줄이 저장되었습니다."

### 공통 실패

- "요청에 실패했습니다. 다시 시도해주세요."

---

## ✅ Acceptance Criteria

- [ ] 업로드 성공/실패 케이스별 UI 동작
- [ ] 페이지 Loading/Empty/Error 처리
- [ ] 탭 이동 ConfirmDialog 동작
- [ ] `.zip` / 용량 / ExecutablePath 검증 동작

---

## 🎮 Tester Experience 작업 태스크 (Phase 2)

> Amazon GameLift Streams Web SDK를 활용하여 Tester Experience 프론트엔드 구현

### Feature 1: GameLift Streams SDK 통합

#### SDK 초기화

- [ ] GameLift Streams Web SDK 설치 및 임포트
- [ ] `GameLiftStreams` 인스턴스 생성:
  - `videoElement`: HTML5 `<video>` 요소 바인딩
  - `inputConfiguration`:
    - `autoKeyboard: true`
    - `autoMouse: true`
    - `autoGamepad: true`
    - `autoCapture: true` (Pointer Lock for FPS)
    - `detachOnWindowBlur: true`
    - `resetOnDetach: true`

#### Signaling 플로우

- [ ] `generateSignalRequest()` 호출하여 WebRTC Offer 생성
- [ ] Backend API로 SignalRequest 전송
- [ ] Backend에서 받은 SignalResponse로 `completeConnection()` 호출
- [ ] 연결 성공/실패 이벤트 리스너 등록

---

### Feature 2: Connection State UI

#### 상태별 화면

| 상태      | UI                                |
| --------- | --------------------------------- |
| 초기화 중 | SDK 로딩 스피너                   |
| 연결 중   | "스트림 연결 중..." + 프로그레스  |
| 연결 성공 | 비디오 플레이어 + 컨트롤 오버레이 |
| 연결 끊김 | 에러 메시지 + Reconnect 버튼      |
| 연결 실패 | 상세 에러 안내                    |

#### 컨트롤 오버레이

- [ ] Fullscreen 토글 버튼
- [ ] 음소거/해제 버튼 (Autoplay 정책 대응)
- [ ] 연결 품질 지표 표시 (선택)
- [ ] 종료/나가기 버튼

---

### Feature 3: UX 세부 처리

#### Autoplay 정책 대응

- [ ] 비디오 muted 상태로 자동 재생 시작
- [ ] "클릭하여 소리 켜기" 오버레이 표시
- [ ] 사용자 클릭 시 `video.muted = false`

#### Pointer Lock 해제 UX

- [ ] ESC 키로 Pointer Lock 해제 시 오버레이 표시
- [ ] "클릭하여 게임으로 돌아가기" 안내
- [ ] 클릭 시 Pointer Lock 재진입

#### Reconnect 로직

- [ ] 연결 끊김 감지 시 자동 재연결 시도 (최대 3회)
- [ ] 수동 Reconnect 버튼 제공

---

### Feature 4: 환경 대응

#### 브라우저 감지 및 차단

- [ ] WebRTC 지원 여부 체크
- [ ] 데스크톱/모바일 환경 감지
- [ ] 미지원 브라우저 Fallback 페이지:
  - Chrome/Edge 최신 버전 권장
  - PC 접속 권장 안내

---

### 컴포넌트

- [ ] `StreamPlayer` - SDK + Video + 오버레이 통합
- [ ] `ConnectionStatusOverlay` - 연결 상태별 UI
- [ ] `ControlOverlay` - Fullscreen, Mute 버튼
- [ ] `PointerLockPrompt` - ESC 해제 시 안내
- [ ] `UnsupportedBrowserPage` - Fallback 페이지

### Hooks

- [ ] `useGameLiftStream` - SDK 초기화 및 연결 관리
- [ ] `useConnectionState` - 연결 상태 관리
- [ ] `useBrowserSupport` - 환경 지원 여부 체크

---

## 💡 Tech Notes

1. **SDK 활용**: 입력 캡처, Data Channel, Pointer Lock 등은 SDK가 처리하므로
   직접 구현 불필요
2. **Backend 필수**: SignalRequest/Response 교환은 Backend를 경유해야 함 (보안상
   직접 호출 불가)
3. **Autoplay**: Chrome 정책상 muted 상태로 시작 필수
4. **Pointer Lock**: SDK의 `autoCapture` 옵션 사용, ESC 해제 시 UX만 처리
