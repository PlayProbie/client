# GameBuild API

## 개요
게임 빌드 생성/조회/삭제 및 업로드 완료 처리를 제공합니다.

## 엔드포인트

### GET /games/{gameUuid}/builds
- 설명: 게임 빌드 목록 조회
- Path: gameUuid (uuid)
- 응답(배열 항목 예시)
  - uuid: string
  - version: string
  - status: string
  - total_files: number
  - total_size: number
  - executable_path: string
  - os_type: string
  - created_at: string (ISO)

### POST /games/{gameUuid}/builds
- 설명: 새 게임 빌드 생성 및 S3 업로드용 임시 자격 증명 발급
- Path: gameUuid (uuid)
- Body
  - version: string
- 응답 예시
  - result.build_id: string
  - result.version: string
  - result.s3_prefix: string
  - result.credentials
    - access_key_id: string
    - secret_access_key: string
    - session_token: string
    - expiration: number

### POST /games/{gameUuid}/builds/{buildUuid}/complete
- 설명: S3 업로드 완료 확인 및 상태 변경
- Path: gameUuid (uuid), buildUuid (uuid)
- Body
  - expected_file_count: number
  - expected_total_size: number
  - executable_path: string
  - os_type: string (예: LINUX)
- 응답: 빌드 상세(목록 조회 항목과 동일 필드)

### DELETE /games/{gameUuid}/builds/{buildUuid}
- 설명: 빌드 및 S3 파일 삭제
- Path: gameUuid (uuid), buildUuid (uuid)
- 응답: 200 OK
