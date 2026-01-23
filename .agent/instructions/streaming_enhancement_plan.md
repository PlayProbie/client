# GameLift Streams 고도화 계획

## 목적

- 현재 스트리밍 구현(`gamelift_streaming_implementation.md`)에
  `streaming_analysis.md`의 **Smart Replay & Insight** 설계를 반영한다.
- 입력 로그/영상 세그먼트를 동기화하여 업로드하고, 서버의 분석 결과(Insight)를
  바탕으로 **가상 하이라이트 재생**을 제공한다.

---

## 특이사항 및 리스크 점검

### 브라우저/플랫폼 호환성

- `MediaRecorder`, `requestVideoFrameCallback`, OPFS는 브라우저별 지원이 다르다.
  Safari는 `MediaRecorder`/코덱 지원이 제한적이므로 `isTypeSupported` 검증 및
  폴백(IndexedDB, 캡처 비활성)을 준비한다.
- `OffscreenCanvas`/Worker 전송 제약으로 캡처는 메인 스레드 중심으로 설계한다.

### 동기화 정확도

- 입력 로그의 시간은 **밀리초(ms) 정수**로 기록한다 (소수점 미사용).
- 입력 로그는 `media_time` 기준으로 정렬되어야 한다. `requestVideoFrameCallback`
  미지원 환경에서는 `video.currentTime` 기반으로 동기화 오차가 발생할 수 있다.
- 세그먼트 경계(20~30초)에서 로그와 영상이 어긋나지 않도록 `segment_id` 전환
  시점 기준을 명확히 정의한다.
- **[현행 구현]** `getActiveSegmentIds(mediaTimeMs)`는 **recordStart~recordEnd**
  (오버랩 포함) 기준으로 활성 세그먼트를 계산한다.
- **[현행 구현]** 첫 세그먼트는 **앞 오버랩 없이 33s**, 이후 세그먼트는 36s로
  기록된다. 다음 세그먼트 시작은 **첫 구간 27s 이후**, 그다음은 30s 간격.

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
- **[현행 구현]** `SegmentRecorder`는 360p/30fps로 캡처하고,
  `MediaRecorder` **timeslice=1000ms**로 청크를 생성한다.
- **[현행 구현]** 코덱은 `vp9 → vp8 → webm → mp4` 순으로 지원 여부를 검사한다.
- **[현행 구현]** OPFS 저장 시 청크를 `SegmentWriter`로 스트리밍 기록하고,
  메타데이터는 IndexedDB에 저장해 LRU eviction을 수행한다.
- **[현행 구현]** 기본 저장 한도는 `quota * 0.5`이며, fallback은 **500MB**.

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
- **[현행 구현]** `useStreamHealth`는 **video + input** 통계를 병합하고,
  지표 누락 시 `UNSTABLE`로 판정한다.
- **[현행 구현]** 업로드 속도는
  `availableIncomingBitrate * 1%`로 계산하고 **128kbps 상한**,
  **64kbps fallback**을 적용한다.
- **[현행 구현]** Web Worker에서 토큰 버킷으로 업로드를 쓰로틀하고,
  `UNSTABLE` 전환 시 `AbortController`로 **진행 중 업로드를 중단**한다.
- **[현행 구현]** 스트리밍 종료 후(`streamingActive=false`)에는
  업로드 제한을 해제해 잔여 세그먼트를 후처리한다.

### 데이터/보안

- 키보드 입력 로그는 민감 데이터가 될 수 있다. 텍스트 입력/챗 입력 구간은 로그
  제외 또는 코드/키만 기록하는 정책이 필요하다.
- `applicationMessage` 채널은 크기 제한/스키마 검증/예외 처리 필요.
- **[현행 구현]** 키보드는 `code`만 기록하고 `key`는 빈 문자열로 저장한다.
- **[현행 구현]** 오버랩 구간은 `segment_ids`에 다중 귀속하며,
  입력 로그는 메모리 + IndexedDB에 동시 저장한다.

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

### 기존 파일 수정 (현행)

