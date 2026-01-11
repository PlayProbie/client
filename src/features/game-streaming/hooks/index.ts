// Game Streaming Hooks - Public exports

export { useBuildDeleteMutation } from './useBuildMutations';
export { buildKeys, useBuildsQuery } from './useBuildsQuery';
export { gameKeys, useGameDetailQuery, useGamesQuery } from './useGamesQuery';
export {
  useAvailableSourceGamesQuery,
  useSourceGamesQuery,
} from './useSourceGamesQuery';
export {
  useUnsavedChanges,
  type UseUnsavedChangesOptions,
} from './useUnsavedChanges';
