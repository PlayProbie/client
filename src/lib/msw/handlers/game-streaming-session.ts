/**
 * Game Streaming Session MSW Handlers
 * Phase 4-5: 서비스 오픈 & Tester 스트리밍 API
 */
import { delay, http, HttpResponse } from 'msw';

/** Survey status for mock data */
type SurveyStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED';

import { MSW_API_BASE_URL } from '../../constants';
import { mswSessionStore } from './msw-session-store';

// ----------------------------------------
// Mock Data: Surveys (Phase 4-5 확장)
// ----------------------------------------
interface MockSurvey {
  survey_uuid: string;
  survey_name: string;
  status: SurveyStatus;
  game_name: string;
  stream_settings: {
    resolution: string;
    fps: number;
  };
  max_capacity: number;
  current_capacity: number;
}

const MOCK_SURVEYS: Record<string, MockSurvey> = {
  'survey-001-uuid': {
    survey_uuid: 'survey-001-uuid',
    survey_name: '알파 테스트 설문',
    status: 'ACTIVE',
    game_name: '테스트 RPG 게임',
    stream_settings: { resolution: '1080p', fps: 60 },
    max_capacity: 10,
    current_capacity: 0,
  },
  'survey-002-uuid': {
    survey_uuid: 'survey-002-uuid',
    survey_name: '베타 테스트 피드백',
    status: 'ACTIVE',
    game_name: 'My RPG Game',
    stream_settings: { resolution: '1080p', fps: 60 },
    max_capacity: 10,
    current_capacity: 5,
  },
  'survey-003-uuid': {
    survey_uuid: 'survey-003-uuid',
    survey_name: 'UX 개선 설문',
    status: 'CLOSED',
    game_name: 'Puzzle Adventure',
    stream_settings: { resolution: '720p', fps: 30 },
    max_capacity: 5,
    current_capacity: 0,
  },
};

// ----------------------------------------
// Mock Data: Active Sessions
// ----------------------------------------
interface MockSession {
  survey_session_uuid: string;
  survey_uuid: string;
  is_active: boolean;
  created_at: string;
}

const MOCK_SESSIONS: Record<string, MockSession> = {};

