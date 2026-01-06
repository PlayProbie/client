/**
 * Stream Settings 저장 (localStorage)
 * API가 없으므로 로컬 스토어에 저장합니다.
 */
import { STORAGE_KEYS } from '../constants';
import type { StreamSettings } from '../types';
import { setStoredData } from '../utils';

/** 스트림 설정 저장 */
export async function putStreamSettings(
  gameUuid: string,
  settings: StreamSettings
): Promise<StreamSettings> {
  const key = `${STORAGE_KEYS.STREAM_SETTINGS}${gameUuid}`;
  setStoredData(key, settings);
  return settings;
}
