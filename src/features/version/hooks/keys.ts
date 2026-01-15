/** Version Query Keys */
export const versionKeys = {
  all: ['versions'] as const,
  byGame: (gameUuid: string) => [...versionKeys.all, 'game', gameUuid] as const,
  detail: (versionUuid: string) =>
    [...versionKeys.all, 'detail', versionUuid] as const,
  surveys: (versionUuid: string) =>
    [...versionKeys.all, 'surveys', versionUuid] as const,
};
