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

/** [API] Create Build 요청 (Spring GameBuildApi.createBuild) */
export interface ApiCreateBuildRequest {
  version: string;
}

/** [API] Create Build 응답 (Spring GameBuildApi.createBuild) */
export interface ApiCreateBuildResponse {
  buildId: string;
  version: string;
  s3Prefix: string;
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken: string;
    expiration: number; // epoch timestamp
  };
}

/** [Client] AWS Credentials */
export interface AwsCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
  expiration: string; // ISO 8601
}

/** [Client] Create Build 응답 */
export interface CreateBuildResponse {
  buildId: string;
  version: string;
  s3Prefix: string;
  credentials: AwsCredentials;
}

/** [API] Build Complete 요청 (Spring GameBuildApi.completeUpload) */
export interface ApiBuildCompleteRequest {
  expectedFileCount: number;
  expectedTotalSize: number;
}

/** [API] Build Complete 응답 (Spring GameBuildApi.completeUpload) */
export interface ApiBuildCompleteResponse {
  id: string;
  gameUuid: string;
  version: string;
  s3Prefix: string;
  status: string;
  totalFiles: number;
  totalSize: number;
  createdAt: string;
}

// ----------------------------------------
// Upload State Machine
// ----------------------------------------

/** 업로드 상태 */
export type UploadStep =
  | 'idle'
  | 'requesting_sts_credentials'
  | 'uploading_to_s3'
  | 'completing_upload'
  | 'success'
  | 'error';

/** 업로드 에러 단계 */
export type UploadErrorStep = 'sts' | 'upload' | 'complete';

/** 업로드 에러 객체 */
export interface UploadError {
  step: UploadErrorStep;
  code?: string;
  message: string;
  retriable: boolean;
}

/** 폴더 업로드 진행 상태 */
export interface FolderUploadProgress {
  totalFiles: number;
  uploadedFiles: number;
  totalBytes: number;
  uploadedBytes: number;
  percent: number;
  speed: number; // bytes per second
  eta: number; // seconds remaining
  currentFileName: string;
}

/** 업로드 상태 (idle) */
export interface UploadStateIdle {
  step: 'idle';
}

/** 업로드 상태 (requesting_sts_credentials) */
export interface UploadStateRequestingSts {
  step: 'requesting_sts_credentials';
}

/** 업로드 상태 (uploading_to_s3) */
export interface UploadStateUploading {
  step: 'uploading_to_s3';
  buildId: string;
  keyPrefix: string;
  progress: FolderUploadProgress;
}

/** 업로드 상태 (completing_upload) */
export interface UploadStateCompleting {
  step: 'completing_upload';
  buildId: string;
  keyPrefix: string;
  fileCount: number;
  totalSize: number;
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
  keyPrefix?: string;
}

/** 업로드 상태 유니온 */
export type UploadState =
  | UploadStateIdle
  | UploadStateRequestingSts
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

/** [API] Stream Settings 엔티티 */
export interface ApiStreamSettings {
  gpu_profile: GpuProfile;
  resolution_fps: ResolutionFps;
  os: string;
  region: string;
  max_sessions: number;
}

/** [Client] Stream Settings */
export interface StreamSettings {
  gpuProfile: GpuProfile;
  resolutionFps: ResolutionFps;
  os: string;
  region: string;
  maxSessions: number;
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

/** ApiCreateBuildResponse → CreateBuildResponse 변환 */
export function toCreateBuildResponse(
  api: ApiCreateBuildResponse
): CreateBuildResponse {
  return {
    buildId: api.buildId,
    version: api.version,
    s3Prefix: api.s3Prefix,
    credentials: {
      accessKeyId: api.credentials.accessKeyId,
      secretAccessKey: api.credentials.secretAccessKey,
      sessionToken: api.credentials.sessionToken,
      expiration: new Date(api.credentials.expiration).toISOString(),
    },
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

/** ApiStreamSettings → StreamSettings 변환 */
export function toStreamSettings(api: ApiStreamSettings): StreamSettings {
  return {
    gpuProfile: api.gpu_profile,
    resolutionFps: api.resolution_fps,
    os: api.os,
    region: api.region,
    maxSessions: api.max_sessions,
  };
}

/** StreamSettings → ApiStreamSettings 변환 */
export function toApiStreamSettings(client: StreamSettings): ApiStreamSettings {
  return {
    gpu_profile: client.gpuProfile,
    resolution_fps: client.resolutionFps,
    os: client.os,
    region: client.region,
    max_sessions: client.maxSessions,
  };
}
