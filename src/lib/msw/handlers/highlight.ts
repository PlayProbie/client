/**
 * Virtual Highlight Mock API Handlers
 *
 * Phase 0: 업로드/InsightTag API Mock 핸들러
 *
 * 엔드포인트:
 * - POST /sessions/:sessionId/highlight/presigned-url - Presigned URL 발급
 * - POST /sessions/:sessionId/highlight/segments/:segmentId/complete - 세그먼트 업로드 완료
 * - POST /sessions/:sessionId/highlight/logs - 입력 로그 업로드
 * - GET /sessions/:sessionId/highlight/tags - InsightTag 조회
 */
import { delay, http, HttpResponse } from 'msw';

import type {
  ApiInputLogsUploadRequest,
  ApiInputLogsUploadResponse,
  ApiInsightTag,
  ApiInsightTagsResponse,
  ApiPresignedUrlRequest,
  ApiPresignedUrlResponse,
  ApiSegmentUploadCompleteRequest,
  ApiSegmentUploadCompleteResponse,
  SegmentMeta,
} from '@/features/game-streaming-session/types/highlight';

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
  // Presigned URL 발급
  http.post(
    `${MSW_API_BASE_URL}/sessions/:sessionId/highlight/presigned-url`,
    async ({ params, request }) => {
      await delay(200);
      const sessionId = params.sessionId as string;
      const body = (await request.json()) as ApiPresignedUrlRequest;

      if (!body.segment_id || !body.content_type) {
        return HttpResponse.json(
          { message: 'segment_id와 content_type은 필수입니다.', code: 'H001' },
          { status: 400 }
        );
      }

      // Mock Presigned URL 생성
      const presignedUrl = `https://mock-s3.example.com/${sessionId}/${body.segment_id}?presigned=true&expires=${Date.now() + 3600000}`;

      return HttpResponse.json({
        success: true,
        result: {
          upload_url: presignedUrl,
          expires_in_seconds: 3600,
        },
      } satisfies {
        success: boolean;
        result: ApiPresignedUrlResponse['result'];
      });
    }
  ),

  // 세그먼트 업로드 완료 알림
  http.post(
    `${MSW_API_BASE_URL}/sessions/:sessionId/highlight/segments/:segmentId/complete`,
    async ({ params, request }) => {
      await delay(300);
      const sessionId = params.sessionId as string;
      const segmentId = params.segmentId as string;
      const body = (await request.json()) as ApiSegmentUploadCompleteRequest;

      // 세션별 세그먼트 목록 초기화
      if (!mockSegments[sessionId]) {
        mockSegments[sessionId] = [];
      }

      // 기존 세그먼트 찾기
      const existingIndex = mockSegments[sessionId].findIndex(
        (s) => s.segment_id === segmentId
      );

      const segmentMeta: SegmentMeta = {
        segment_id: segmentId,
        session_id: sessionId,
        start_media_time: body.start_media_time,
        end_media_time: body.end_media_time,
        upload_status: 'UPLOADED',
        overlap_ms: 3000, // 3초 = 3000ms
        file_size: body.file_size,
        created_at: new Date().toISOString(),
        uploaded_at: new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        mockSegments[sessionId][existingIndex] = segmentMeta;
      } else {
        mockSegments[sessionId].push(segmentMeta);
      }

      // 업로드 완료 후 InsightTag 재생성 (Mock 분석)
      mockInsightTags[sessionId] = generateMockInsightTags(
        sessionId,
        mockSegments[sessionId]
      );

      return HttpResponse.json({
        success: true,
        result: {
          success: true,
          segment_id: segmentId,
        },
      } satisfies {
        success: boolean;
        result: ApiSegmentUploadCompleteResponse['result'];
      });
    }
  ),

  // 입력 로그 업로드
  http.post(
    `${MSW_API_BASE_URL}/sessions/:sessionId/highlight/logs`,
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

      return HttpResponse.json({
        success: true,
        result: {
          success: true,
          logs_count: body.logs.length,
        },
      } satisfies {
        success: boolean;
        result: ApiInputLogsUploadResponse['result'];
      });
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
