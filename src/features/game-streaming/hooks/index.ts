// Game Streaming Hooks - Public exports

export { buildKeys, useBuildsQuery } from './useBuildsQuery';
export {
  sourceGameKeys,
  useCreateGameMutation,
  useDeleteGameMutation,
  useRegisterStreamingGameMutation,
  useUnregisterStreamingGameMutation,
} from './useGameMutations';
export { gameKeys, useGameDetailQuery, useGamesQuery } from './useGamesQuery';
export {
  scheduleKeys,
  useScheduleMutation,
  useScheduleQuery,
} from './useSchedule';
export {
  useAvailableSourceGamesQuery,
  useSourceGamesQuery,
} from './useSourceGamesQuery';
export {
  streamSettingsKeys,
  useStreamSettingsMutation,
  useStreamSettingsQuery,
} from './useStreamSettings';
export {
  useUnsavedChanges,
  type UseUnsavedChangesOptions,
} from './useUnsavedChanges';
export {
  type UploadParams,
  useUploadState,
  type UseUploadStateOptions,
} from './useUploadState';