| 파일                                                             | 수정 내용                                          |
| ---------------------------------------------------------------- | -------------------------------------------------- |
| `src/features/game-streaming-session/lib/stream/stream-client.ts` | `inputConfiguration` 필터 연결, RTC 통계 래퍼 추가 |
| `src/features/game-streaming-session/hooks/stream/useGameStream.ts` | 입력/세그먼트/업로드/상태 모니터 통합              |
| `src/features/survey-session/components/ReplayOverlay.tsx`        | 로컬 세그먼트 리플레이 오버레이                     |

### 신규 파일/모듈 (현행 핵심)

| 파일                                                                 | 역할                                |
| -------------------------------------------------------------------- | ----------------------------------- |
| `src/features/game-streaming-session/hooks/input/useInputLogger.ts`  | 입력 이벤트 수집/샘플링 통합        |
| `src/features/game-streaming-session/hooks/input/useMediaTime.ts`    | rVFC 기반 media_time 추적           |
| `src/features/game-streaming-session/hooks/input/useInputFilters.ts` | SDK 입력 필터 팩토리                |
| `src/features/game-streaming-session/hooks/input/useInputLogStore.ts` | 메모리 + IDB 로그 저장소            |
| `src/features/game-streaming-session/hooks/stream/useStreamHealth.ts` | RTC 통계 기반 네트워크 상태 모니터  |
| `src/features/game-streaming-session/hooks/stream/useSegmentRecorder.ts` | 세그먼트 녹화 + 저장소 연동         |
| `src/features/game-streaming-session/lib/recorder/segment-recorder.ts` | Canvas/MediaRecorder 세그먼트 녹화 |
| `src/features/game-streaming-session/lib/store/segment-store.ts`     | OPFS/IndexedDB 세그먼트 저장소      |
| `src/features/game-streaming-session/lib/upload/upload-queue.ts`     | 업로드 큐/백오프                    |
| `src/features/game-streaming-session/lib/upload/upload-sync-store.ts` | pending 업로드 IndexedDB           |
| `src/features/game-streaming-session/hooks/upload/useUploadWorker.ts` | 업로드 워커 브리지                 |
| `src/features/game-streaming-session/workers/upload.worker.ts`       | 업로드 큐/쓰로틀 처리               |
| `src/features/game-streaming-session/workers/upload-shared-worker.ts` | Shared Worker 업로드               |
| `public/upload-sw.js`                                                | Service Worker Background Sync      |
| `src/lib/msw/handlers/highlight.ts`                                  | 업로드/인사이트 Mock API           |

---

## 구현 단계 (Phase)

### Phase 0. 계약/스키마 정리 (백엔드 협의 선행)

- 입력 로그 스키마 확정: `media_time` (ms), `timestamp`, `segment_id` 필수.
- 업로드 API 계약 (Smart Replay v1):
  - `POST /sessions/{sessionId}/replay/presigned-url`: Presigned URL 발급 (201
    Created).
  - `PUT S3 URL`: 바이너리 업로드.
  - `POST /sessions/{sessionId}/replay/upload-complete`: 업로드 완료 통지 (200
    OK).
  - `POST /sessions/{sessionId}/replay/logs`: 입력 로그 배치 전송 (202
    Accepted).
  - `POST /sessions/{sessionId}/replay/insights/{tagId}/answer`: 인사이트 질문
    답변.
- SSE 이벤트 계약:
  - `insight_question`: 인사이트 질문 (tag_id, insight_type, video_start_ms,
    video_end_ms 포함).
  - `insight_complete`: 인사이트 Phase 완료.

**산출물**:

- `src/lib/msw/handlers/highlight.ts` (Mock API)
- `src/features/game-streaming-session/types.ts` (스키마 타입)

---

### Phase 1. StreamClient 확장 + 입력 로그 수집 ⭐ MVP

- `StreamClient` 인터페이스 확장: `getVideoRTCStats`, `getInputRTCStats`,
  `sendApplicationMessage`, `onApplicationMessage` 콜백 지원.