export const gameStreamingSessionHandlers = [
  // ----------------------------------------
  // Tester API: Session
  // ----------------------------------------

  // 세션 가용성 조회
  http.get(
    `${MSW_API_BASE_URL}/surveys/:surveyUuid/session`,
    async ({ params }) => {
      await delay(300);
      const surveyUuid = params.surveyUuid as string;

      const survey = MOCK_SURVEYS[surveyUuid];
      if (!survey) {
        return HttpResponse.json(
          { message: '설문을 찾을 수 없습니다.', code: 'S001' },
          { status: 404 }
        );
      }

      // ACTIVE 상태가 아니면 접속 불가
      const isAvailable =
        survey.status === 'ACTIVE' &&
        survey.current_capacity < survey.max_capacity;

      return HttpResponse.json({
        success: true,
        result: {
          survey_uuid: survey.survey_uuid,
          game_name: survey.game_name,
          is_available: isAvailable,
          stream_settings: survey.stream_settings,
        },
      });
    }
  ),

  // WebRTC 시그널 교환
  http.post(
    `${MSW_API_BASE_URL}/surveys/:surveyUuid/signal`,
    async ({ params, request }) => {
      await delay(500);
      const surveyUuid = params.surveyUuid as string;

      // Request Body 파싱 에러 방지
      let body: { signal_request: string } | null = null;
      try {
        body = (await request.json()) as { signal_request: string };
      } catch {
        return HttpResponse.json(
          { message: 'Invalid JSON body', code: 'T000' },
          { status: 400 }
        );
      }

      const survey = MOCK_SURVEYS[surveyUuid];
      if (!survey) {
        return HttpResponse.json(
          { message: '설문을 찾을 수 없습니다.', code: 'S001' },
          { status: 404 }
        );
      }

      if (survey.status !== 'ACTIVE') {
        return HttpResponse.json(
          { message: '리소스 미할당 또는 세션 불가', code: 'T002' },
          { status: 404 }
        );
      }

      if (!body?.signal_request) {
        return HttpResponse.json(
          { message: '잘못된 Signal Request입니다.', code: 'T001' },
          { status: 400 }
        );
      }

      // 용량 초과 체크
      if (survey.current_capacity >= survey.max_capacity) {
        return HttpResponse.json(
          { message: '현재 접속 가능한 세션이 꽉 찼습니다.', code: 'T004' },
          { status: 429 }
        );
      }

      // 공유 세션 스토어에서 세션 생성/조회 (survey-session과 동일한 ID 사용)
      const session = mswSessionStore.getOrCreateSession(surveyUuid);
      const sessionUuid = session.sessionUuid;

      MOCK_SESSIONS[sessionUuid] = {
        survey_session_uuid: sessionUuid,
        survey_uuid: surveyUuid,
        is_active: true,
        created_at: new Date().toISOString(),
      };

      survey.current_capacity++;

      // Mock signal response (Base64 인코딩된 것처럼)
      const mockSignalResponse = btoa(
        JSON.stringify({
          type: 'answer',
          sdp: 'mock-sdp-answer-string',
        })
      );

      return HttpResponse.json({
        success: true,
        result: {
          signal_response: mockSignalResponse,
          survey_session_uuid: sessionUuid,
          expires_in_seconds: 120,
        },
      });
    }
  ),

  // 세션 상태 조회 (Heartbeat)
  http.get(
    `${MSW_API_BASE_URL}/surveys/:surveyUuid/session/status`,
    async ({ params }) => {
      await delay(200);
      const surveyUuid = params.surveyUuid as string;

      // 해당 설문에 활성 세션이 있는지 찾기
      const activeSession = Object.values(MOCK_SESSIONS).find(
        (s) => s.survey_uuid === surveyUuid && s.is_active
      );

      if (!activeSession) {
        return HttpResponse.json(
          { message: '활성 세션이 없습니다.', code: 'T002' },
          { status: 404 }
        );
      }

      return HttpResponse.json({
        success: true,
        result: {
          is_active: activeSession.is_active,
          survey_session_uuid: activeSession.survey_session_uuid,
        },
      });
    }
  ),

  // 세션 종료
  http.post(
    `${MSW_API_BASE_URL}/surveys/:surveyUuid/session/terminate`,
    async ({ params, request }) => {
      await delay(300);
      const surveyUuid = params.surveyUuid as string;
      const body = (await request.json()) as {
        survey_session_uuid: string;
        reason?: string;
        /** true: 스트리밍만 종료, 세션은 IN_PROGRESS 유지 (인터뷰 진입 시) */
        proceed_to_interview?: boolean;
      };

      const session = MOCK_SESSIONS[body.survey_session_uuid];
      if (!session || session.survey_uuid !== surveyUuid) {
        return HttpResponse.json(
          { message: '세션을 찾을 수 없습니다.', code: 'T002' },
          { status: 404 }
        );
      }

      // proceed_to_interview가 true면 스트리밍만 종료, 세션은 활성 상태 유지
      if (body.proceed_to_interview) {
        // 세션은 IN_PROGRESS 상태로 유지 (인터뷰용)
        // 스트리밍(AWS)만 종료된 것으로 간주
        return HttpResponse.json({
          success: true,
          result: { success: true },
        });
      }

      // 기본 동작: 세션 완전 종료
      session.is_active = false;

      // capacity 감소
      const survey = MOCK_SURVEYS[surveyUuid];
      if (survey && survey.current_capacity > 0) {
        survey.current_capacity--;
      }

      return HttpResponse.json({
        success: true,
        result: { success: true },
      });
    }
  ),
];
