/**
 * 빌드 생성 API
 * POST /games/{gameUuid}/builds
 *
 * Spring GameBuildApi.createBuild 연동
 */
import { API_BASE_URL } from '../constants';
import type {
  ApiCreateBuildRequest,
  ApiCreateBuildResponse,
  CreateBuildResponse,
} from '../types';
import { toCreateBuildResponse } from '../types';

/** 빌드 생성 및 STS 임시 자격 증명 발급 요청 */
export async function postCreateBuild(
  gameUuid: string,
  request: ApiCreateBuildRequest
): Promise<CreateBuildResponse> {
  const response = await fetch(`${API_BASE_URL}/games/${gameUuid}/builds`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || '빌드 생성에 실패했습니다.');
  }

  const data: ApiCreateBuildResponse = await response.json();
  return toCreateBuildResponse(data);
}