- `createStreamClient`에 `inputConfiguration` 필터 연결.
- 입력 로그 수집 훅 추가(`useInputLogger`):
  - 키보드/마우스/게임패드 이벤트 샘플링 및 정규화.
  - `pagehide`, `visibilitychange`, `blur` 이벤트 수집.
  - `media_time` 산출: `requestVideoFrameCallback` 우선, 없으면 `currentTime`.
    **ms 정수로 변환** (`Math.round(mediaTime * 1000)`).
  - **마우스 샘플링**: 15Hz + 5px 변화량 필터링 적용.
  - **키보드 보안**: `code`만 기록하고 `key`는 빈 문자열로 저장.
  - **Mock 스트림**: SDK 필터 미동작 환경은 DOM 리스너로 폴백.

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
  - `video` → `canvas(360p, 30fps)` → `MediaRecorder(timeslice=1000ms)`.
  - **코어 30초 + 오버랩 3초**, 첫 세그먼트는 앞 오버랩 없이 **33초**,
    이후 세그먼트는 **36초** 녹화.
  - 코덱 지원(`vp9 → vp8 → webm → mp4`) 확인 및 실패 시 기능 비활성.
- `SegmentStore` 구현:
  - OPFS 우선, 미지원 시 IndexedDB 폴백(최후에 memory).
  - OPFS는 **청크 스트리밍 기록 + 메타 IndexedDB** 조합.
  - 저장 용량 체크 및 LRU 기반 삭제 정책.

#### 세그먼트 경계 전환 로직 (양쪽 오버랩)

```
Timeline:     0s ────────────── 30s ────────────── 60s ────────────── 90s
              │                  │                  │
Segment A:   [0s ═══════════════ 33s]               │
              │    (Core: 0~30s)  │                  │
              │                  │                  │
Segment B:               [27s ═══════════════ 63s]
              │                  │    (Core: 30~60s) │
              │                  │                  │
Segment C:                          [57s ═══════════════ 93s]
                                                      (Core: 60~90s)

세그먼트 구조:
- 코어 구간: 30초 (예: 0~30s, 30~60s)
- 앞쪽 오버랩: **첫 세그먼트 제외** -3초 (이전 세그먼트와 중복)
- 뒤쪽 오버랩: +3초 (다음 세그먼트와 중복)
- 총 녹화 시간: 첫 세그먼트 33초 / 이후 36초

segment_id 전환 시점:
- 새 세그먼트 녹화 시작 시 UUID 생성 (첫 세그먼트는 코어 시작 시점,
  이후 세그먼트는 코어 시작 -3초 전).
- 오버랩 구간(27s~33s)의 로그는 **양쪽 세그먼트 모두에 귀속**.
  → 로그에 `segment_ids: ["A", "B"]` 배열로 기록.
```

**검증**:

- 유닛 테스트: 세그먼트 생성/저장/삭제 로직.
- 수동 테스트: 5분 녹화 후 세그먼트 개수/용량 확인.

---

### Phase 4. 업로드 워커 (Post-MVP)

- `UploadWorker` 구현(Web Worker):
  - **Presigned URL 발급 요청** (`POST .../presigned-url`):
    - `sequence`, `video_start_ms`, `video_end_ms` 전송.
  - **S3 Upload**: 받은 URL로 `PUT` 요청.
  - **완료 알림** (`POST .../upload-complete`): `segment_id` 전송.
  - **로그 전송** (`POST .../logs`): `segment_id`에 해당하는 로그 배치 전송.
  - 상태 보존: 네트워크 오류 시 큐에 보존 후 재시도 (Exponential Backoff).
  - **쓰로틀링**: Web Worker에서 token bucket으로 업로드 속도 제한.

**재시도 정책**:

- 최대 3회 재시도, 지수 백오프 (1s → 2s → 4s).
- 네트워크 `UNSTABLE` 상태에서는 재시도 큐에 보관.

**검증**:

- 유닛 테스트: 큐 관리, 재시도 로직.
- 수동 테스트: 네트워크 차단 후 복구 시 업로드 재개 확인.

---

### Phase 4.5. Background Upload Persistence (Post-MVP)

탭이 닫혀도 업로드가 지속되도록 Background Sync 및 Shared Worker를 적용합니다.

