/**
 * Builds 목록 API
 * GET /games/{gameUuid}/builds
 */
import type { ApiBuild, Build } from '../types';
import { toBuild } from '../types';
import { apiFetch } from '../utils';

/** 빌드 목록 조회 */
export async function getBuilds(gameUuid: string): Promise<Build[]> {
  const data = await apiFetch<ApiBuild[]>(
    `/api/games/${gameUuid}/builds`,
    { method: 'GET' },
    '빌드 목록을 불러오는데 실패했습니다.'
  );
  return data.map(toBuild);
}
