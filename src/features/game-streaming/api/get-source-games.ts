/**
 * GET /source-games - Source Game 목록 조회 (Survey 시스템)
 * 스트리밍 등록 가능한 게임 목록
 */
import { API_BASE_URL } from '@/constants/api';

import type { ApiSourceGame, SourceGame } from '../types';
import { toSourceGame } from '../types';
import { apiFetch } from '../utils';

/** Source Game 목록 조회 */
export async function getSourceGames(): Promise<SourceGame[]> {
  const data = await apiFetch<ApiSourceGame[]>(
    `${API_BASE_URL}/source-games`,
    { method: 'GET' },
    'Source Game 목록을 불러오는데 실패했습니다.'
  );
  return data.map(toSourceGame);
}
