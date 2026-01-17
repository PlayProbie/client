// Game Streaming API - Public exports

// Streaming Games
export {
  getStreamingGameByUuid,
  getStreamingGames,
} from './get-streaming-games';

// Source Games (Survey 시스템)
export { getSourceGames } from './get-source-games';

// Builds
export { deleteBuild, type DeleteBuildInput } from './delete-build';
export { getBuilds } from './get-builds';
export { postBuildComplete } from './post-build-complete';
export { postCreateBuild } from './post-sts-credentials';
export {
  type FolderUploadOptions,
  putS3FolderUpload,
} from './put-s3-folder-upload';

// Temp: Game Creation (테스트용)
export {
  type CreateGameRequest,
  type CreateGameResponse,
  createTestGame,
  postCreateGame,
} from './post-create-game';
