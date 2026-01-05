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

/** [API] STS Credentials 요청 */
export interface ApiStsCredentialsRequest {
  folder_name: string;
  total_file_count: number;
  total_size: number;
}

/** [API] STS Credentials 응답 */
export interface ApiStsCredentialsResponse {
  build_id: string;
  credentials: {
    access_key_id: string;
    secret_access_key: string;
    session_token: string;
    expiration: string;
  };
  bucket: string;
  key_prefix: string;
  expires_in_seconds: number;
}

/** [Client] AWS Credentials */
export interface AwsCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
  expiration: string;
}

/** [Client] STS Credentials 응답 */
export interface StsCredentialsResponse {
  buildId: string;
  credentials: AwsCredentials;
  bucket: string;
  keyPrefix: string;
  expiresInSeconds: number;
}

/** [API] Build Complete 요청 */
export interface ApiBuildCompleteRequest {
  key_prefix: string;
  file_count: number;
  total_size: number;
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
}

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

/** [API] Schedule 엔티티 */
export interface ApiSchedule {
  start_date_time: string;
  end_date_time: string;
  timezone: string;
  max_sessions: number;
  status: ScheduleStatus;
  next_activation?: string;
  next_deactivation?: string;
}

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

/** ApiStsCredentialsResponse → StsCredentialsResponse 변환 */
export function toStsCredentialsResponse(
  api: ApiStsCredentialsResponse
): StsCredentialsResponse {
  return {
    buildId: api.build_id,
    credentials: {
      accessKeyId: api.credentials.access_key_id,
      secretAccessKey: api.credentials.secret_access_key,
      sessionToken: api.credentials.session_token,
      expiration: api.credentials.expiration,
    },
    bucket: api.bucket,
    keyPrefix: api.key_prefix,
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

/** ApiStreamSettings → StreamSettings 변환 */
export function toStreamSettings(api: ApiStreamSettings): StreamSettings {
  return {
    gpuProfile: api.gpu_profile,
    resolutionFps: api.resolution_fps,
    os: api.os,
    region: api.region,
  };
}

/** StreamSettings → ApiStreamSettings 변환 */
export function toApiStreamSettings(client: StreamSettings): ApiStreamSettings {
  return {
    gpu_profile: client.gpuProfile,
    resolution_fps: client.resolutionFps,
    os: client.os,
    region: client.region,
  };
}

/** ApiSchedule → Schedule 변환 */
export function toSchedule(api: ApiSchedule): Schedule {
  return {
    startDateTime: api.start_date_time,
    endDateTime: api.end_date_time,
    timezone: api.timezone,
    maxSessions: api.max_sessions,
    status: api.status,
    nextActivation: api.next_activation,
    nextDeactivation: api.next_deactivation,
  };
}

/** Schedule → ApiSchedule 변환 (status, nextActivation, nextDeactivation 제외) */
export function toApiSchedule(
  client: Pick<
    Schedule,
    'startDateTime' | 'endDateTime' | 'timezone' | 'maxSessions'
  >
): Omit<ApiSchedule, 'status' | 'next_activation' | 'next_deactivation'> {
  return {
    start_date_time: client.startDateTime,
    end_date_time: client.endDateTime,
    timezone: client.timezone,
    max_sessions: client.maxSessions,
  };
}
