/**
 * DELETE /streaming-games/:gameUuid - 스트리밍 게임 등록 해제
 */
import { API_BASE_URL } from '@/constants/api';

import { apiFetch } from '../utils';

export interface UnregisterStreamingGameInput {
  gameUuid: string;
}

export async function unregisterStreamingGame(
  input: UnregisterStreamingGameInput
): Promise<void> {
  await apiFetch<void>(
    `${API_BASE_URL}/streaming-games/${input.gameUuid}`,
    { method: 'DELETE' },
    '스트리밍 게임 등록 해제에 실패했습니다.'
  );
}
