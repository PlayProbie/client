/**
 * Virtual Highlight Mock API Handlers
 *
 * Phase 0: 업로드/InsightTag API Mock 핸들러
 *
 * 엔드포인트:
 * - POST /sessions/:sessionId/replay/presigned-url - Presigned URL 발급 (201)
 * - POST /sessions/:sessionId/replay/upload-complete - 업로드 완료 (200)
 * - POST /sessions/:sessionId/replay/logs - 입력 로그 업로드 (202)
 * - POST /sessions/:sessionId/replay/insights/:tagId/answer - 인사이트 답변 (200)
 * - GET /sessions/:sessionId/highlight/tags - InsightTag 조회
 */
import { delay, http, HttpResponse } from 'msw';

import type {
  ApiInputLogsUploadRequest,
  ApiInsightAnswerRequest,
  ApiInsightAnswerResponse,
  ApiInsightTag,
  ApiInsightTagsResponse,
  ApiPresignedUrlRequest,
  ApiPresignedUrlResponse,
  SegmentMeta,
} from '@/features/game-streaming-session/types';

import { MSW_API_BASE_URL } from '../../constants';

// ----------------------------------------
// Mock Data Store
// ----------------------------------------

/** 세션별 세그먼트 저장소 */
const mockSegments: Record<string, SegmentMeta[]> = {};

/** 세션별 InsightTag 저장소 */
const mockInsightTags: Record<string, ApiInsightTag[]> = {};

/** 세션별 로그 저장소 (테스트용) */
const mockInputLogs: Record<
  string,
  { segment_id: string; logs_count: number }[]
> = {};

/** 시퀀스 카운터 */
const segmentSequence: Record<string, number> = {};

// ----------------------------------------
// Helper Functions
// ----------------------------------------

/** UUID 생성 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** 분석 후 InsightTag 생성 (Mock 로직) */
function generateMockInsightTags(
  sessionId: string,
  segments: SegmentMeta[]
): ApiInsightTag[] {
  const tags: ApiInsightTag[] = [];

  // UPLOADED 상태인 세그먼트만 분석 대상
  const uploadedSegments = segments.filter(
    (s) => s.upload_status === 'UPLOADED'
  );

  if (uploadedSegments.length === 0) return tags;

  // Mock: 첫 번째 세그먼트에서 PANIC 태그 생성
  const firstSegment = uploadedSegments[0];
  if (firstSegment) {
    // 시간 단위: ms (밀리초 정수)
    const panicTime = firstSegment.start_media_time + 10000; // +10초
    tags.push({
      insight_tag_id: `tag_${generateUUID().slice(0, 8)}`,
      session_id: sessionId,
      tag_type: 'PANIC',
      score: 0.92,
      description: 'Space Bar 연타 감지 (6회/sec)',
      media_time_start: panicTime,
      media_time_end: panicTime + 10000, // +10초
      clips: [
        {
          segment_id: firstSegment.segment_id,
          offset_start: 10000, // 10초
          offset_end: 20000, // 20초
          video_url: `https://mock-s3.example.com/${sessionId}/${firstSegment.segment_id}.webm`,
        },
      ],
      playback_status: 'READY_CLOUD',
      created_at: new Date().toISOString(),
    });
  }

  // Mock: 두 번째 세그먼트에서 IDLE 태그 생성
  if (uploadedSegments.length >= 2) {
    const secondSegment = uploadedSegments[1];
    // 시간 단위: ms (밀리초 정수)
    const idleTime = secondSegment.start_media_time + 5000; // +5초
    tags.push({
      insight_tag_id: `tag_${generateUUID().slice(0, 8)}`,
      session_id: sessionId,
      tag_type: 'IDLE',
      score: 0.88,
      description: '15초 동안 입력 없음',
      media_time_start: idleTime,
      media_time_end: idleTime + 15000, // +15초
      clips: [
        {
          segment_id: secondSegment.segment_id,
          offset_start: 5000, // 5초
          offset_end: 20000, // 20초
          video_url: `https://mock-s3.example.com/${sessionId}/${secondSegment.segment_id}.webm`,
        },
      ],
      playback_status: 'READY_CLOUD',
      created_at: new Date().toISOString(),
    });
  }

  return tags;
}

// ----------------------------------------
// Handlers
// ----------------------------------------

