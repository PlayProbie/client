/**
 * Stream Settings 저장 API
 * PUT /streaming-games/{gameUuid}/stream-settings
 */
import type { ApiStreamSettings, StreamSettings } from '../types';
import { toApiStreamSettings, toStreamSettings } from '../types';
import { apiFetch } from '../utils';

/** 스트림 설정 저장 */
export async function putStreamSettings(
  gameUuid: string,
  settings: StreamSettings
): Promise<StreamSettings> {
  const apiSettings = toApiStreamSettings(settings);
  const data = await apiFetch<ApiStreamSettings, ApiStreamSettings>(
    `/api/streaming-games/${gameUuid}/stream-settings`,
    { method: 'PUT', body: apiSettings },
    '스트림 설정 저장에 실패했습니다.'
  );
  return toStreamSettings(data);
}
