/**
 * 입력 로그 업로드 API
 * POST /sessions/{sessionId}/highlight/logs
 */

import { API_BASE_URL } from '../constants';
import type {
  ApiInputLogsUploadRequest,
  ApiInputLogsUploadResponse,
  InputLog,
} from '../types/highlight';

/** 입력 로그 업로드 응답 */
export interface UploadInputLogsResult {
  success: boolean;
  logsCount: number;
}

/**
 * 입력 로그를 서버에 업로드
 *
 * @param sessionId - 세션 ID
 * @param segmentId - 세그먼트 ID
 * @param logs - 입력 로그 배열
 * @returns 업로드 결과
 */
export async function postInputLogs(
  sessionId: string,
  segmentId: string,
  logs: InputLog[]
): Promise<UploadInputLogsResult> {
  const requestBody: ApiInputLogsUploadRequest = {
    session_id: sessionId,
    segment_id: segmentId,
    logs,
  };

  const response = await fetch(
    `${API_BASE_URL}/sessions/${sessionId}/highlight/logs`,
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

  const data = (await response.json()) as {
    success: boolean;
    result: ApiInputLogsUploadResponse['result'];
  };

  return {
    success: data.result.success,
    logsCount: data.result.logs_count,
  };
}
