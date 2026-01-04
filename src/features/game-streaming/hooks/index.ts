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
  useAvailableSourceGamesQuery,
  useSourceGamesQuery,
} from './useSourceGamesQuery';
// [STASH] Screen E~F: Stream Settings, Schedule
// export {
//   scheduleKeys,
//   useScheduleMutation,
//   useScheduleQuery,
// } from './useSchedule';
// export {
//   streamSettingsKeys,
//   useStreamSettingsMutation,
//   useStreamSettingsQuery,
// } from './useStreamSettings';
export {
  useUnsavedChanges,
  type UseUnsavedChangesOptions,
} from './useUnsavedChanges';
export {
  type UploadParams,
  useUploadState,
  type UseUploadStateOptions,
} from './useUploadState';
