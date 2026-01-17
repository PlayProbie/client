/**
 * GET /source-games - Source Game 목록 조회 (Survey 시스템)
 * 스트리밍 등록 가능한 게임 목록
 */
import { API_BASE_URL } from '@/constants/api';

import type { ApiSourceGame, SourceGame } from '../types';
import { toSourceGame } from '../types';

/** Source Game 목록 조회 */
export async function getSourceGames(): Promise<SourceGame[]> {
  const response = await fetch(`${API_BASE_URL}/source-games`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Source Game 목록을 불러오는데 실패했습니다.');
  }

  const data: ApiSourceGame[] = await response.json();
  return data.map(toSourceGame);
}
