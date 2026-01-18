/**
 * 세그먼트 업로드 완료 알림 API
 * POST /sessions/{sessionId}/replay/upload-complete
 */

import { API_BASE_URL } from '../constants';
import type { ApiSegmentUploadCompleteRequest } from '../types';

export async function postUploadComplete(
  sessionId: string,
  segmentId: string
): Promise<void> {
  const requestBody: ApiSegmentUploadCompleteRequest = {
    segment_id: segmentId,
  };

  const response = await fetch(
    `${API_BASE_URL}/sessions/${sessionId}/replay/upload-complete`,
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
    throw new Error(
      errorData?.message || '세그먼트 업로드 완료 알림에 실패했습니다.'
    );
  }
}
