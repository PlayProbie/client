# 서비스 흐름도 UI 구현 - 커밋 계획

> **관심사 분리 원칙**에 따라 독립적으로 커밋 가능한 단위로 작업을 분리합니다.

---

## 📋 커밋 순서 개요

```
Commit 1: Desktop Only 가드 추가
    ↓
Commit 2: Navigation 구조 정리 (설정 메뉴 제거)
    ↓
Commit 3: 사이드바 설정 모달 구현 (2탭)
    ↓
Commit 4: GameSelector 구현 및 Topbar 변경
    ↓
Commit 5: 라우팅 구조 업데이트 (게임 종속 설문)
    ↓
Commit 6: Survey Control Tower 기본 구조
    ↓
Commit 7: Survey Distribute 페이지 (Phase 2 & 3 API 연동)
```

---

## 🔖 Commit 1: Desktop Only 가드 추가

**관심사**: 디바이스 접근 제어

### 변경 파일

| 파일                                    | 작업                   |
| --------------------------------------- | ---------------------- |
| `src/hooks/useDeviceCheck.ts`           | [NEW] 디바이스 감지 훅 |
| `src/pages/DesktopOnlyPage.tsx`         | [NEW] 안내 페이지      |
| `src/app/router/layouts/RootLayout.tsx` | [MODIFY] 가드 추가     |

### 커밋 메시지

```
feat(layout): add desktop-only guard for mobile/tablet devices

- Add useDeviceCheck hook to detect mobile/tablet devices
- Create DesktopOnlyPage with desktop access guidance
- Add device guard in RootLayout
```

### 테스트 방법

- Chrome DevTools에서 모바일 디바이스로 시뮬레이션
- 모바일 접속 시 안내 페이지 표시 확인

---

## 🔖 Commit 2: Navigation 구조 정리

**관심사**: 네비게이션 메뉴 리팩토링

### 변경 파일

| 파일                                                      | 작업                                              |
| --------------------------------------------------------- | ------------------------------------------------- |
| `src/config/navigation.ts`                                | [MODIFY] SECONDARY_NAV_ITEMS 제거, NAV_ITEMS 정리 |
| `src/components/layout/sidebar-components/SidebarNav.tsx` | [MODIFY] secondary nav 렌더링 제거                |

### 커밋 메시지

```
refactor(navigation): remove settings from sidebar nav

- Remove SECONDARY_NAV_ITEMS (settings menu)
- Settings will be accessed via user profile card modal
- Update SidebarNav to remove secondary nav rendering
```

### 테스트 방법

- 사이드바에서 하단 설정 메뉴가 사라졌는지 확인
- 다른 네비게이션 동작에 영향 없는지 확인

---

## 🔖 Commit 3: 사이드바 설정 모달 구현

**관심사**: 유저 프로필 카드 UX 개선

### 변경 파일

| 파일                                                            | 작업                                 |
| --------------------------------------------------------------- | ------------------------------------ |
| `src/components/layout/SettingsModal.tsx`                       | [NEW] 2탭 설정 모달                  |
| `src/components/layout/settings-modal/AccountSettingsTab.tsx`   | [NEW] 계정 설정 탭                   |
| `src/components/layout/settings-modal/WorkspaceSettingsTab.tsx` | [NEW] 워크스페이스 관리 탭           |
| `src/components/layout/settings-modal/index.ts`                 | [NEW] 배럴 파일                      |
| `src/components/layout/sidebar-components/UserProfile.tsx`      | [MODIFY] 설정 아이콘 추가, 모달 연동 |
| `src/components/layout/sidebar-components/SidebarFooter.tsx`    | [MODIFY] 모달 상태 관리              |
| `src/components/layout/index.ts`                                | [MODIFY] SettingsModal export 추가   |

### 커밋 메시지

```
feat(sidebar): add settings modal with account/workspace tabs

- Add settings icon to user profile card (top-right)
- Create SettingsModal with 2 tabs (Account, Workspace)
- Implement AccountSettingsTab with profile info and logout
- Implement WorkspaceSettingsTab with team and workspace management
```

### 테스트 방법

- 유저 카드 클릭 또는 설정 아이콘 클릭 시 모달 오픈 확인
- 탭 전환 동작 확인
- 각 탭 내 링크 동작 확인
- 로그아웃 버튼 동작 확인

---

## 🔖 Commit 4: GameSelector 구현

**관심사**: Topbar 게임 선택 기능

### 변경 파일

| 파일                                                            | 작업                                      |
| --------------------------------------------------------------- | ----------------------------------------- |
| `src/components/layout/topbar-components/GameSelector.tsx`      | [NEW] 게임 선택 드롭다운                  |
| `src/components/layout/topbar-components/index.ts`              | [MODIFY] export 변경                      |
| `src/components/layout/Topbar.tsx`                              | [MODIFY] WorkspaceSelector → GameSelector |
| `src/components/layout/topbar-components/WorkspaceSelector.tsx` | [DELETE] 삭제                             |

### 의존성

- `GET /games` API (또는 MSW mock)

### 커밋 메시지

```
feat(topbar): replace WorkspaceSelector with GameSelector

- Add GameSelector component with game list dropdown
- Show "게임 선택" when no game selected
- Show game name when game is selected (from URL params)
- Navigate to /games/:gameUuid/overview on selection
- Remove deprecated WorkspaceSelector
```

### 테스트 방법

- Topbar에 GameSelector 표시 확인
- 드롭다운에서 게임 목록 표시 확인
- 게임 선택 시 URL 변경 확인
- `/games/:gameUuid/*` 페이지에서 현재 게임명 표시 확인

---

## 🔖 Commit 5: 라우팅 구조 업데이트

**관심사**: 게임 종속 설문 라우팅