export const highlightHandlers = [
  // Presigned URL 발급 (201 Created)
  http.post(
    `${MSW_API_BASE_URL}/sessions/:sessionId/replay/presigned-url`,
    async ({ params, request }) => {
      await delay(200);
      const sessionId = params.sessionId as string;
      const body = (await request.json()) as ApiPresignedUrlRequest;

      if (body.content_type == null) {
        return HttpResponse.json(
          { message: 'content_type은 필수입니다.', code: 'H001' },
          { status: 400 }
        );
      }

      // 시퀀스 카운터 초기화
      if (segmentSequence[sessionId] == null) {
        segmentSequence[sessionId] = 0;
      }

      // 세그먼트 ID 생성
      const segmentId = generateUUID();

      // Mock Presigned URL 생성
      const s3Url = `https://dev-playprobie-replay.s3.ap-northeast-2.amazonaws.com/replays/${sessionId}/${segmentId}?presigned=true&expires=${Date.now() + 300000}`;

      segmentSequence[sessionId]++;

      return HttpResponse.json(
        {
          result: {
            segment_id: segmentId,
            s3_url: s3Url,
            expires_in: 300,
          },
        } satisfies { result: ApiPresignedUrlResponse['result'] },
        { status: 201 }
      );
    }
  ),

  // 세그먼트 업로드 완료 알림 (200 OK, No Body)
  http.post(
    `${MSW_API_BASE_URL}/sessions/:sessionId/replay/upload-complete`,
    async ({ params, request }) => {
      await delay(300);
      const sessionId = params.sessionId as string;
      const body = (await request.json()) as { segment_id: string };

      const segmentId = body.segment_id;

      // 세션별 세그먼트 목록 초기화
      if (!mockSegments[sessionId]) {
        mockSegments[sessionId] = [];
      }

      // 세그먼트 메타 생성 (시간 정보는 mock 데이터)
      const existingCount = mockSegments[sessionId].length;
      const segmentMeta: SegmentMeta = {
        segment_id: segmentId,
        session_id: sessionId,
        start_media_time: existingCount * 30000,
        end_media_time: (existingCount + 1) * 30000,
        upload_status: 'UPLOADED',
        overlap_ms: 3000,
        created_at: new Date().toISOString(),
        uploaded_at: new Date().toISOString(),
      };

      mockSegments[sessionId].push(segmentMeta);

      // 업로드 완료 후 InsightTag 재생성 (Mock 분석)
      mockInsightTags[sessionId] = generateMockInsightTags(
        sessionId,
        mockSegments[sessionId]
      );

      return new HttpResponse(null, { status: 200 });
    }
  ),

  // 입력 로그 업로드 (202 Accepted, No Body)
  http.post(
    `${MSW_API_BASE_URL}/sessions/:sessionId/replay/logs`,
    async ({ params, request }) => {
      await delay(200);
      const sessionId = params.sessionId as string;
      const body = (await request.json()) as ApiInputLogsUploadRequest;

      if (!body.segment_id || !body.logs || body.logs.length === 0) {
        return HttpResponse.json(
          { message: 'segment_id와 logs는 필수입니다.', code: 'H002' },
          { status: 400 }
        );
      }

      // 로그 저장 (테스트용)
      if (!mockInputLogs[sessionId]) {
        mockInputLogs[sessionId] = [];
      }

      mockInputLogs[sessionId].push({
        segment_id: body.segment_id,
        logs_count: body.logs.length,
      });

      return new HttpResponse(null, { status: 202 });
    }
  ),

  // 인사이트 질문 답변 (200 OK)
  http.post(
    `${MSW_API_BASE_URL}/sessions/:sessionId/replay/insights/:tagId/answer`,
    async ({ params, request }) => {
      await delay(200);
      const tagId = parseInt(params.tagId as string, 10);
      const body = (await request.json()) as ApiInsightAnswerRequest;

      if (!body.answer_text) {
        return HttpResponse.json(
          { message: 'answer_text는 필수입니다.', code: 'H003' },
          { status: 400 }
        );
      }

      // Mock: 마지막 질문인지 랜덤으로 결정
      const isComplete = Math.random() > 0.5;

      return HttpResponse.json({
        result: {
          tag_id: tagId,
          is_complete: isComplete,
        },
      } satisfies { result: ApiInsightAnswerResponse['result'] });
    }
  ),

  // InsightTag 조회
  http.get(
    `${MSW_API_BASE_URL}/sessions/:sessionId/highlight/tags`,
    async ({ params }) => {
      await delay(300);
      const sessionId = params.sessionId as string;

      const tags = mockInsightTags[sessionId] || [];

      return HttpResponse.json({
        success: true,
        result: {
          tags,
          total_count: tags.length,
        },
      } satisfies {
        success: boolean;
        result: ApiInsightTagsResponse['result'];
      });
    }
  ),
];
