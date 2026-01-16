/**
 * 입력 로그 업로드 API
 * POST /sessions/{sessionId}/replay/logs
 * Response: 202 Accepted (No Body)
 */

import { API_BASE_URL } from '../constants';
import type { ApiInputLogsUploadRequest, InputLog } from '../types/highlight';

/**
 * 입력 로그를 서버에 업로드
 *
 * @param sessionId - 세션 ID
 * @param segmentId - 세그먼트 ID
 * @param videoUrl - 세그먼트 영상 URL
 * @param logs - 입력 로그 배열
 */
export async function postInputLogs(
  sessionId: string,
  segmentId: string,
  videoUrl: string,
  logs: InputLog[]
): Promise<void> {
  const requestBody: ApiInputLogsUploadRequest = {
    session_id: sessionId,
    segment_id: segmentId,
    video_url: videoUrl,
    logs,
  };

  const response = await fetch(
    `${API_BASE_URL}/sessions/${sessionId}/replay/logs`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || '입력 로그 업로드에 실패했습니다.');
  }
}
