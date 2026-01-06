/**
 * Stream Settings 조회 (localStorage)
 * API가 없으므로 로컬 스토어에서 읽어옵니다.
 */
import { STORAGE_KEYS } from '../constants';
import type { StreamSettings } from '../types';
import { getStoredData } from '../utils';

const DEFAULT_STREAM_SETTINGS: StreamSettings = {
  gpuProfile: 'entry',
  resolutionFps: '720p30',
  os: 'Windows Server 2022',
  region: 'ap-northeast-1',
  maxSessions: 0,
};

/** 스트림 설정 조회 */
export async function getStreamSettings(
  gameUuid: string
): Promise<StreamSettings> {
  const key = `${STORAGE_KEYS.STREAM_SETTINGS}${gameUuid}`;
  return getStoredData(key, DEFAULT_STREAM_SETTINGS);
}
