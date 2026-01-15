# GameLift Streams 고도화 계획

## 목적

- 현재 스트리밍 구현(`gamelift_streaming_implementation.md`)에
  `streaming_analysis.md`의 Virtual Highlight 설계를 반영한다.
- 입력 로그/영상 세그먼트/InsightTag를 동기화하여 재생 가능한 하이라이트를
  제공한다.

---

## 특이사항 및 리스크 점검

### 브라우저/플랫폼 호환성

- `MediaRecorder`, `requestVideoFrameCallback`, OPFS는 브라우저별 지원이 다르다.
  Safari는 `MediaRecorder`/코덱 지원이 제한적이므로 `isTypeSupported` 검증 및
  폴백(IndexedDB, 캡처 비활성)을 준비한다.
- `OffscreenCanvas`/Worker 전송 제약으로 캡처는 메인 스레드 중심으로 설계한다.

### 동기화 정확도

- 입력 로그는 `media_time` 기준으로 정렬되어야 한다. `requestVideoFrameCallback`
  미지원 환경에서는 `video.currentTime` 기반으로 동기화 오차가 발생할 수 있다.
- 세그먼트 경계(20~30초)에서 로그와 영상이 어긋나지 않도록 `segment_id` 전환
  시점 기준을 명확히 정의한다.

#### media_time 획득 전략

| 환경                    | 방식                        | 예상 오차           |
| ----------------------- | --------------------------- | ------------------- |
| Chrome/Edge (rVFC 지원) | `requestVideoFrameCallback` | ≤ 1프레임 (16.67ms) |
| Safari/Firefox          | `video.currentTime` 폴링    | ≤ 2~3프레임 (50ms)  |

- **허용 오차**: 분석 목적상 **50ms 이내**면 PANIC/IDLE/CHURN 감지에 영향 없음.
- rVFC 미지원 시 `setInterval(16)`로 `currentTime`을 폴링하여 근사치 획득.

### 성능/용량

- 마우스 이동 이벤트는 빈도가 매우 높다. 샘플링/스로틀 없이 저장 시 메모리와
  업로드 비용이 급증한다.
- 세그먼트 저장소(OPFS/IndexedDB) 사용 시 브라우저 저장 용량/eviction 위험이
  있다. `navigator.storage.persist()` 요청 및 정리 정책이 필요하다.

#### 마우스 이벤트 샘플링 정책

| 이벤트 유형    | 샘플링 정책                                     |
| -------------- | ----------------------------------------------- |
| `mousemove`    | **15Hz 다운샘플링** (66ms 간격) + 변화량 필터링 |
| `mousedown/up` | 전수 기록 (샘플링 없음)                         |
| `wheel`        | **30Hz 다운샘플링** (33ms 간격)                 |

- 변화량 필터링: 이전 좌표 대비 **5px 이상** 이동 시에만 기록.
- 샘플링된 이벤트에는 `sampled: true` 플래그 추가.

### 네트워크/업로드

- `getVideoRTCStats()` 기반의 네트워크 상태 판정 로직이 필요하다.
  `RTCStatsReport` 파싱 실패 시 업로드를 보수적으로 중단하는 전략이 필요하다.
- 업로드는 스트리밍 품질 저하를 유발할 수 있으므로 백오프/재시도/일시중지 규칙을
  명시한다.

### 데이터/보안

- 키보드 입력 로그는 민감 데이터가 될 수 있다. 텍스트 입력/챗 입력 구간은 로그
  제외 또는 코드/키만 기록하는 정책이 필요하다.
- `applicationMessage` 채널은 크기 제한/스키마 검증/예외 처리 필요.

---

## 구현 전제/결정 필요 사항

> [!IMPORTANT] 아래 항목은 구현 착수 전 백엔드와 협의하여 확정해야 합니다. 확정
> 전까지는 Mock API 스펙을 기준으로 개발을 진행합니다.

- 업로드 API 계약: presigned URL 발급, 세그먼트/로그 업로드, 업로드 완료 콜백.
- InsightTag 조회/재생 API 계약: 세그먼트 매핑, 재생 상태 응답 형태.
- 저장 포맷: `video/webm;codecs=vp8|vp9` vs `video/mp4;codecs=avc1`.
- 지원 브라우저 범위와 기능 제공 범위(하이라이트 비활성화 기준).

---

