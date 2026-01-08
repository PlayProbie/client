# Streaming Resource API

## 개요
설문(survey) 단위 스트리밍 리소스 생성/조회/삭제를 제공합니다.

## 엔드포인트

### GET /surveys/{surveyId}/streaming-resource
- 설명: 스트리밍 리소스 조회
- Path: surveyId (uuid)
- 응답 예시
  - uuid: string
  - status: string
  - current_capacity: number
  - max_capacity: number
  - instance_type: string
  - created_at: string (ISO)

### POST /surveys/{surveyId}/streaming-resource
- 설명: 스트리밍 리소스 생성
- Path: surveyId (uuid)
- Body
  - build_uuid: string
  - instance_type: string
  - max_capacity: number
- 응답: 생성된 리소스 상세(조회 응답과 동일 필드)

### DELETE /surveys/{surveyId}/streaming-resource
- 설명: 스트리밍 리소스 삭제
- Path: surveyId (uuid)
- 응답: 200 OK
