// Game Streaming Hooks - Public exports

export { useBuildDeleteMutation } from './useBuildMutations';
export { buildKeys, useBuildsQuery } from './useBuildsQuery';
export {
  sourceGameKeys,
  useRegisterStreamingGameMutation,
  useUnregisterStreamingGameMutation,
} from './useGameMutations';
export { gameKeys, useGameDetailQuery, useGamesQuery } from './useGamesQuery';
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
