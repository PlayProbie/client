/**
 * Game Streaming Feature 타입 정의
 *
 * 명명 규칙:
 * - API 응답/요청 타입: snake_case (Api prefix)
 * - 클라이언트 상태 타입: camelCase
 */

// ----------------------------------------
// Build Types
// ----------------------------------------

/** 빌드 상태 */
export type BuildStatus =
  | 'PENDING'
  | 'UPLOADED'
  | 'REGISTERING'
  | 'READY'
  | 'FAILED';

/** [API] Build 엔티티 */
export interface ApiBuild {
  build_id: string;
  filename: string;
  status: BuildStatus;
  size: number;
  s3_key: string;
  executable_path: string;
  version?: string;
  note?: string;
  created_at: string;
  updated_at: string;
}

/** [Client] Build 엔티티 */
export interface Build {
  buildId: string;
  filename: string;
  status: BuildStatus;
  size: number;
  s3Key: string;
  executablePath: string;
  version?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

/** [API] Presigned URL 요청 */
export interface ApiPresignedUrlRequest {
  filename: string;
  file_size: number;
}

/** [API] Presigned URL 응답 */
export interface ApiPresignedUrlResponse {
  build_id: string;
  upload_url: string;
  s3_key: string;
  expires_in_seconds: number;
}

/** [Client] Presigned URL 응답 */
export interface PresignedUrlResponse {
  buildId: string;
  uploadUrl: string;
  s3Key: string;
  expiresInSeconds: number;
}

/** [API] Build Complete 요청 */
export interface ApiBuildCompleteRequest {
  s3_key: string;
}

/** [API] Build Complete 응답 */
export interface ApiBuildCompleteResponse {
  status: BuildStatus;
}

// ----------------------------------------
// Upload State Machine
// ----------------------------------------

/** 업로드 상태 */
export type UploadStep =
  | 'idle'
  | 'requesting_presigned_url'
  | 'uploading_to_s3'
  | 'completing_upload'
  | 'success'
  | 'error';

/** 업로드 에러 단계 */
export type UploadErrorStep = 'presigned' | 'upload' | 'complete';

/** 업로드 에러 객체 */
export interface UploadError {
  step: UploadErrorStep;
  code?: string;
  message: string;
  retriable: boolean;
}

/** 업로드 진행 상태 */
export interface UploadProgress {
  percent: number;
  uploaded: number;
  total: number;
  speed: number; // bytes per second
  eta: number; // seconds remaining
}

/** 업로드 상태 (idle) */
export interface UploadStateIdle {
  step: 'idle';
}

/** 업로드 상태 (requesting_presigned_url) */
export interface UploadStateRequestingUrl {
  step: 'requesting_presigned_url';
}

/** 업로드 상태 (uploading_to_s3) */
export interface UploadStateUploading {
  step: 'uploading_to_s3';
  buildId: string;
  s3Key: string;
  progress: UploadProgress;
}

/** 업로드 상태 (completing_upload) */
export interface UploadStateCompleting {
  step: 'completing_upload';
  buildId: string;
  s3Key: string;
}

/** 업로드 상태 (success) */
export interface UploadStateSuccess {
  step: 'success';
  buildId: string;
}

/** 업로드 상태 (error) */
export interface UploadStateError {
  step: 'error';
  error: UploadError;
  buildId?: string;
  s3Key?: string;
}

/** 업로드 상태 유니온 */
export type UploadState =
  | UploadStateIdle
  | UploadStateRequestingUrl
  | UploadStateUploading
  | UploadStateCompleting
  | UploadStateSuccess
  | UploadStateError;

// ----------------------------------------
// Stream Settings Types
// ----------------------------------------

/** GPU 프로파일 */
export type GpuProfile = 'entry' | 'performance' | 'high';

/** 해상도/FPS 옵션 */
export type ResolutionFps = '720p30' | '1080p60';

/** [Client] Stream Settings */
export interface StreamSettings {
  gpuProfile: GpuProfile;
  resolutionFps: ResolutionFps;
  os: string;
  region: string;
}

// ----------------------------------------
// Schedule Types
// ----------------------------------------

/** 스케줄 상태 */
export type ScheduleStatus = 'ACTIVE' | 'INACTIVE';

/** [Client] Schedule */
export interface Schedule {
  startDateTime: string; // ISO 8601
  endDateTime: string; // ISO 8601
  timezone: string;
  maxSessions: number;
  status: ScheduleStatus;
  nextActivation?: string;
  nextDeactivation?: string;
}

// ----------------------------------------
// Source Game Types (Survey 시스템)
// ----------------------------------------

/** [API] Source Game 엔티티 (Survey 시스템) */
export interface ApiSourceGame {
  game_id: number;
  game_name: string;
  game_genre: string[];
  created_at: string;
  is_streaming: boolean;
}

/** [Client] Source Game 엔티티 */
export interface SourceGame {
  gameId: number;
  gameName: string;
  gameGenre: string[];
  createdAt: string;
  isStreaming: boolean;
}

// ----------------------------------------
// Streaming Game Types
// ----------------------------------------

/** [API] Streaming Game 엔티티 (목록용) */
export interface ApiStreamingGame {
  game_uuid: string;
  game_id: number;
  game_name: string;
  builds_count: number;
  updated_at: string;
}

/** [Client] Streaming Game 엔티티 (목록용) */
export interface StreamingGame {
  gameUuid: string;
  gameId: number;
  gameName: string;
  buildsCount: number;
  updatedAt: string;
}

// Legacy aliases for backward compatibility
/** @deprecated Use StreamingGame instead */
export type ApiGameListItem = ApiStreamingGame;
/** @deprecated Use StreamingGame instead */
export type GameListItem = StreamingGame;

// ----------------------------------------
// Transformers
// ----------------------------------------

/** ApiBuild → Build 변환 */
export function toBuild(api: ApiBuild): Build {
  return {
    buildId: api.build_id,
    filename: api.filename,
    status: api.status,
    size: api.size,
    s3Key: api.s3_key,
    executablePath: api.executable_path,
    version: api.version,
    note: api.note,
    createdAt: api.created_at,
    updatedAt: api.updated_at,
  };
}

/** ApiPresignedUrlResponse → PresignedUrlResponse 변환 */
export function toPresignedUrlResponse(
  api: ApiPresignedUrlResponse
): PresignedUrlResponse {
  return {
    buildId: api.build_id,
    uploadUrl: api.upload_url,
    s3Key: api.s3_key,
    expiresInSeconds: api.expires_in_seconds,
  };
}

/** ApiSourceGame → SourceGame 변환 */
export function toSourceGame(api: ApiSourceGame): SourceGame {
  return {
    gameId: api.game_id,
    gameName: api.game_name,
    gameGenre: api.game_genre,
    createdAt: api.created_at,
    isStreaming: api.is_streaming,
  };
}

/** ApiStreamingGame → StreamingGame 변환 */
export function toStreamingGame(api: ApiStreamingGame): StreamingGame {
  return {
    gameUuid: api.game_uuid,
    gameId: api.game_id,
    gameName: api.game_name,
    buildsCount: api.builds_count,
    updatedAt: api.updated_at,
  };
}

/** @deprecated Use toStreamingGame instead */
export const toGameListItem = toStreamingGame;