## 코드 수정 범위

### 기존 파일 수정

| 파일                                                         | 수정 내용                                          |
| ------------------------------------------------------------ | -------------------------------------------------- |
| `src/features/game-streaming-session/lib/stream-client.ts`   | `inputConfiguration` 필터 연결, RTC 통계 래퍼 추가 |
| `src/features/game-streaming-session/hooks/useGameStream.ts` | 입력 로거/상태 모니터 훅 통합                      |

### 신규 파일 생성

| 파일                                                                | 역할                                 |
| ------------------------------------------------------------------- | ------------------------------------ |
| `src/features/game-streaming-session/hooks/useInputLogger.ts`       | 입력 이벤트 수집 및 샘플링           |
| `src/features/game-streaming-session/hooks/useStreamHealth.ts`      | RTC 통계 기반 네트워크 상태 모니터링 |
| `src/features/game-streaming-session/lib/segment-recorder.ts`       | Canvas 기반 360p 세그먼트 녹화       |
| `src/features/game-streaming-session/lib/segment-store.ts`          | OPFS/IndexedDB 세그먼트 저장소       |
| `src/features/game-streaming-session/workers/upload.worker.ts`      | 백그라운드 업로드 워커               |
| `src/features/game-streaming-session/components/HighlightPanel.tsx` | InsightTag 목록 및 클립 재생 UI      |

---

## 구현 단계 (Phase)

### Phase 0. 계약/스키마 정리 (백엔드 협의 선행)

- 입력 로그 스키마 확정: 최소 필드(`type`, `media_time`, `client_ts`,
  `segment_id`).
- 세그먼트 메타 스키마 확정: `start_media_time`, `end_media_time`,
  `upload_status`.
- 업로드/InsightTag API 계약 확정 및 Mock 핸들러 추가.

**산출물**:

- `src/lib/msw/handlers/highlight.ts` (Mock API)
- `src/features/game-streaming-session/types/highlight.ts` (스키마 타입)

---

### Phase 1. StreamClient 확장 + 입력 로그 수집 ⭐ MVP

- `StreamClient` 인터페이스 확장: `getVideoRTCStats`, `getInputRTCStats`,
  `sendApplicationMessage`, `onApplicationMessage` 콜백 지원.
- `createStreamClient`에 `inputConfiguration` 필터 연결.
- 입력 로그 수집 훅 추가(`useInputLogger`):
  - 키보드/마우스/게임패드 이벤트 샘플링 및 정규화.
  - `pagehide`, `visibilitychange`, `blur` 이벤트 수집.
  - `media_time` 산출: `requestVideoFrameCallback` 우선, 없으면 `currentTime`.
  - **마우스 샘플링**: 15Hz + 5px 변화량 필터링 적용.

**검증**:

- 유닛 테스트: 샘플링 정책 검증, 이벤트 정규화 검증.
- E2E: 30초 스트리밍 후 로그 수집량/형식 확인.

---

### Phase 2. 스트림 상태 모니터링 ⭐ MVP

- `useStreamHealth`(또는 유사 훅) 추가:
  - `getVideoRTCStats`/`getInputRTCStats` 주기 수집 (1초 간격).
  - RTT/packetLoss 기준으로 업로드 허용 여부 계산.
  - 네트워크 불안정 시 업로드 일시중지 신호 제공.

**네트워크 상태 판정 기준**:

| 상태       | 조건                            | 업로드 허용 |
| ---------- | ------------------------------- | ----------- |
| `HEALTHY`  | packetLoss < 2% AND RTT < 100ms | ✅ 허용     |
| `DEGRADED` | packetLoss < 5% AND RTT < 200ms | ⚠️ 제한적   |
| `UNSTABLE` | packetLoss ≥ 5% OR RTT ≥ 200ms  | ❌ 중단     |

**검증**:

- 유닛 테스트: 상태 판정 로직 검증.
- 수동 테스트: 네트워크 스로틀링 시 상태 전환 확인.

---

### Phase 3. 세그먼트 녹화/저장 (Post-MVP)

- `SegmentRecorder` 구현:
  - `video` → `canvas(360p)` → `MediaRecorder`.
  - **30초 고정 청크**, **양쪽 3초 오버랩** (총 36초 녹화).
  - 코덱 지원 확인 및 실패 시 기능 비활성.
