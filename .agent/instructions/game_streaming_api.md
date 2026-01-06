# Amazon GameLift Streams를 활용한 Game Streaming API

## **📌 공통 참조 사항**

### **Response Wrapper**

모든 성공 응답은 `result` 객체 내에 데이터를 포함합니다.

```json
{ "result": { ... } }
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

---

# **🎮 Phase 1: 빌드 자산 관리 (S3)**

## **🆕 `GET /games/{gameUuid}/builds`**

### **📝 설명**

- **Context**: 게임 대시보드 > '빌드 관리' 탭 진입 시 호출
- **Logic**: 해당 게임(`gameUuid`)에 속한 모든 빌드 이력을 최신순으로
  조회합니다.

### **Path Parameters**

| **Field** | **Type** | **Required** | **Description** |
| --------- | -------- | ------------ | --------------- |
| gameUuid  | UUID     | ✅           | 게임 UUID       |

### **Response `200 OK`**

```json
{
  "result": [
    {
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "version": "1.0.0",
      "status": "UPLOADED",
      "total_files": 150,
      "total_size": 1073741824,
      "executable_path": "game.exe",
      "os_type": "WINDOWS",
      "created_at": "2026-01-05T12:00:00+09:00"
    }
  ]
}
```

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

| **Field** | **Type** | **Required** | **Description**      |
| --------- | -------- | ------------ | -------------------- |
| version   | string   | ✅           | 버전명 (예: "1.0.0") |

```json
{ "version": "1.0.0" }
```

### **Response `201 Created`**

```json
{
  "result": {
    "buildId": "550e8400-e29b-41d4-a716-446655440000",
    "version": "1.0.0",
    "s3Prefix": "gameUuid/buildUuid/",
    "credentials": {
      "accessKeyId": "ASIA...",
      "secretAccessKey": "...",
      "sessionToken": "...",
      "expiration": 1704456000000
    }
  }
}
```

---

## **🔧 `POST /games/{gameUuid}/builds/{buildUuid}/complete`**

### **📝 설명**

- **Context**: 프론트엔드에서 S3 업로드가 완료된 후 호출
- **Logic**:
  1. S3에 실제 파일이 존재하는지 검증합니다.
  2. 빌드 상태를 `UPLOADED`로 변경합니다.
  3. 실행 파일 경로 및 OS 타입을 저장합니다. (Capacity, Stream Class 설정은
     Phase 2에서 진행)

### **Request Body**

| **Field**           | **Type** | **Required** | **Description**                                     |
| ------------------- | -------- | ------------ | --------------------------------------------------- |
| expected_file_count | number   | ✅           | 업로드된 파일 수                                    |
| expected_total_size | number   | ✅           | 총 크기 (bytes)                                     |
| executable_path     | string   | ✅           | 게임 실행 파일 경로 (예: `Binaries/Win64/Game.exe`) |
| os_type             | string   | ✅           | `WINDOWS` or `LINUX`                                |

```json
{
  "expected_file_count": 150,
  "expected_total_size": 1073741824,
  "executable_path": "game.exe",
  "os_type": "WINDOWS"
}
```

### **Response `200 OK`**

```json
{
  "result": {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "status": "UPLOADED",
    "executable_path": "game.exe",
    "os_type": "WINDOWS"
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

## **🆕 `GET /surveys`**

### **📝 설명**

- **Context**: 설문 관리 페이지 진입 시
- **Logic**: 워크스페이스 내 모든 설문 목록을 조회합니다.

### **Query Parameters**

| **Field** | **Type** | **Required** | **Description** |
| --------- | -------- | ------------ | --------------- |
| game_uuid | String   | ❌           | 게임 UUID 필터  |

### **Response `200 OK`**

```json
{
  "result": [
    {
      "survey_uuid": "8e367850-...",
      "survey_name": "플레이테스트 설문",
      "status": "DRAFT",
      "created_at": "2026-01-05T12:00:00+09:00"
    }
  ]
}
```

---

## **🆕 `POST /surveys/{surveyId}/streaming-resource`**

### **📝 설명**

- **Context**: 설문 배포 탭 > '빌드 연결' 버튼 클릭 시
- **Logic**:
  1. **GameLift Application 생성**: 빌드(S3)를 기반으로 Application을
     생성합니다.
  2. **DB 저장**: `StreamingResource` 저장.
     - _Note_: OS와 Instance Type 간의 호환성 검증은 클라이언트 및 공통 Enum
       수준에서 관리하며, API 레벨에서는 별도의 Blocking Validtion을 수행하지
       않습니다.

<aside>
⚠️

### **AWS Stream Class Reference**

| **Generation** | **OS Support** | **Stream Class ID (Value)** | **vCPU** | **RAM** | **VRAM** | **GPU**     |
| -------------- | -------------- | --------------------------- | -------- | ------- | -------- | ----------- |
| **Gen6**       | **Windows**    | `gen6n_pro_win2022`         | 16       | 64GB    | 24GB     | NVIDIA L4   |
|                |                | `gen6n_ultra_win2022`       | 8        | 32GB    | 24GB     | NVIDIA L4   |
|                | **Linux**      | `gen6n_pro`                 | 16       | 64GB    | 24GB     | NVIDIA L4   |
|                |                | `gen6n_ultra`               | 8        | 32GB    | 24GB     | NVIDIA L4   |
|                |                | `gen6n_high`                | 4        | 16GB    | 12GB     | NVIDIA L4   |
|                |                | `gen6n_medium`              | 2        | 8GB     | 6GB      | NVIDIA L4   |
|                |                | `gen6n_small`               | 1        | 4GB     | 2GB      | NVIDIA L4   |
| **Gen5**       | **Windows**    | `gen5n_win2022`             | 8        | 32GB    | 24GB     | NVIDIA A10G |
|                | **Linux**      | `gen5n_ultra`               | 8        | 32GB    | 24GB     | NVIDIA A10G |
|                |                | `gen5n_high`                | 4        | 16GB    | 12GB     | NVIDIA A10G |
| **Gen4**       | **Windows**    | `gen4n_win2022`             | 8        | 32GB    | 16GB     | NVIDIA T4   |
|                | **Linux**      | `gen4n_ultra`               | 8        | 32GB    | 16GB     | NVIDIA T4   |
|                |                | `gen4n_high`                | 4        | 16GB    | 8GB      | NVIDIA T4   |

(프론트엔드 개발 시 `instance_type` 값으로 사용하세요)

> 호환성 규칙: _win2022 접미사가 있는 ID는 WINDOWS 빌드 전용, 없는
> ID는 LINUX 빌드 전용입니다.

</aside>

### **Request Body**

| **Field**     | **Type** | **Required** | **Description**                                |
| ------------- | -------- | ------------ | ---------------------------------------------- |
| build_uuid    | UUID     | ✅           | 연결할 빌드 UUID                               |
| instance_type | string   | ✅           | 사용할 EC2 인스턴스 타입 (예: `gen4n_win2022`) |
| max_capacity  | number   | ✅           | 서비스 시 목표 동시 접속자 수                  |

```json
{
  "build_uuid": "550e8400-e29b-41d4-a716-446655440000",
  "instance_type": "g4dn.xlarge",
  "max_capacity": 10
}
```

### **Response `201 Created`**

```json
{
  "result": {
    "uuid": "e45f9...", // UUID
    "status": "PROVISIONING",
    "current_capacity": 0,
    "max_capacity": 10,
    "instance_type": "gen4n_win2022",
    "created_at": "2026-01-05T12:00:00+09:00"
  }
}
```

---

## **🆕 `GET /surveys/{surveyUuid}/streaming-resource`**

### **📝 설명**

- **Context**: 배포 탭 진입 시 또는 '연결' 후 상태 확인(Polling)
- **Logic**: DB에 저장된 리소스 연결 정보를 반환합니다.

### **Response `200 OK`**

```json
{
  "result": {
    "uuid": "e45f9...",
    "status": "READY",
    "current_capacity": 0,
    "max_capacity": 10,
    "instance_type": "gen4n_win2022"
  }
}
```

**Status Flow:**

- `PENDING`: 연결 대기
- `PROVISIONING`: 리소스 생성 중
- `READY`: 준비 완료 (Capacity=0)
- `TESTING`: 관리자 테스트 (Capacity=1)
- `SCALING`: 확장이 진행 중인 상태
- `ACTIVE`: 서비스 중 (Capacity=N)
- `CLEANING`: 정리 중
- `TERMINATED`: 삭제됨

---

## **🆕 `DELETE /surveys/{surveyId}/streaming-resource`**

### **📝 설명**

- **Context**: '연결 해제' 버튼 클릭 시
- **Logic**: GameLift Application과 StreamGroup을 삭제하고, DB 연결 정보를
  제거합니다.

### **Response `204 No Content`**

---

# **🧪 Phase 3: 관리자 테스트 (0 ↔ 1)**

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
    "current_capacity": 1,
    "message": "인스턴스 준비 중입니다."
  }
}
```

---

## **🆕 `GET /surveys/{surveyId}/streaming-resource/status`**

### **📝 설명**

- **Context**: 테스트 시작 후 로딩 스피너 및 '플레이' 버튼 활성화 여부 판단
  (Polling)
- **Logic**: GameLift API를 호출하여 실제 인스턴스가 `ACTIVE` 상태인지
  확인합니다. `instances_ready`가 `true`면 접속 가능함을 의미합니다.

### **Response `200 OK`**

```json
{
  "result": {
    "status": "TESTING",
    "current_capacity": 1,
    "instances_ready": true
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

# **🚀 Phase 4-5: 서비스 오픈 & 종료**

## **🆕 `PATCH /surveys/{surveyId}/status`**

### **📝 설명**

- **Context**: 설문 '개요' 탭 > 설문 시작/종료 버튼
- **Logic**:
  - `Status: ACTIVE` 요청 시:
    1. 설문 상태를 `ACTIVE`로 변경합니다.
    2. StreamGroup Capacity를 DB에 저장된 `max_capacity`로 확장 요청합니다.
    3. StreamingResource 상태를 `SCALING`으로 설정하여 클라이언트가 대기하도록
       유도합니다.
  - `Status: CLOSED` 요청 시:
    1. 설문 상태를 `CLOSED`로 변경합니다.
    2. `비동기(@Async)`로 리소스 정리 작업(Delete App/Group)을 트리거합니다.

### **Request Body**

| **Field** | **Type** | **Required** | **Description**      |
| --------- | -------- | ------------ | -------------------- |
| status    | string   | ✅           | `ACTIVE` or `CLOSED` |

```json
{ "status": "ACTIVE" }
```

### **Response `200 OK` (ACTIVE 요청 시)**

```json
{
  "result": {
    "survey_uuid": "8e367850-...",
    "status": "ACTIVE",
    "streaming_resource": {
      "status": "SCALING",
      "current_capacity": 0,
      "message": "서버 확장 중입니다."
    }
  }
}
```

---

# **🎮 Tester 스트리밍 API (Client Side)**

## **🆕 `GET /surveys/{surveyUuid}/session`**

### **📝 설명**

- **Context**: 테스터가 플레이 화면에 진입했을 때 (로딩 중)
- **Logic**:
  1. **유효성 검증**: `surveyUuid`로 설문을 찾고 상태가 `ACTIVE`인지 확인합니다.
  2. **가용성 확인**: 연결된 StreamGroup의 현재 Capacity와 활성 세션 수를
     비교하여 여유 슬롯이 있는지 확인합니다.
  3. 서버가 확장 중(`SCALING`)이거나 꽉 찬 경우 `is_available: false`를
     반환합니다.

### **Path Parameters**

| **Field**  | **Type** | **Required** | **Description**          |
| ---------- | -------- | ------------ | ------------------------ |
| surveyUuid | UUID     | ✅           | 설문 UUID (PK 노출 방지) |

### **Response `200 OK`**

```json
{
  "result": {
    "survey_uuid": "550e8400-...",
    "game_name": "My RPG Game",
    "is_available": true,
    "stream_settings": {
      "resolution": "1080p",
      "fps": 60
    }
  }
}
```

---

## **🆕 `POST /surveys/{surveyUuid}/signal`**

### **📝 설명**

- **Context**: WebRTC 연결 초기화 (SDP Offer/Answer 교환)
- **Logic**:
  1. DB에 `SurveySession` 엔티티를 생성합니다.
  2. AWS GameLift `StartStreamSession`을 호출하여 세션을 시작합니다.
     - `survey_session_uuid`는 AWS Session ID가 아닌 DB Entity의 UUID입니다.
  3. AWS로부터 받은 Signal Answer와 생성된 세션 UUID를 반환합니다.

### **Request Body**

| **Field**      | **Type** | **Required** | **Description**                                        |
| -------------- | -------- | ------------ | ------------------------------------------------------ |
| signal_request | string   | ✅           | GameLift SDK `generateSignalRequest()` 반환값 (Base64) |

```json
{ "signal_request": "base64-encoded-offer-string..." }
```

### **Response `200 OK`**

```json
{
  "result": {
    "signal_response": "base64-encoded-answer-string...",
    "survey_session_uuid": "7a3b3...",
    "expires_in_seconds": 120
  }
}
```

---

## **🆕 `GET /surveys/{surveyUuid}/session/status`**

### **📝 설명**

- **Context**: 게임 플레이 중 Heartbeat (1분 간격)
- **Logic**: 세션 유효성 확인.

### **Response `200 OK`**

```json
{
  "result": {
    "is_active": true,
    "survey_session_uuid": "7a3b3..."
  }
}
```

---

## **🆕 `POST /surveys/{surveyUuid}/session/terminate`**

### **📝 설명**

- **Context**: 테스터가 '게임 종료' 또는 '설문 하러 가기' 버튼 클릭 시
- **Logic**:
  1. AWS GameLift SDK `TerminateStreamSession`을 호출하여 리소스를 즉시
     반환합니다.
  2. DB `SurveySession` 상태를 종료(`TERMINATED`)로 업데이트합니다.

### **Request Body**

| **Field**           | **Type** | **Required** | **Description**                             |
| ------------------- | -------- | ------------ | ------------------------------------------- |
| survey_session_uuid | UUID     | ✅           | 종료할 세션 UUID                            |
| reason              | string   | ❌           | 종료 사유 (`user_exit`, `timeout`, `error`) |

```json
{
  "survey_session_uuid": "7a3b3...",
  "reason": "user_exit"
}
```

### **Response `200 OK`**

```json
{ "result": { "success": true } }
```

---

# **⚠️ Error Codes**

| **Code** | **HTTP** | **Description**                                      |
| -------- | -------- | ---------------------------------------------------- |
| G001     | 404      | 게임을 찾을 수 없습니다.                             |
| S001     | 404      | 설문을 찾을 수 없습니다.                             |
| SR001    | 409      | 이미 스트리밍 리소스가 연결되어 있습니다.            |
| T001     | 400      | 잘못된 Signal Request입니다.                         |
| T002     | 404      | 리소스 미할당 또는 세션 불가                         |
| T003     | 503      | GameLift 서비스 오류                                 |
| T004     | 429      | 현재 접속 가능한 세션이 꽉 찼습니다 (Capacity 초과). |
