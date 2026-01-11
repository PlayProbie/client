/**
 * Build Delete API
 * DELETE /games/{gameUuid}/builds/{buildUuid}
 *
 * Spring GameBuildApi.deleteBuild 연동
 */
import { API_BASE_URL } from '@/constants/api';

export interface DeleteBuildInput {
  gameUuid: string;
  buildUuid: string;
}

/** 빌드 삭제 */
export async function deleteBuild(input: DeleteBuildInput): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/games/${input.gameUuid}/builds/${input.buildUuid}`,
    { method: 'DELETE' }
  );

  if (!response.ok) {
    throw new Error('빌드 삭제에 실패했습니다.');
  }
}
