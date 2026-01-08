GET

[/interview/{surveyUuid}/{sessionUuid}](http://localhost:8080/swagger-ui/index.html#/Interview%20API/selectInterviewList)

인터뷰 이력 조회

#### Parameters

Try it out

|Name|Description|
|---|---|
|surveyUuid *<br><br>string($uuid)<br><br>(path)||
|sessionUuid *<br><br>string($uuid)<br><br>(path)||
#### Responses
```json
{
  "result": {
    "session": {
      "session_id": 0,
      "session_uuid": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "survey_id": 0,
      "status": "string"
    },
    "excerpts": [
      {
        "turn_num": 0,
        "question_text": "string",
        "answer_text": "string",
        "qtype": "string"
      }
    ],
    "sse_url": "/api/interviews/sse/550e8400-e29b-41d4-a716-446655440000"
  }
}
```

---
GET

[/interview/{sessionUuid}/stream](http://localhost:8080/swagger-ui/index.html#/Interview%20API/stream)

인터뷰 SSE 스트림 연결

Parameters

sessionUuid *
string($uuid)
(path)


#### Responses

|Code|Description|Links|
|---|---|---|
|200|OK<br><br>Media type<br><br>text/event-stream<br><br>Controls `Accept` header.<br><br>- Example Value<br>- Schema<br><br>```json<br>{<br>  "timeout": 0<br>}<br>```|


---
POST

[/interview/{surveyUuid}](http://localhost:8080/swagger-ui/index.html#/Interview%20API/createSession)

인터뷰 세션 생성


#### Parameters

Try it out

| Name                                            | Description |
| ----------------------------------------------- | ----------- |
| surveyUuid *<br><br>string($uuid)<br><br>(path) |             |
```json
{
  "age_group": "20s",
  "gender": "MALE",
  "prefer_genre": "RPG"
}
```

#### Responses

```json
{
  "result": {
    "session": {
      "session_id": 0,
      "session_uuid": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "survey_id": 0,
      "status": "string"
    },
    "sse_url": "/api/interviews/sse/550e8400-e29b-41d4-a716-446655440000"
  }
}
```


---
POST

[/interview/{sessionUuid}/messages](http://localhost:8080/swagger-ui/index.html#/Interview%20API/receiveAnswer)

사용자 응답 전송


| Name                                             | Description |
| ------------------------------------------------ | ----------- |
| sessionUuid *<br><br>string($uuid)<br><br>(path) |             |


#### Request body
```json
{
  "fixed_q_id": 1,
  "turn_num": 1,
  "answer_text": "게임 조작법이 직관적이었습니다.",
  "question_text": "게임의 조작법은 어떠셨나요?"
}
```


#### Responses

```json
{
  "result": {
    "turn_num": 1,
    "q_type": "FIXED",
    "fixed_q_id": 1,
    "question_text": "게임의 조작법은 어떠셨나요?",
    "answer_text": "게임 조작법이 직관적이었습니다."
  }
}
```