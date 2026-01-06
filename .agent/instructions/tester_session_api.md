# Tester Session API

테스터 세션 관리 API (WebRTC 시그널링, Heartbeat 등)

## 1. 세션 가용성 확인

**GET** `/surveys/{surveyUuid}/session`

세션 가용 여부를 확인합니다.

### Parameters

| Name         | In   | Type          | Description |
| :----------- | :--- | :------------ | :---------- |
| `surveyUuid` | path | string($uuid) | Survey UUID |

### Response

**200 OK**

```json
{
  "result": {
    "survey_uuid": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "game_name": "string",
    "is_available": true,
    "stream_settings": {
      "additionalProp1": "string",
      "additionalProp2": "string",
      "additionalProp3": "string"
    }
  }
}
```

## 2. 세션 상태 확인 (Heartbeat)

**GET** `/surveys/{surveyUuid}/session/status`

세션 활성 상태를 확인합니다.

### Parameters

| Name                  | In    | Type          | Description         |
| :-------------------- | :---- | :------------ | :------------------ |
| `surveyUuid`          | path  | string($uuid) | Survey UUID         |
| `survey_session_uuid` | query | string($uuid) | Survey Session UUID |

### Response

**200 OK**

```json
{
  "result": {
    "is_active": true,
    "survey_session_uuid": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
  }
}
```

## 3. WebRTC 시그널링

**POST** `/surveys/{surveyUuid}/signal`

WebRTC 시그널을 처리합니다.

### Parameters

| Name         | In   | Type          | Description |
| :----------- | :--- | :------------ | :---------- |
| `surveyUuid` | path | string($uuid) | Survey UUID |

### Request Body

```json
{
  "signal_request": "string"
}
```

### Response

**200 OK**

```json
{
  "result": {
    "signal_response": "string",
    "survey_session_uuid": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "expires_in_seconds": 0
  }
}
```

## 4. 세션 종료

**POST** `/surveys/{surveyUuid}/session/terminate`

세션을 종료합니다.

### Parameters

| Name         | In   | Type          | Description |
| :----------- | :--- | :------------ | :---------- |
| `surveyUuid` | path | string($uuid) | Survey UUID |

### Request Body

```json
{
  "survey_session_uuid": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "reason": "string"
}
```

### Response

**200 OK**

```json
{
  "result": {
    "success": true
  }
}
```
