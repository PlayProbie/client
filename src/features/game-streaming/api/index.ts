// Game Streaming API - Public exports

// Streaming Games
export {
  getStreamingGameByUuid,
  getStreamingGames,
} from './get-streaming-games';
export {
  registerStreamingGame,
  type RegisterStreamingGameInput,
} from './register-streaming-game';
export {
  unregisterStreamingGame,
  type UnregisterStreamingGameInput,
} from './unregister-streaming-game';

// Source Games (Survey 시스템)
export { getSourceGames } from './get-source-games';

// Builds
export { getBuilds } from './get-builds';
export { postBuildComplete } from './post-build-complete';
export { postStsCredentials } from './post-sts-credentials';
export {
  type FolderUploadOptions,
  putS3FolderUpload,
} from './put-s3-folder-upload';

// Stream Settings
export { getStreamSettings } from './get-stream-settings';
export { putStreamSettings } from './put-stream-settings';

// Schedule
export { getSchedule } from './get-schedule';
export { putSchedule, type ScheduleInput } from './put-schedule';
