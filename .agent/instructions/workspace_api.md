# Workspace & Member API

## 1. Workspace API

### 1.1. 워크스페이스 목록 조회

**GET** `/workspaces`

현재 사용자가 소유한 워크스페이스 목록을 조회합니다.

- **Parameters**: 없음
- **Response** (`200 OK`)
  ```json
  {
    "result": [
      {
        "workspace_uuid": "string($uuid)",
        "name": "string",
        "description": "string",
        "profile_image_url": "string(url)",
        "game_count": "number",
        "created_at": "string($date-time)",
        "updated_at": "string($date-time)"
      }
    ]
  }
  ```

### 1.2. 워크스페이스 상세 조회

**GET** `/workspaces/{workspaceUuid}`

워크스페이스 상세 정보를 조회합니다.

- **Parameters**:
  - `workspaceUuid` (path): 워크스페이스 UUID
- **Response** (`200 OK`)
  ```json
  {
    "result": {
      "workspace_uuid": "string($uuid)",
      "name": "string",
      "description": "string",
      "profile_image_url": "string(url)",
      "game_count": "number",
      "created_at": "string($date-time)",
      "updated_at": "string($date-time)"
    }
  }
  ```

### 1.3. 워크스페이스 생성

**POST** `/workspaces`

새로운 워크스페이스를 생성합니다.

- **Request Body**
  ```json
  {
    "name": "string",
    "description": "string"
  }
  ```
- **Response** (`201 Created`)
  ```json
  {
    "result": {
      "workspace_uuid": "string($uuid)",
      "name": "string",
      "description": "string",
      "profile_image_url": "string",
      "game_count": "number",
      "created_at": "string($date-time)",
      "updated_at": "string($date-time)"
    }
  }
  ```

### 1.4. 워크스페이스 수정

**PUT** `/workspaces/{workspaceUuid}`

워크스페이스 정보를 수정합니다. (Owner만 가능)

- **Parameters**:
  - `workspaceUuid` (path): 워크스페이스 UUID
- **Request Body**
  ```json
  {
    "name": "string",
    "description": "string",
    "profile_image_url": "string"
  }
  ```
- **Response** (`200 OK`)
  ```json
  {
    "result": {
      "workspace_uuid": "string($uuid)",
      "name": "string",
      "description": "string",
      "profile_image_url": "string",
      "game_count": "number",
      "created_at": "string($date-time)",
      "updated_at": "string($date-time)"
    }
  }
  ```

### 1.5. 워크스페이스 삭제

**DELETE** `/workspaces/{workspaceUuid}`

워크스페이스와 하위 모든 게임을 삭제합니다. (Owner만 가능)

- **Parameters**:
  - `workspaceUuid` (path): 워크스페이스 UUID
- **Response** (`204 No Content`)

---

## 2. Workspace Member API

### 2.1. 멤버 목록 조회

**GET** `/workspaces/{workspaceUuid}/members`

워크스페이스의 모든 멤버를 조회합니다.

- **Parameters**:
  - `workspaceUuid` (path): 워크스페이스 UUID
- **Response** (`200 OK`)
  ```json
  {
    "result": [
      {
        "memberId": "number($int64)",
        "userUuid": "string($uuid)",
        "email": "string(email)",
        "name": "string",
        "role": "OWNER | MEMBER",
        "joined_at": "string($date-time)"
      }
    ]
  }
  ```

### 2.2. 멤버 초대

**POST** `/workspaces/{workspaceUuid}/members`

이메일로 사용자를 워크스페이스 멤버로 초대합니다.

- **Parameters**:
  - `workspaceUuid` (path): 워크스페이스 UUID
- **Request Body**
  ```json
  {
    "email": "string(email)"
  }
  ```
- **Response** (`200 OK`)
  ```json
  {
    "result": {
      "memberId": "number",
      "userUuid": "string",
      "email": "string",
      "name": "string",
      "role": "string",
      "joined_at": "string"
    }
  }
  ```
- **Errors**:
  - `404`: 사용자를 찾을 수 없음
  - `409`: 이미 멤버임

### 2.3. 멤버 내보내기

**DELETE** `/workspaces/{workspaceUuid}/members/{userId}`

멤버를 워크스페이스에서 내보냅니다. (Owner만 가능)

- **Parameters**:
  - `workspaceUuid` (path): 워크스페이스 UUID
  - `userId` (path): 내보낼 사용자 ID (Response의 memberId가 아닌 userId(PK)로
    보이는데, API 명세를 보면 path param name은 userId임. 주의 필요)
    - _Note_: API 명세에는 `userId`라고 되어 있으나, Response의 `memberId`인지
      User의 PK인지 확인 필요. 일단 명세대로 `userId` integer($int64)로 구현.

- **Response** (`204 No Content`)
