/**
 * Build Delete API
 * DELETE /games/{gameUuid}/builds/{buildUuid}
 *
 * Spring GameBuildApi.deleteBuild 연동
 */
import { API_BASE_URL } from '@/constants/api';

import { apiFetch } from '../utils';

export interface DeleteBuildInput {
  gameUuid: string;
  buildUuid: string;
}

/** 빌드 삭제 */
export async function deleteBuild(input: DeleteBuildInput): Promise<void> {
  await apiFetch<void>(
    `${API_BASE_URL}/games/${input.gameUuid}/builds/${input.buildUuid}`,
    { method: 'DELETE' },
    '빌드 삭제에 실패했습니다.'
  );
}
