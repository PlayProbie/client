# Amazon GameLift Streams Web SDK 1.1.0

Amazon GameLift Streams와 WebRTC 기반 스트리밍 연결을 관리하는 클라이언트
SDK입니다.

---

## 목차

- [Functions](#functions)
- [Class: GameLiftStreams](#class-gameliftstreams)
- [Interface: GameLiftStreamsArgs](#interface-gameliftstreamsargs)
- [Interface: GameLiftStreamsStreamConfiguration](#interface-gameliftstreamsStreamconfiguration)
- [Interface: IClientConnection](#interface-iclientconnection)
- [Interface: InputConfiguration](#interface-inputconfiguration)
- [Interface: PerformanceStats](#interface-performancestats)
- [Type Aliases](#type-aliases)

---

## Functions

### setLogLevel

```ts
setLogLevel(level: "none" | "debug"): void
```

콘솔 로그 출력 레벨을 설정합니다.

| Parameter | Type                | Description      |
| --------- | ------------------- | ---------------- |
| `level`   | `"none" \| "debug"` | 원하는 로그 레벨 |

---

## Class: GameLiftStreams

HTML video element와 Amazon GameLift Streams 간의 연결을 관리하는 메인
클래스입니다.

### Constructor

```ts
new GameLiftStreams(args: GameLiftStreamsArgs)
```

### Accessor

| Name | Type     | Description                                  |
| ---- | -------- | -------------------------------------------- |
| `id` | `string` | 16자리 hex 문자열 형태의 고유 128-bit 식별자 |

### Methods

#### 연결 관리

| Method                  | Signature                                 | Description                                                                                           |
| ----------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `generateSignalRequest` | `(): Promise<string>`                     | WebRTC offer를 생성하여 SignalRequest 문자열 반환. 백엔드 서버를 통해 `StartStreamSession` API에 전달 |
| `processSignalResponse` | `(signalResponse: string): Promise<void>` | 백엔드에서 받은 SignalResponse를 파싱하여 WebRTC 연결 완료                                            |
| `close`                 | `(): void`                                | 스트림 연결 종료 및 내부 상태 정리                                                                    |

#### 입력 제어

| Method        | Signature  | Description                             |
| ------------- | ---------- | --------------------------------------- |
| `attachInput` | `(): void` | 마우스/키보드/게임패드 입력 전송 활성화 |
| `detachInput` | `(): void` | 입력 전송 비활성화                      |

#### 마이크

| Method             | Signature                                              | Description                                                       |
| ------------------ | ------------------------------------------------------ | ----------------------------------------------------------------- |
| `enableMicrophone` | `(constraints?: MediaTrackConstraints): Promise<void>` | 마이크 입력 연결. `generateSignalRequest()` 호출 전에 완료해야 함 |

#### 수동 입력 처리

> **Note:** `autoKeyboard`, `autoMouse`, `autoGamepad` 옵션이 `true`이면 자동
> 처리되므로 호출 불필요

| Method                 | Signature                     | Description                               |
| ---------------------- | ----------------------------- | ----------------------------------------- |
| `processKeyboardEvent` | `(e: KeyboardEvent): boolean` | 키보드 이벤트 전송                        |
| `processMouseEvent`    | `(e: MouseEvent): boolean`    | 마우스 이벤트 전송                        |
| `processGamepads`      | `(): boolean`                 | 모든 추적 중인 게임패드 입력 스캔 및 전송 |
| `addGamepad`           | `(gamepad: Gamepad): boolean` | 게임패드 추가                             |
| `removeGamepad`        | `(gamepad: Gamepad): boolean` | 게임패드 제거                             |

#### 통계 조회

| Method                  | Returns                   | Description                    |
| ----------------------- | ------------------------- | ------------------------------ |
| `getVideoRTCStats`      | `Promise<RTCStatsReport>` | 비디오 트랙 WebRTC 통계        |
| `getAudioRTCStats`      | `Promise<RTCStatsReport>` | 오디오 트랙 WebRTC 통계        |
| `getInputRTCStats`      | `Promise<RTCStatsReport>` | 입력 데이터 채널 WebRTC 통계   |
| `getMicrophoneRTCStats` | `Promise<RTCStatsReport>` | 마이크 오디오 트랙 WebRTC 통계 |

#### 메시지

| Method                   | Signature                        | Description                                 |
| ------------------------ | -------------------------------- | ------------------------------------------- |
| `sendApplicationMessage` | `(message: Uint8Array): boolean` | 게임 애플리케이션에 바이트 배열 메시지 전송 |

---

## Interface: GameLiftStreamsArgs

`GameLiftStreams` 생성자에 전달하는 설정 객체입니다.

| Property              | Type                                 | Required | Description                               |
| --------------------- | ------------------------------------ | -------- | ----------------------------------------- |
| `videoElement`        | `HTMLVideoElement`                   | ✅       | 스트림 비디오를 표시할 HTML video element |
| `audioElement`        | `HTMLAudioElement`                   | ✅       | 스트림 오디오를 재생할 HTML audio element |
| `clientConnection`    | `IClientConnection`                  | ❌       | 연결 콜백                                 |
| `inputConfiguration`  | `InputConfiguration`                 | ❌       | 마우스/키보드/게임패드 설정               |
| `streamConfiguration` | `GameLiftStreamsStreamConfiguration` | ❌       | 스트림 설정                               |

---

## Interface: GameLiftStreamsStreamConfiguration

스트림 품질 및 코덱 설정입니다.

| Property            | Type                               | Default     | Description                           |
| ------------------- | ---------------------------------- | ----------- | ------------------------------------- |
| `enableAudio`       | `boolean`                          | `true`      | 오디오 스트림 활성화                  |
| `maximumResolution` | `"1080p" \| "720p" \| "540p"`      | `"1080p"`   | 최대 비디오 해상도                    |
| `maximumKbps`       | `number`                           | `undefined` | 최대 다운로드 비트레이트 (Kbps)       |
| `forceVideoCodec`   | `string`                           | `undefined` | (실험적) 특정 WebRTC 비디오 코덱 강제 |
| `iceServers`        | `() => Promise<IceServerConfig[]>` | `undefined` | (실험적) 커스텀 ICE 서버 정보         |

---

## Interface: IClientConnection

스트림 연결 상태 및 이벤트 콜백입니다.

| Callback             | Signature                           | Description                                                                                                           |
| -------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `connectionState`    | `(state: string) => void`           | RTCPeerConnection 상태 변경 시 호출. `state`: `"connecting"`, `"connected"`, `"disconnected"`, `"failed"`, `"closed"` |
| `serverDisconnect`   | `(reasoncode: string) => void`      | 서버 측 연결 종료 시 호출. `reasoncode`: `"idle"`, `"terminated"`, 기타                                               |
| `channelError`       | `(e: any) => void`                  | WebRTC 데이터 채널 에러 발생 시 호출 (보통 복구 불가)                                                                 |
| `applicationMessage` | `(message: Uint8Array) => void`     | 게임 애플리케이션에서 메시지 수신 시 호출                                                                             |
| `performanceStats`   | `(stats: PerformanceStats) => void` | 성능 통계 수신 시 호출                                                                                                |

---

## Interface: InputConfiguration

마우스, 키보드, 게임패드 입력 처리 설정입니다.

### 자동 입력 설정

| Property          | Type                      | Default        | Description                                                 |
| ----------------- | ------------------------- | -------------- | ----------------------------------------------------------- |
| `autoKeyboard`    | `boolean`                 | `true`         | 키보드 이벤트 자동 리스닝 및 전송                           |
| `autoMouse`       | `boolean`                 | `true`         | 마우스 이벤트 자동 리스닝 및 전송                           |
| `autoGamepad`     | `boolean`                 | `true`         | 게임패드 자동 감지 및 매 프레임 입력 전송                   |
| `autoPointerLock` | `boolean \| "fullscreen"` | `"fullscreen"` | 원격 커서가 숨겨질 때 자동으로 마우스 캡처. FPS 게임에 유용 |

### 필터 설정

| Property         | Type                                                 | Description                                                                   |
| ---------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------- |
| `keyboardFilter` | `(event: KeyboardEvent) => boolean`                  | `false` 반환 시 해당 키보드 이벤트 차단                                       |
| `mouseFilter`    | `(event: MouseEvent) => boolean`                     | `false` 반환 시 해당 마우스 이벤트 차단                                       |
| `gamepadFilter`  | `(event: Gamepad) => boolean \| GamepadFilterResult` | `false` 반환 시 게임패드 차단, `GamepadFilterResult` 반환 시 특정 버튼만 차단 |

### 기타 설정

| Property           | Type                                  | Default        | Description                                 |
| ------------------ | ------------------------------------- | -------------- | ------------------------------------------- |
| `hapticFeedback`   | `boolean`                             | `true`         | 컨트롤러 진동 등 햅틱 피드백 허용           |
| `resetOnDetach`    | `boolean`                             | `true`         | `detachInput()` 호출 시 모든 입력 상태 리셋 |
| `trackWindowFocus` | `boolean`                             | `true`         | 윈도우 포커스 잃을 때 자동으로 입력 해제    |
| `setCursor`        | `boolean \| "visibility" \| function` | `"visibility"` | 원격 커서 모양 제어 방식                    |

---

## Interface: PerformanceStats

성능 통계 정보입니다.

| Property      | Type                | Description                        |
| ------------- | ------------------- | ---------------------------------- |
| `timestamp`   | `Date`              | 통계 캡처 시점                     |
| `application` | `ApplicationStats`  | 현재 세션의 애플리케이션 성능 통계 |
| `system`      | `SharedSystemStats` | 공유 컴퓨트 시스템 성능 통계       |

---

## Type Aliases

### ApplicationStats

애플리케이션 레벨 성능 통계입니다. 정규화된 메트릭의 경우 0.0 - 1.0이 적정
사용량이며, 1.0 초과 시 성능 문제가 발생할 수 있습니다.

| Property                      | Type     | Description            |
| ----------------------------- | -------- | ---------------------- |
| `cpuUtilizationNormalized`    | `number` | 정규화된 CPU 사용률    |
| `memoryUtilizationNormalized` | `number` | 정규화된 메모리 사용률 |
| `memoryUtilizationMb`         | `number` | 메모리 사용량 (MiB)    |

### SharedSystemStats

공유 컴퓨트 시스템 레벨 성능 통계입니다. 멀티테넌트 스트림 그룹에서는 여러
세션이 공유할 수 있습니다.

| Property              | Type     | Description            |
| --------------------- | -------- | ---------------------- |
| `cpuUtilization`      | `number` | CPU 사용률 (0-100%)    |
| `gpuUtilization`      | `number` | GPU 사용률 (0-100%)    |
| `memoryUtilization`   | `number` | 메모리 사용률 (0-100%) |
| `memoryUtilizationMb` | `number` | 메모리 사용량 (MiB)    |
| `vramUtilization`     | `number` | VRAM 사용률 (0-100%)   |
| `vramUtilizationMb`   | `number` | VRAM 사용량 (MiB)      |

### GameLiftStreamsIceServerConfiguration

ICE 서버 (STUN/TURN) 설정입니다.

```ts
type GameLiftStreamsIceServerConfiguration =
  | RTCIceServer
  | {
      url: string; // 'turn:', 'turns:', 'stun:', 'stuns:'로 시작하는 URL
      username?: string; // TURN 서버 인증 사용자명
      credential?: string; // TURN 서버 인증 비밀번호
    };
```

---

## Quick Start 예시

```ts
import { GameLiftStreams } from 'gamelift-streams-web-sdk';

const streams = new GameLiftStreams({
  videoElement: document.getElementById('video') as HTMLVideoElement,
  audioElement: document.getElementById('audio') as HTMLAudioElement,
  clientConnection: {
    connectionState: (state) => console.log('Connection:', state),
    serverDisconnect: (reason) => console.log('Disconnected:', reason),
  },
  inputConfiguration: {
    autoKeyboard: true,
    autoMouse: true,
    autoGamepad: true,
  },
});

// 1. 시그널 요청 생성
const signalRequest = await streams.generateSignalRequest();

// 2. 백엔드를 통해 StartStreamSession API 호출 후 signalResponse 수신
const signalResponse = await yourBackend.startSession(signalRequest);

// 3. 연결 완료
await streams.processSignalResponse(signalResponse);

// 4. 입력 활성화
streams.attachInput();

// 5. 종료 시
streams.close();
```
