import { delay, http, HttpResponse } from 'msw';

import { MSW_API_BASE_URL } from '../constants';

const API_BASE_URL = MSW_API_BASE_URL;

const SURVEY_INFO: Record<
  string,
  { game_name: string; stream_settings: { resolution: string; fps: number } }
> = {
  'survey-001-uuid': {
    game_name: 'Dark Souls Clone',
    stream_settings: { resolution: '1080p', fps: 60 },
  },
  'survey-002-uuid': {
    game_name: 'Racing Simulator Pro',
    stream_settings: { resolution: '1080p', fps: 60 },
  },
  'survey-003-uuid': {
    game_name: 'Puzzle Adventure',
    stream_settings: { resolution: '720p', fps: 30 },
  },
};

const ACTIVE_SESSIONS = new Map<string, string>();

export const gameStreamingTesterHandlers = [
  // ----------------------------------------
  // Session Availability
  // ----------------------------------------
  http.get(`${API_BASE_URL}/surveys/:surveyUuid/session`, async ({ params }) => {
    await delay(300);
    const surveyUuid = params.surveyUuid as string;

    const info = SURVEY_INFO[surveyUuid] ?? {
      game_name: 'Streaming Test Game',
      stream_settings: { resolution: '1080p', fps: 60 },
    };

    return HttpResponse.json({
      result: {
        survey_uuid: surveyUuid,
        game_name: info.game_name,
        is_available: !ACTIVE_SESSIONS.has(surveyUuid),
        stream_settings: info.stream_settings,
      },
    });
  }),

  // ----------------------------------------
  // Signal
  // ----------------------------------------
  http.post(`${API_BASE_URL}/surveys/:surveyUuid/signal`, async ({ params }) => {
    await delay(300);
    const surveyUuid = params.surveyUuid as string;

    if (ACTIVE_SESSIONS.has(surveyUuid)) {
      return HttpResponse.json(
        {
          message: '현재 접속 가능한 세션이 꽉 찼습니다.',
          code: 'T004',
        },
        { status: 429 }
      );
    }

    const surveySessionUuid = `session-${crypto.randomUUID()}`;
    ACTIVE_SESSIONS.set(surveyUuid, surveySessionUuid);

    return HttpResponse.json({
      result: {
        signal_response: btoa('mock-answer'),
        survey_session_uuid: surveySessionUuid,
        expires_in_seconds: 120,
      },
    });
  }),

  // ----------------------------------------
  // Session Status
  // ----------------------------------------
  http.get(
    `${API_BASE_URL}/surveys/:surveyUuid/session/status`,
    async ({ params }) => {
      await delay(200);
      const surveyUuid = params.surveyUuid as string;
      const surveySessionUuid = ACTIVE_SESSIONS.get(surveyUuid) ?? '';

      return HttpResponse.json({
        result: {
          is_active: Boolean(surveySessionUuid),
          survey_session_uuid: surveySessionUuid,
        },
      });
    }
  ),

  // ----------------------------------------
  // Terminate
  // ----------------------------------------
  http.post(
    `${API_BASE_URL}/surveys/:surveyUuid/session/terminate`,
    async ({ params, request }) => {
      await delay(300);
      const surveyUuid = params.surveyUuid as string;
      const body = (await request.json()) as {
        survey_session_uuid: string;
      };

      const storedSessionUuid = ACTIVE_SESSIONS.get(surveyUuid);
      if (!storedSessionUuid || storedSessionUuid !== body.survey_session_uuid) {
        return HttpResponse.json(
          {
            message: '세션을 찾을 수 없습니다.',
            code: 'T002',
          },
          { status: 404 }
        );
      }

      ACTIVE_SESSIONS.delete(surveyUuid);

      return HttpResponse.json({
        result: {
          success: true,
        },
      });
    }
  ),
];
