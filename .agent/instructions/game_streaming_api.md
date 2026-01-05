# Amazon GameLift Streams를 활용한 Game Streaming API

## **📌 공통 참조 사항**

### **Response Wrapper**

모든 성공 응답은 `result` 객체 내에 데이터를 포함합니다.

```json
{
	"result": {
		...
	}
}
```

### **Error Response**

에러 발생 시 통일된 포맷을 반환합니다.

```json
{
  "message": "잘못된 요청입니다.",
  "status": 400,
  "errors": [{ "field": "version", "value": "", "reason": "필수값입니다." }],
  "code": "C001"
}
```

### **구현 상태 아이콘**

- ✅ **구현됨**: 현재 서버에 이미 개발되어 있는 API
- 🔧 **수정 필요**: 기능 확장이 필요한 기존 API
- 🆕 **신규**: 이번 Phase에서 새로 개발해야 할 API

---

# **🎮 Phase 1: 빌드 자산 관리 (S3)**

> 목표: 게임 빌드 파일을 S3에 업로드하고 메타데이터를 DB에 저장합니다. 이때
> GameLift 리소스는 생성하지 않아 비용을 절감합니다.

---

## **🆕 `GET /games/{gameUuid}/builds`**

### **📝 설명**

- **Context**: 게임 대시보드 > '빌드 관리' 탭 진입 시 호출
- **Logic**: 해당 게임(`gameUuid`)에 속한 모든 빌드 이력을 최신순으로
  조회합니다.

### **Path Parameters**

| **Name** | **Type** | **Required** | **Description** |
| -------- | -------- | ------------ | --------------- |
| gameUuid | UUID     | ✅           | 게임 UUID       |

### **Response `200 OK`**

```json
{
"result": [
    {
			"id":"550e8400-e29b-41d4-a716-446655440000",
			"version":"1.0.0",
			"status":"UPLOADED",
			"total_files":150,
			"total_size":1073741824,
			"executable_path":"game.exe",
			"os_type":"WINDOWS",
			"instance_type":"g4dn.xlarge",
			"max_capacity":10,
			"created_at":"2026-01-05T12:00:00+09:00"
    }
  ],
  {...}
}

```

**참고**: `status`는 `PENDING`(업로드 중) 또는 `UPLOADED`(완료) 값을 가집니다.

---

## **✅ `POST /games/{gameUuid}/builds`**

### **📝 설명**

- **Context**: '새 빌드 업로드' 버튼 클릭 시 호출
- **Logic**:
  1. DB에 `PENDING` 상태의 빌드 레코드를 생성합니다.
  2. AWS STS를 통해 S3 업로드용 **임시 자격 증명(Temporary Credentials)**을
     발급합니다.
  3. 프론트엔드는 이 자격 증명으로 직접 S3에 파일을 업로드합니다.

### **Request Body**

```json
{ "version": "1.0.0" }
```

### **Response `201 Created`**

```json
{
  "buildId": "uuid",
  "version": "1.0.0",
  "s3Prefix": "gameUuid/buildUuid/",
  "credentials": {
    "accessKeyId": "ASIA...",
    "secretAccessKey": "...",
    "sessionToken": "...",
    "expiration": 1704456000000
  }
}
```

---

## **🔧 `POST /games/{gameUuid}/builds/{buildId}/complete`**

### **📝 설명**

- **Context**: 프론트엔드에서 S3 업로드가 완료된 후 호출
- **Logic**:
  1. S3에 실제 파일이 존재하는지 검증합니다.
  2. 빌드 상태를 `UPLOADED`로 변경합니다.
  3. **중요**: 스트리밍에
     필요한 `executable_path`, `instance_type`, `max_capacity` 등의 설정을 **이
     시점에 저장**합니다. 추후 JIT 프로비저닝 시 이 설정을 사용합니다.

### **Request Body**

| **Field**           | **Type** | **Required** | **Description**                                     |
| ------------------- | -------- | ------------ | --------------------------------------------------- |
| expected_file_count | number   | ✅           | 업로드된 파일 수                                    |
| expected_total_size | number   | ✅           | 총 크기 (bytes)                                     |
| executable_path     | string   | ✅           | 게임 실행 파일 경로 (예: `Binaries/Win64/Game.exe`) |
| os_type             | string   | ✅           | `WINDOWS` or `LINUX`                                |
| instance_type       | string   | ✅           | EC2 인스턴스 타입 (예: `g4dn.xlarge`)               |
| max_capacity        | number   | ✅           | 최대 동시 접속자 수                                 |

```json
{
  "expected_file_count": 150,
  "expected_total_size": 1073741824,
  "executable_path": "game.exe",
  "os_type": "WINDOWS",
  "max_capacity": 10
}
```

### **Response `200 OK`**

```json
{
  "result": {
    "id": "uuid",
    "status": "UPLOADED",
    "executable_path": "game.exe",
    "max_capacity": 10
  }
}
```