- `SegmentStore` 구현:
  - OPFS 우선, 미지원 시 IndexedDB 폴백.
  - 저장 용량 체크 및 LRU 기반 삭제 정책.

#### 세그먼트 경계 전환 로직 (양쪽 오버랩)

```
Timeline:     0s ────────────── 30s ────────────── 60s ────────────── 90s
              │                  │                  │
Segment A:  [-3s ═══════════════ 33s]              │
              │    (Core: 0~30s)  │                  │
              │                  │                  │
Segment B:  │                [27s ═══════════════ 63s]
              │                  │    (Core: 30~60s) │
              │                  │                  │
Segment C:                       │                [57s ═══════════════ 93s]
                                                      (Core: 60~90s)

세그먼트 구조:
- 코어 구간: 30초 (예: 0~30s, 30~60s)
- 앞쪽 오버랩: -3초 (이전 세그먼트와 중복)
- 뒤쪽 오버랩: +3초 (다음 세그먼트와 중복)
- 총 녹화 시간: 36초

segment_id 전환 시점:
- 새 세그먼트 녹화 시작 시 UUID 생성 (코어 구간 시작 -3초 전).
- 오버랩 구간(27s~33s)의 로그는 **양쪽 세그먼트 모두에 귀속**.
  → 로그에 `segment_ids: ["A", "B"]` 배열로 기록.
```

**검증**:

- 유닛 테스트: 세그먼트 생성/저장/삭제 로직.
- 수동 테스트: 5분 녹화 후 세그먼트 개수/용량 확인.

---

### Phase 4. 업로드 워커 (Post-MVP)

- `UploadWorker` 구현(Web Worker):
  - 세그먼트/로그 큐 관리, presigned 업로드, 재시도/백오프.
  - 네트워크 상태 변화에 따른 pause/resume.
  - 업로드 상태(`LOCAL_ONLY → UPLOADING → UPLOADED`) 동기화.

**재시도 정책**:

- 최대 3회 재시도, 지수 백오프 (1s → 2s → 4s).
- 네트워크 `UNSTABLE` 상태에서는 재시도 큐에 보관.

**검증**:

- 유닛 테스트: 큐 관리, 재시도 로직.
- 수동 테스트: 네트워크 차단 후 복구 시 업로드 재개 확인.

---

### Phase 5. InsightTag UI/재생 (Post-MVP)

- InsightTag 조회 훅/컴포넌트 추가.
- `Highlight Panel` UI 구성 및 재생 기능 추가:
  - 로컬 Blob 우선 재생, 없으면 S3 URL 재생.
  - 세그먼트 오프셋을 적용한 클립 재생.

**검증**:

- E2E: InsightTag 클릭 → 클립 재생 → 오프셋 정확도 확인.

---

## 마일스톤 요약

| 마일스톤 | Phase     | 목표                               | 예상 기간 |
| -------- | --------- | ---------------------------------- | --------- |
| **MVP**  | 0 + 1 + 2 | 입력 로그 수집 + 네트워크 모니터링 | 1~2주     |
| **v1.0** | 3 + 4     | 세그먼트 녹화/저장 + 업로드        | 2~3주     |
| **v1.1** | 5         | InsightTag UI + 클립 재생          | 1~2주     |

---

## 검증 체크리스트

- [ ] 스트리밍 품질(프레임 드랍/입력 지연) 영향 최소화.
- [ ] `media_time` 기반 동기화 오차가 50ms 이내로 수렴.
- [ ] 업로드 중단/재개가 네트워크 상태에 따라 정상 작동.
- [ ] 브라우저 비호환 환경에서 안전하게 기능 비활성 처리.

---

## 롤백/비활성화 전략

> [!CAUTION] Virtual Highlight 기능은 기존 스트리밍에 영향을 주지 않아야 합니다.

1. **Feature Flag**: `VITE_ENABLE_HIGHLIGHT=true` 환경변수로 기능 활성화.
   - `false`일 경우 모든 훅/컴포넌트가 no-op 반환.
2. **Graceful Degradation**: 브라우저 기능 미지원 시 자동 비활성화.
   - `MediaRecorder` 미지원 → 녹화 비활성.
   - OPFS/IndexedDB 미사용 가능 → 저장 비활성.
3. **에러 격리**: 녹화/업로드 에러가 스트리밍 로직으로 전파되지 않도록 try-catch
   격리.
