# Game Management API

게임(Game)을 관리하는 API 명세서입니다.

## Base URL

`/api` (Server Context에 따라 변경 가능)

---

## 1. 워크스페이스 게임 목록 조회

**GET** `/workspaces/{workspaceUuid}/games`

특정 워크스페이스에 속한 모든 게임 목록을 조회합니다.

### Parameters

| Name            | Type           | In   | Required | Description       |
| :-------------- | :------------- | :--- | :------- | :---------------- |
| `workspaceUuid` | `string(uuid)` | path | **Yes**  | 워크스페이스 UUID |

### Responses

#### `200` 조회 성공

```json
{
  "result": [
    {
      "game_uuid": "7a3b3c4d-e5f6-7890-abcd-ef1234567890",
      "workspace_uuid": "550e8400-e29b-41d4-a716-446655440000",
      "game_name": "My RPG Game",
      "game_genre": ["RPG", "ACTION"],
      "game_context": "중세 판타지 배경의 오픈월드 RPG 게임입니다.",
      "created_at": "2026-01-06T12:01:44.771Z",
      "updated_at": "2026-01-06T12:01:44.771Z"
    }
  ]
}
```

#### `403` 접근 권한 없음

```json
{
  "result": "ERROR_MESSAGE" // (Schema implicit)
}
```

#### `404` 워크스페이스를 찾을 수 없음

```json
{
  "result": "ERROR_MESSAGE" // (Schema implicit)
}
```

---

## 2. 게임 생성

**POST** `/workspaces/{workspaceUuid}/games`

특정 워크스페이스 하위에 새 게임을 생성합니다.

### Parameters

| Name            | Type           | In   | Required | Description       |
| :-------------- | :------------- | :--- | :------- | :---------------- |
| `workspaceUuid` | `string(uuid)` | path | **Yes**  | 워크스페이스 UUID |

### Request Body

```json
{
  "game_name": "My RPG Game",
  "game_genre": ["RPG", "ACTION"],
  "game_context": "중세 판타지 배경의 오픈월드 RPG 게임입니다."
}
```

### Responses

#### `201` 생성 성공

```json
{
  "result": {
    "game_uuid": "7a3b3c4d-e5f6-7890-abcd-ef1234567890",
    "workspace_uuid": "550e8400-e29b-41d4-a716-446655440000",
    "game_name": "My RPG Game",
    "game_genre": ["RPG", "ACTION"],
    "game_context": "중세 판타지 배경의 오픈월드 RPG 게임입니다.",
    "created_at": "2026-01-06T12:01:44.773Z",
    "updated_at": "2026-01-06T12:01:44.773Z"
  }
}
```

#### `403` 접근 권한 없음

#### `404` 워크스페이스를 찾을 수 없음

---

## 3. 게임 상세 조회

**GET** `/games/{gameUuid}`

게임 상세 정보를 조회합니다.

### Parameters

| Name       | Type           | In   | Required | Description |
| :--------- | :------------- | :--- | :------- | :---------- |
| `gameUuid` | `string(uuid)` | path | **Yes**  | 게임 UUID   |

### Responses

#### `200` 조회 성공

```json
{
  "result": {
    "game_uuid": "7a3b3c4d-e5f6-7890-abcd-ef1234567890",
    "workspace_uuid": "550e8400-e29b-41d4-a716-446655440000",
    "game_name": "My RPG Game",
    "game_genre": ["RPG", "ACTION"],
    "game_context": "중세 판타지 배경의 오픈월드 RPG 게임입니다.",
    "created_at": "2026-01-06T12:01:44.769Z",
    "updated_at": "2026-01-06T12:01:44.769Z"
  }
}
```

#### `403` 접근 권한 없음

#### `404` 게임을 찾을 수 없음

---

## 4. 게임 수정

**PUT** `/games/{gameUuid}`

게임 정보를 수정합니다.

### Parameters

| Name       | Type           | In   | Required | Description |
| :--------- | :------------- | :--- | :------- | :---------- |
| `gameUuid` | `string(uuid)` | path | **Yes**  | 게임 UUID   |

### Request Body

```json
{
  "game_name": "Updated RPG Game",
  "game_genre": ["RPG", "ADVENTURE"],
  "game_context": "수정된 게임 설명입니다."
}
```

### Responses

#### `200` 수정 성공

```json
{
  "result": {
    "game_uuid": "7a3b3c4d-e5f6-7890-abcd-ef1234567890",
    "workspace_uuid": "550e8400-e29b-41d4-a716-446655440000",
    "game_name": "My RPG Game",
    "game_genre": ["RPG", "ACTION"],
    "game_context": "중세 판타지 배경의 오픈월드 RPG 게임입니다.",
    "created_at": "2026-01-06T12:01:44.775Z",
    "updated_at": "2026-01-06T12:01:44.775Z"
  }
}
```

#### `403` 접근 권한 없음

#### `404` 게임을 찾을 수 없음

---

## 5. 게임 삭제

**DELETE** `/games/{gameUuid}`

게임과 관련된 모든 빌드, 설문을 삭제합니다.

### Parameters

| Name       | Type           | In   | Required | Description |
| :--------- | :------------- | :--- | :------- | :---------- |
| `gameUuid` | `string(uuid)` | path | **Yes**  | 게임 UUID   |

### Responses

#### `204` 삭제 성공

(No Content)

#### `403` 접근 권한 없음

#### `404` 게임을 찾을 수 없음
