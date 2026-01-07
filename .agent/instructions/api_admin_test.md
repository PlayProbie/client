# Admin Test API

## 개요
설문(survey) 단위로 스트리밍 리소스 테스트를 시작/중지하고 상태를 조회합니다.

## 엔드포인트

### GET /surveys/{surveyId}/streaming-resource/status
- 설명: 스트리밍 리소스 테스트 상태 조회
- Path: surveyId (uuid)
- 응답 예시
  - result.status: string
  - result.current_capacity: number
  - result.instances_ready: boolean

### POST /surveys/{surveyId}/streaming-resource/start-test
- 설명: 스트리밍 리소스 테스트 시작
- Path: surveyId (uuid)
- 응답 예시
  - result.status: string
  - result.current_capacity: number
  - result.message: string

### POST /surveys/{surveyId}/streaming-resource/stop-test
- 설명: 스트리밍 리소스 테스트 중지
- Path: surveyId (uuid)
- 응답 예시
  - result.status: string
  - result.current_capacity: number
  - result.message: string