---

## **✅ `DELETE /games/{gameUuid}/builds/{buildId}`**

### **📝 설명**

- **Context**: 빌드 목록에서 삭제 버튼 클릭 시
- **Logic**: S3에 저장된 파일들을 모두 삭제하고, DB 레코드를 삭제합니다.

### **Response `204 No Content`**

---

# **📋 Phase 2: 설문 & 리소스 할당 (JIT Provisioning)**

> 목표: 설문 배포 탭에서 빌드를 선택하면, 그 시점에(Just-In-Time) GameLift
> 리소스를 생성합니다. 초기 용량은 0으로 설정하여 비용을 방지합니다.

---

## **🆕 `GET /surveys`**

### **📝 설명**

- **Context**: 설문 관리 페이지 진입 시
- **Logic**: 워크스페이스 내 모든 설문 목록을 조회합니다. `game_id` 파라미터로
  필터링 가능합니다.

### **Query Parameters**

- `game_id`: (Optional) 특정 게임의 설문만 조회

### **Response `200 OK`**

```json
{
	"result": [
		{
		"survey_id":1,
		"survey_name":"알파 테스트 설문",
		"status":"DRAFT",
		"created_at":"..."
	  },
	  {...}
  ]
}

```

---

## **🆕 `POST /surveys/{surveyId}/streaming-resource` (핵심 API)**

### **📝 설명**

- **Context**: 설문 설계 > '배포' 탭 > '빌드 연결' 버튼 클릭 시
- **Logic**:
  1. **GameLift Application 생성**: 선택된 빌드(S3 경로)를 기반으로
     Application을 생성합니다.
  2. **GameLift StreamGroup 생성**: `StreamGroup`을
     생성하되, `MinCapacity=0`, `DesiredCapacity=0`으로 설정합니다.
  3. **Associate**: Application과 StreamGroup을 연결합니다.
  4. DB에 `StreamingResource` 레코드를 생성하고 상태를 `PROVISIONING`으로
     설정합니다.

### **Request Body**

```json
{
  "build_id": "uuid",
  "instance_type": "g4dn.xlarge",
  "max_capacity": 10
}
```

### **Response `201 Created`**

```json
{
  "result": {
    "id": 1,
    "status": "PROVISIONING",
    "current_capacity": 0,
    "max_capacity": 10,
    "instance_type": "g4dn.xlarge"
  }
}
```

---

## **🆕 `GET /surveys/{surveyId}/streaming-resource`**

### **📝 설명**

- **Context**: 배포 탭 진입 시 또는 '연결' 후 상태 확인(Polling)
- **Logic**: DB에 저장된 리소스 연결 정보를 반환합니다.

### **Response `200 OK`**

```json
{
  "result": {
    "id": 1,
    "status": "READY",
    "current_capacity": 0,
    "max_capacity": 10,
    "instance_type": "g4dn.xlarge"
  }
}
```

**Status Flow**: `PROVISIONING` (생성요청) → `READY` (생성완료/Cap=0)

---

## **🆕 `DELETE /surveys/{surveyId}/streaming-resource`**

### **📝 설명**

- **Context**: '연결 해제' 버튼 클릭 시
- **Logic**: GameLift Application과 StreamGroup을 삭제하고, DB 연결 정보를
  제거합니다.

### **Response `204 No Content`**

---

# **🧪 Phase 3: 관리자 테스트 (0 ↔ 1)**

> 목표: 실제 배포 전 관리자가 게임을 확인해볼 수 있도록, 일시적으로 인스턴스를
> 1개만 띄웁니다.

---

## **🆕 `POST /surveys/{surveyId}/streaming-resource/start-test`**

### **📝 설명**

- **Context**: 배포 탭 > '테스트 시작' 버튼 클릭 시
- **Logic**: GameLift StreamGroup의 Capacity를 0에서 **1**로 변경 요청합니다.
  상태를 `TESTING`으로 변경합니다.

### **Response `200 OK`**

```json
{
  "result": {
    "status": "TESTING",
    "current_capacity": 1
  }
}
```

---

## **🆕 `GET /surveys/{surveyId}/streaming-resource/status`**

### **📝 설명**

- **Context**: 테스트 시작 후 로딩 스피너 및 '플레이' 버튼 활성화 여부 판단
- **Logic**: GameLift API를 호출하여 실제 인스턴스가 `ACTIVE` 상태인지
  확인합니다.
- **Backend**: `GetStreamGroup` 호출 -> `Status` == `ACTIVE` 확인

### **Response `200 OK`**

```json
{
  "result": {
    "status": "TESTING",
    "current_capacity": 1,
    "instances_ready": true // true면 '플레이' 버튼 활성화
  }
}
```

---

## **🆕 `POST /surveys/{surveyId}/streaming-resource/stop-test`**