### 변경 파일

| 파일                                  | 작업                                  |
| ------------------------------------- | ------------------------------------- |
| `src/app/router/routes.tsx`           | [MODIFY] 게임 하위 설문 라우트 활성화 |
| `src/pages/studio/SurveyListPage.tsx` | [NEW] 게임 내 설문 목록 페이지        |

### API 연동

- `GET /surveys?game_uuid={gameUuid}`

### 커밋 메시지

```
feat(routing): add game-scoped survey routes

- Enable /games/:gameUuid/surveys route
- Create SurveyListPage for game-scoped survey list
- Filter surveys by gameUuid using query parameter
```

### 테스트 방법

- `/games/:gameUuid/surveys` 접근 시 해당 게임의 설문 목록 표시 확인
- GameShell 탭에 설문 목록 탭 추가 확인

---

## 🔖 Commit 6: Survey Control Tower 기본 구조

**관심사**: 설문 상세 레이아웃

### 변경 파일

| 파일                                                   | 작업                                        |
| ------------------------------------------------------ | ------------------------------------------- |
| `src/features/survey/components/SurveyShell.tsx`       | [NEW] Survey Control Tower 레이아웃         |
| `src/pages/survey/SurveyOverviewPage.tsx`              | [NEW] 개요 탭 (상태 표시/변경)              |
| `src/features/survey/components/StatusChangeModal.tsx` | [NEW] 상태 변경 확인 모달                   |
| `src/app/router/routes.tsx`                            | [MODIFY] Survey Control Tower 라우트 활성화 |

### API 연동

- `PATCH /surveys/{surveyId}/status`

### 커밋 메시지

```
feat(survey): add Survey Control Tower with tabs

- Create SurveyShell layout with 4 tabs (overview, design, distribute, analyze)
- Implement SurveyOverviewPage with status display and change actions
- Add StatusChangeModal with warning and confirmation checkbox
- Update routes to enable Survey Control Tower
```

### 테스트 방법

- `/games/:gameUuid/surveys/:surveyId` 접근 시 탭 레이아웃 표시 확인
- 탭 간 전환 동작 확인
- 설문 상태에 따른 탭 잠금 동작 확인
- 상태 변경 시 확인 모달 표시 확인

---

## 🔖 Commit 7: Survey Distribute 페이지

**관심사**: 빌드 연결 및 테스트 기능

### 변경 파일

| 파일                                                     | 작업                    |
| -------------------------------------------------------- | ----------------------- |
| `src/pages/survey/SurveyDistributePage.tsx`              | [NEW] 배포/연동 탭      |
| `src/features/survey/components/BuildConnectionCard.tsx` | [NEW] 빌드 연결 UI      |
| `src/features/survey/api/streaming-resource.ts`          | [NEW] Phase 2 API       |
| `src/features/survey/hooks/useStreamingResource.ts`      | [NEW] React Query hooks |

### API 연동

- `POST /surveys/{surveyId}/streaming-resource`
- `GET /surveys/{surveyUuid}/streaming-resource`
- `DELETE /surveys/{surveyId}/streaming-resource`
- `POST .../start-test`
- `GET .../status` (Polling)
- `POST .../stop-test`

### 커밋 메시지

```
feat(survey): implement distribute page with build connection

- Create SurveyDistributePage for build connection and testing
- Add BuildConnectionCard for selecting and connecting builds
- Implement streaming resource APIs and hooks (Phase 2)
```

### 테스트 방법

- 배포 탭에서 빌드 연결 UI 표시 확인
- 빌드 연결 동작 확인
- 테스트 시작/종료 동작 확인
- Status polling 동작 확인

---

## 📊 진행 상황 추적

| Commit                  | 상태    | PR  |
| ----------------------- | ------- | --- |
| 1. Desktop Only 가드    | ⬜ TODO | -   |
| 2. Navigation 정리      | ⬜ TODO | -   |
| 3. 설정 모달            | ⬜ TODO | -   |
| 4. GameSelector         | ⬜ TODO | -   |
| 5. 라우팅 업데이트      | ⬜ TODO | -   |
| 6. Survey Control Tower | ⬜ TODO | -   |
| 7. Survey Distribute    | ⬜ TODO | -   |

---

## 💡 Tips

### 커밋 순서 변경 가능 여부

| 커밋                    | 독립 실행 가능? | 의존성                  |
| ----------------------- | --------------- | ----------------------- |
| 1. Desktop Only         | ✅ 가능         | 없음                    |
| 2. Navigation 정리      | ✅ 가능         | 없음                    |
| 3. 설정 모달            | ⚠️ 2번 후 권장  | 2번 (설정 메뉴 제거 후) |
| 4. GameSelector         | ✅ 가능         | 없음                    |
| 5. 라우팅 업데이트      | ✅ 가능         | 없음                    |
| 6. Survey Control Tower | ⚠️ 5번 후 권장  | 5번 (라우트 필요)       |
| 7. Survey Distribute    | ⚠️ 6번 후 권장  | 6번 (SurveyShell 필요)  |

### 병렬 작업 가능 조합

- **조합 A**: 1번 + 2번 + 4번 (서로 독립적)
- **조합 B**: 3번 (2번 완료 후)
- **조합 C**: 5번 → 6번 → 7번 (순차적)

### API 의존성

| 커밋                    | 필요한 API                   | MSW Mock 필요 |
| ----------------------- | ---------------------------- | ------------- |
| 4. GameSelector         | `GET /games`                 | ✅            |
| 5. 라우팅 업데이트      | `GET /surveys`               | ✅            |
| 6. Survey Control Tower | `PATCH /surveys/{id}/status` | ✅            |
| 7. Survey Distribute    | Phase 2 & 3 APIs             | ✅            |
