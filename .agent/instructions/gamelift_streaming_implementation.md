# GameLift Streams 구현 분석

Amazon GameLift Streams Web SDK를 사용한 현재 스트리밍 구현 분석입니다.

---

## 아키텍처 개요

```
StreamingPlayPage
    └── useGameStream (Hook)
            └── StreamClient
                    └── GameLift Streams SDK v1.1.0
                            └── WebRTC (비디오/오디오/입력)
```

### 핵심 파일

| 파일                                                         | 역할                      |
| ------------------------------------------------------------ | ------------------------- |
| `src/pages/play/StreamingPlayPage.tsx`                       | 테스터 스트리밍 UI 페이지 |
| `src/features/game-streaming-session/hooks/useGameStream.ts` | WebRTC 연결 관리 훅       |
| `src/features/game-streaming-session/lib/stream-client.ts`   | SDK 래퍼 클라이언트       |
| `src/lib/gameliftstreams-1.1.0.d.ts`                         | SDK 타입 정의             |

---

## WebRTC 연결 플로우

1. `createStreamClient(video, audio)` → SDK 클라이언트 생성
2. `generateSignalRequest()` → WebRTC SDP Offer 생성
3. `POST /surveys/{uuid}/signal` → 백엔드로 시그널 전송
4. `processSignalResponse(response)` → WebRTC 연결 완료
5. `attachInput()` → 키보드/마우스/게임패드 입력 활성화

---

## 현재 입력 설정

```typescript
inputConfiguration: {
  autoKeyboard: true,   // 키보드 자동 캡처
  autoMouse: true,      // 마우스 자동 캡처
  autoGamepad: true,    // 게임패드 자동 캡처
  setCursor: true,
  autoPointerLock: 'fullscreen',
}
```

> **중요**: 현재 입력은 SDK 내부에서 자동 처리되어 클라이언트 코드에서
> 인터셉트하지 않음

---

## 입력 로그 수집을 위한 확장 포인트

### 1. 입력 필터 콜백

SDK의 `InputConfiguration`에서 필터를 통해 이벤트 인터셉트 가능:

```typescript
inputConfiguration: {
  keyboardFilter: (event: KeyboardEvent) => {
    logInput({ type: 'keyboard', event, timestamp: Date.now() });
    return true; // true: 전송, false: 차단
  },
  mouseFilter: (event: MouseEvent) => {
    logInput({ type: 'mouse', event, timestamp: Date.now() });
    return true;
  },
  gamepadFilter: (gamepad: Gamepad) => {
    logInput({ type: 'gamepad', gamepad, timestamp: Date.now() });
    return true;
  },
}
```

### 2. WebRTC 통계 조회

```typescript
const videoStats = await gameLiftClient.getVideoRTCStats();
const inputStats = await gameLiftClient.getInputRTCStats();
```

### 3. 애플리케이션 메시지 채널

```typescript
// 수신
clientConnection: {
  applicationMessage: (message: Uint8Array) => {
    const data = JSON.parse(new TextDecoder().decode(message));
  };
}

// 송신
gameLiftClient.sendApplicationMessage(
  new TextEncoder().encode(JSON.stringify({ action: 'sync' }))
);
```

---

## SDK 주요 메서드

| 메서드                            | 설명                                |
| --------------------------------- | ----------------------------------- |
| `generateSignalRequest()`         | WebRTC Offer → SignalRequest 문자열 |
| `processSignalResponse()`         | SignalResponse → 연결 완료          |
| `attachInput()` / `detachInput()` | 입력 활성화/비활성화                |
| `getVideoRTCStats()`              | 비디오 트랙 통계                    |
| `getInputRTCStats()`              | 입력 데이터 채널 통계               |
| `close()`                         | 연결 종료                           |

---

## 구현 계획 (현행 반영)

### ✅ 완료된 범위

- [x] 세션 가용성 조회 및 UI 표시 (`getSession`, `useSessionInfo`)
- [x] WebRTC 시그널 교환 및 연결 (`useGameStream`, `postSignal`,
      `createStreamClient`)
- [x] 입력 자동 캡처 (autoKeyboard/autoMouse/autoGamepad + pointer lock)
- [x] Heartbeat 폴링 및 만료 처리 (`useSessionStatus`)
- [x] 세션 종료 플로우 (`postTerminate`, `useTerminateSession`)
- [x] 개발용 Mock 스트림 (`VITE_MOCK_STREAM=true`)

### 🟡 후속/미구현 (streaming_analysis 연계)

- [ ] 입력 로그 수집/필터 (`keyboardFilter`, `mouseFilter`, `gamepadFilter`)
- [ ] WebRTC 통계 수집 (`getVideoRTCStats`, `getInputRTCStats`)
- [ ] 애플리케이션 메시지 채널 송수신 (`sendApplicationMessage`)
- [ ] Virtual Highlight 시스템 (세그먼트 녹화/업로드/클립 재생)