#### 브라우저별 지원

| 브라우저    | 탭 닫힘 후 업로드      | 방식                             |
| ----------- | ---------------------- | -------------------------------- |
| Chrome/Edge | ✅ 지속                | Service Worker + Background Sync |
| Safari      | ✅ 지속 (다른 탭 필요) | Shared Worker                    |
| Firefox     | ✅ 지속 (다른 탭 필요) | Shared Worker                    |

#### 구현 내용

**1. Service Worker (Chrome/Edge)**

- `public/upload-sw.js`: `sync` 이벤트 리스너로 백그라운드 업로드 처리.
- `pagehide` 이벤트에서 `sync.register('upload-segments')` 호출.

**2. Shared Worker (Safari/Firefox)**

- `workers/upload-shared-worker.ts`: 여러 탭이 공유하는 업로드 워커.
- 같은 origin의 다른 탭이 열려있으면 업로드 지속.

**3. 업로드 큐 영속화**

- `lib/upload/upload-sync-store.ts`: IndexedDB 기반 pending 업로드 저장.
- SW/Shared Worker가 IndexedDB에서 목록 조회 후 OPFS에서 Blob 읽어 업로드.
- `pending/processing` 상태를 사용해 Web/Shared/Service Worker 중복 처리 방지.

#### 입력 로그 실시간 저장

입력 로그도 탭 종료 시 손실되지 않도록 IndexedDB에 실시간 저장합니다.

**구현**:

- `lib/input-log/input-log-store.idb.ts`: 입력 로그 IndexedDB 저장소.
- `useInputLogStore.ts`의 `addLog()` 호출 시 메모리 + IndexedDB 동시 저장.
- 세그먼트 업로드 시 해당 세그먼트의 로그만 추출하여 전송.

**입력 로그 흐름**:

```
[입력 이벤트 발생]
      ↓
useInputLogger.addLog(log)
      ↓
메모리 저장 (logsRef) + IndexedDB 저장 (saveInputLog)
      ↓
[세그먼트 녹화 완료]
      ↓
drainLogsBySegment(segmentId) → 해당 세그먼트의 로그만 추출
      ↓
enqueueUploadSegment(meta, blob, logs)
      ↓
[업로드] POST /replay/logs (segment_id별 로그)
```

**시간 기반 필터링**:

- `resolveSegmentIds(mediaTimeMs)`: 현재 media_time에 녹화 중인 세그먼트 ID
  반환.
- 로그는 해당 시간에 활성화된 세그먼트에만 귀속됨.
- 세그먼트 시간 범위(`start_media_time` ~ `end_media_time`)에 맞는 로그만 서버로
  전송.

**검증**:

- 수동 테스트: Safari에서 두 탭 열어 Shared Worker 동작 확인.
- 수동 테스트: 탭 강제 종료 후 새 탭에서 IndexedDB 로그 복구 확인.

### Phase 5. InsightTag UI/재생 (Post-MVP)

- `InsightHandler` (SSE Listener) 구현:
  - `insight_question` 이벤트 수신 시 Chat UI에 질문 및 **[장면 다시보기]** 버튼
    노출.
- `ReplayOverlay` 컴포넌트 구현:
  - 버튼 클릭 시 `video_start_ms` 기준으로 **세그먼트 내 오프셋 재생**.
  - **[현행 구현]** 로컬 OPFS/IndexedDB Blob만 재생하며,
    S3 URL 스트리밍은 TODO.
- 답변 전송 API 연동 (`POST /sessions/{sessionId}/replay/insights/{tagId}/answer`).

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
   - **[현행 구현]** `useGameStream`에서 `highlightEnabled`가 `true`로 고정되어
     있어 환경변수 토글은 TODO 상태.
2. **Graceful Degradation**: 브라우저 기능 미지원 시 자동 비활성화.
   - `MediaRecorder` 미지원 → 녹화 비활성.
   - OPFS/IndexedDB 미사용 가능 → 저장 비활성.
3. **에러 격리**: 녹화/업로드 에러가 스트리밍 로직으로 전파되지 않도록 try-catch
   격리.
