/**
 * Version API
 * - GET /games/{gameUuid}/versions
 * - GET /versions/{versionUuid}
 * - POST /games/{gameUuid}/versions
 */
import { API_BASE_URL } from '@/constants/api';

import type {
  ApiVersionResponse,
  ApiVersionsResponse,
  CreateVersionRequest,
  Version,
} from '../types';
import { toApiCreateVersionRequest, toVersion } from '../types';

// ----------------------------------------
// API Functions
// ----------------------------------------

/**
 * 게임별 버전 목록 조회
 * GET /games/{gameUuid}/versions
 */
export async function getVersions(gameUuid: string): Promise<Version[]> {
  const response = await fetch(`${API_BASE_URL}/games/${gameUuid}/versions`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('게임을 찾을 수 없습니다.');
    }
    throw new Error('버전 목록을 불러오는데 실패했습니다.');
  }

  const data: ApiVersionsResponse = await response.json();
  return data.result.map(toVersion);
}

/**
 * 버전 상세 조회
 * GET /versions/{versionUuid}
 */
export async function getVersion(versionUuid: string): Promise<Version | null> {
  const response = await fetch(`${API_BASE_URL}/versions/${versionUuid}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error('버전 정보를 불러오는데 실패했습니다.');
  }

  const data: ApiVersionResponse = await response.json();
  return toVersion(data.result);
}

/**
 * 버전 생성
 * POST /games/{gameUuid}/versions
 */
export async function createVersion(
  gameUuid: string,
  req: CreateVersionRequest
): Promise<Version> {
  const body = toApiCreateVersionRequest(req);

  const response = await fetch(`${API_BASE_URL}/games/${gameUuid}/versions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error('유효하지 않은 요청입니다.');
    }
    if (response.status === 404) {
      throw new Error('게임을 찾을 수 없습니다.');
    }
    throw new Error('버전 생성에 실패했습니다.');
  }

  const data: ApiVersionResponse = await response.json();
  return toVersion(data.result);
}

// Legacy export for compatibility (can be removed later)
export { createVersion as createVersionMock };

