/**
 * 인사이트 질문 답변 API
 * POST /sessions/{sessionId}/replay/insights/{tagId}/answer
 */

import { API_BASE_URL } from '@/constants/api';

/** [API] 인사이트 답변 요청 */
export interface ApiInsightAnswerRequest {
  answer_text: string;
}

/** [API] 인사이트 답변 응답 */
export interface ApiInsightAnswerResponse {
  result: {
    tag_id: number;
    is_complete: boolean;
  };
}

/** [Client] 인사이트 답변 요청 파라미터 */
export interface PostInsightAnswerParams {
  sessionUuid: string;
  tagId: number;
}

/** [Client] 인사이트 답변 요청 바디 */
export interface PostInsightAnswerRequest {
  answerText: string;
}

/** [Client] 인사이트 답변 응답 */
export interface InsightAnswerResult {
  tagId: number;
  isComplete: boolean;
}

/**
 * 인사이트 질문에 대한 답변 전송
 */
export async function postInsightAnswer(
  { sessionUuid, tagId }: PostInsightAnswerParams,
  body: PostInsightAnswerRequest
): Promise<InsightAnswerResult> {
  const url = `${API_BASE_URL}/sessions/${sessionUuid}/replay/insights/${tagId}/answer`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      answer_text: body.answerText,
    } satisfies ApiInsightAnswerRequest),
  });

  if (!response.ok) {
    throw new Error('Failed to send insight answer');
  }

  const data: ApiInsightAnswerResponse = await response.json();

  return {
    tagId: data.result.tag_id,
    isComplete: data.result.is_complete,
  };
}