### **📝 설명**

- **Context**: '테스트 종료' 버튼 클릭 시
- **Logic**: Capacity를 1에서 **0**으로 변경하여 과금을 중단합니다.
  상태를 `READY`로 복구합니다.

### **Response `200 OK`**

```json
{
  "result": {
    "status": "READY",
    "current_capacity": 0
  }
}
```

---

# **🚀 Phase 4-5: 서비스 오픈 & 종료 (Auto Scaling)**

> 목표: 설문 상태에 따라 자동으로 인스턴스 수를 조절합니다.

---

## **🆕 `PATCH /surveys/{surveyId}/status`**

### **📝 설명**

- **Context**: 설문 '개요' 탭 > 설문 시작/종료 버튼
- **Logic**:
  - `ACTIVE` 요청 시:
    1. 설문 상태를 `ACTIVE`로 변경.
    2. StreamGroup Capacity를 빌드 설정의 `max_capacity` (예: 10)로 Scale Out.
  - `CLOSED` 요청 시:
    1. 설문 상태를 `CLOSED`로 변경.
    2. **비동기(`@Async`)**로 리소스 정리 작업(Delete App/Group)을 트리거합니다.

### **Request Body**

```json
{ "status": "ACTIVE" }
```

### **Response `200 OK`**

```json
{
  "result": {
    "survey_id": 1,
    "status": "ACTIVE",
    "streaming_resource": {
      "status": "ACTIVE",
      "current_capacity": 10
    }
  }
}
```

---

# **🎮 Tester 스트리밍 API (Client Side)**

> Context: 설문 참여자가 초대 링크로 접속하여 게임을 플레이하는 과정입니다. Base
> Path: /streaming-games/{gameUuid}

---

## **🆕 `GET /streaming-games/{gameUuid}/session`**

### **📝 설명**

- **Context**: 테스터가 링크 접속 직후 로딩 화면
- **Logic**:
  1. 게임 및 설문 유효성 검사 (기간 체크).
  2. 현재 StreamGroup의 가용 슬롯 확인.
  3. 접속 가능하면 스트리밍 설정 정보 반환.

### **Response `200 OK`**

```json
{
  "result": {
    "game_name": "Demo Game",
    "is_available": true,
    "stream_settings": { "resolution": "1080p", "fps": 60 }
  }
}
```

---

## **🆕 `POST /streaming-games/{gameUuid}/signal`**

### **📝 설명**

- **Context**: WebRTC 연결 초기화 단계 (SDP 교환)
- **Logic**:
  1. 클라이언트가 GameLift SDK `generateSignalRequest()`로 생성한 SDP Offer를
     받습니다.
  2. 백엔드는 이를 GameLift `StartStageSession`? (또는 Stream API) 에 전달하여
     Signal Answer를 받아옵니다.
  3. 클라이언트에게 Answer를 반환하여 P2P 연결을 성립시킵니다.

### **Request Body**

```
{"signal_request":"base64-encoded-offer..." }

```

### **Response `200 OK`**

```
{
"result": {
"signal_response":"base64-encoded-answer...",
"expires_in_seconds":120
  }
}

```

---

## **🆕 `GET /streaming-games/{gameUuid}/status`**

### **📝 설명**

- **Context**: 게임 플레이 중 주기적 호출 (Heartbeat) - 1분 간격 등
- **Logic**: 세션이 여전히 유효한지 확인하고, 남은 시간을 반환합니다.

### **Response `200 OK`**

```
{
"result": {
"is_active":true,
"remaining_time_seconds":850,
"session_id":"session-uuid"
  }
}

```

---

## **🆕 `POST /streaming-games/{gameUuid}/terminate`**

### **📝 설명**

- **Context**: 테스터가 '게임 종료' 또는 '설문 하러 가기' 버튼 클릭 시
- **Logic**: 해당 세션을 명시적으로 종료하여 다른 대기자가 슬롯을 사용할 수 있게
  반환합니다.

### **Request Body**

```
{"session_id":"uuid","reason":"user_exit" }

```

### **Response `200 OK`**

```
{"result": {"success":true } }

```

---

# **⚠️ Error Codes**

| **Code** | **HTTP** | **Description**                                      |
| -------- | -------- | ---------------------------------------------------- |
| G001     | 404      | 게임을 찾을 수 없습니다.                             |
| S001     | 404      | 설문을 찾을 수 없습니다.                             |
| SR001    | 409      | 이미 스트리밍 리소스가 연결되어 있습니다.            |
| T001     | 400      | 잘못된 Signal Request입니다.                         |
| T002     | 404      | 스트리밍 가능한 게임이 아닙니다 (리소스 미할당).     |
| T003     | 503      | GameLift 서비스 연결 실패.                           |
| T004     | 429      | 현재 접속 가능한 세션이 꽉 찼습니다 (Capacity 초과). |
