/**
 * Builds 목록 API
 * GET /games/{gameUuid}/builds
 */
import { API_BASE_URL } from '@/constants/api';

import type { ApiBuild, Build } from '../types';
import { toBuild } from '../types';
import { apiFetch } from '../utils';

/** API 응답 타입 (result 래퍼 포함) */
interface GetBuildsResponse {
  result: ApiBuild[];
}

/** 빌드 목록 조회 */
export async function getBuilds(gameUuid: string): Promise<Build[]> {
  const data = await apiFetch<GetBuildsResponse>(
    `${API_BASE_URL}/games/${gameUuid}/builds`,
    { method: 'GET' },
    '빌드 목록을 불러오는데 실패했습니다.'
  );
  return data.result.map(toBuild);
}
