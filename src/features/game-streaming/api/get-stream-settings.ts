/**
 * Stream Settings 조회 API
 * GET /streaming-games/{gameUuid}/stream-settings
 */
import { API_BASE_URL } from '../constants';
import type { ApiStreamSettings, StreamSettings } from '../types';
import { toStreamSettings } from '../types';
import { apiFetch } from '../utils';

/** 스트림 설정 조회 */
export async function getStreamSettings(
  gameUuid: string
): Promise<StreamSettings> {
  const data = await apiFetch<ApiStreamSettings>(
    `${API_BASE_URL}/streaming-games/${gameUuid}/stream-settings`,
    { method: 'GET' },
    '스트림 설정을 불러오는데 실패했습니다.'
  );
  return toStreamSettings(data);
}
