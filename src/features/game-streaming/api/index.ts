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
export { postPresignedUrl } from './post-presigned-url';
export { putS3Upload, type S3UploadOptions } from './put-s3-upload';

// Stream Settings
export { getStreamSettings } from './get-stream-settings';
export { putStreamSettings } from './put-stream-settings';

// Schedule
export { getSchedule } from './get-schedule';
export { putSchedule, type ScheduleInput } from './put-schedule';

// Legacy exports (deprecated)
/** @deprecated Use getStreamingGames instead */
export { getStreamingGames as getGames } from './get-streaming-games';
/** @deprecated Use getStreamingGameByUuid instead */
export { getStreamingGameByUuid as getGameByUuid } from './get-streaming-games';
