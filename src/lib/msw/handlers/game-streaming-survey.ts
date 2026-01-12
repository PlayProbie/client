/**
 * Game Streaming Survey MSW Handlers
 * Phase 2: 설문 & 리소스 할당 (JIT Provisioning)
 */
import { delay, http, HttpResponse } from 'msw';

import type {
  ApiCreateStreamingResourceRequest,
  ApiSurvey,
} from '@/features/game-streaming-survey/types';
import { StreamingResourceStatus } from '@/features/game-streaming-survey/types';

import {
  MOCK_STREAMING_RESOURCES,
  type MockStreamingResource,
} from './streaming-resource-store';

// 프로비저닝 상태 시뮬레이션 설정
const PROVISIONING_START_TIMES: Record<string, number> = {};
const DELAY_PROVISIONING = 5000; // 5초 후 PROVISIONING
const DELAY_READY = 10000; // 10초 후 READY
const DELAY_ACTIVE = 15000; // 15초 후 ACTIVE

const API_BASE_URL = '/api';

// ----------------------------------------
// Mock Data: Surveys
// ----------------------------------------
const MOCK_SURVEYS: ApiSurvey[] = [
  {
    survey_uuid: 'survey-001-uuid',
    survey_name: '알파 테스트 설문',
    status: 'DRAFT',
    created_at: '2025-12-20T10:00:00Z',
  },
  {
    survey_uuid: 'survey-002-uuid',
    survey_name: '베타 테스트 피드백',
    status: 'ACTIVE',
    created_at: '2025-12-18T14:00:00Z',
  },
  {
    survey_uuid: 'survey-003-uuid',
    survey_name: 'UX 개선 설문',
    status: 'CLOSED',
    created_at: '2025-12-15T09:00:00Z',
  },
];

const SURVEY_GAME_MAP: Record<string, string> = {
  'survey-001-uuid': 'game-001-uuid-abcd',
  'survey-002-uuid': 'game-001-uuid-abcd',
  'survey-003-uuid': 'game-002-uuid-efgh',
};

let resourceIdCounter = 100;

export const gameStreamingSurveyHandlers = [
  // ----------------------------------------
  // Surveys API
  // ----------------------------------------

  // 설문 목록 조회
  http.get(`${API_BASE_URL}/surveys`, async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const gameUuidParam = url.searchParams.get('game_uuid');

    const surveys = [...MOCK_SURVEYS];

    if (gameUuidParam) {
      const filtered = surveys.filter(
        (survey) => SURVEY_GAME_MAP[survey.survey_uuid] === gameUuidParam
      );
      return HttpResponse.json({ result: filtered });
    }

    return HttpResponse.json({ result: surveys });
  }),

  // 설문 단건 조회
  http.get(`${API_BASE_URL}/surveys/:surveyUuid`, async ({ params }) => {
    await delay(300);
    const surveyUuid = params.surveyUuid as string;

    const survey = MOCK_SURVEYS.find((s) => s.survey_uuid === surveyUuid);
    if (!survey) {
      return HttpResponse.json(
        { message: '설문을 찾을 수 없습니다.', code: 'S001' },
        { status: 404 }
      );
    }

    return HttpResponse.json({ result: survey });
  }),

  // 게임 종속 설문 목록
  http.get(`${API_BASE_URL}/games/:gameUuid/surveys`, async ({ params }) => {
    await delay(350);
    const gameUuid = params.gameUuid as string;
    const filtered = MOCK_SURVEYS.filter(
      (survey) => SURVEY_GAME_MAP[survey.survey_uuid] === gameUuid
    );
    return HttpResponse.json({ result: filtered });
  }),

  // ----------------------------------------
  // Streaming Resource API
  // ----------------------------------------

  // 스트리밍 리소스 조회 (폴링 시뮬레이션: CREATING -> PROVISIONING -> READY -> ACTIVE)
  http.get(
    `${API_BASE_URL}/surveys/:surveyUuid/streaming-resource`,
    async ({ params }) => {
      await delay(300);
      const surveyUuid = params.surveyUuid as string;

      const resource = MOCK_STREAMING_RESOURCES[surveyUuid];

      if (!resource) {
        return HttpResponse.json(
          {
            message: '스트리밍 리소스가 연결되어 있지 않습니다.',
            code: 'SR002',
          },
          { status: 404 }
        );
      }

      // 상태 시뮬레이션
      if (
        resource.status === StreamingResourceStatus.CREATING ||
        resource.status === StreamingResourceStatus.PROVISIONING ||
        resource.status === StreamingResourceStatus.READY
      ) {
        const startTime = PROVISIONING_START_TIMES[surveyUuid];
        if (startTime) {
          const elapsed = Date.now() - startTime;

          if (elapsed >= DELAY_ACTIVE) {
            resource.status = StreamingResourceStatus.ACTIVE;
            delete PROVISIONING_START_TIMES[surveyUuid];
          } else if (elapsed >= DELAY_READY) {
            resource.status = StreamingResourceStatus.READY;
          } else if (elapsed >= DELAY_PROVISIONING) {
            resource.status = StreamingResourceStatus.PROVISIONING;
          }
        }
      }

      return HttpResponse.json({ result: resource });
    }
  ),

  // 스트리밍 리소스 생성 (빌드 연결)
  http.post(
    `${API_BASE_URL}/surveys/:surveyUuid/streaming-resource`,
    async ({ params, request }) => {
      await delay(500);
      const surveyUuid = params.surveyUuid as string;
      const body = (await request.json()) as ApiCreateStreamingResourceRequest;

      // 이미 연결된 경우
      if (MOCK_STREAMING_RESOURCES[surveyUuid]) {
        return HttpResponse.json(
          {
            message: '이미 스트리밍 리소스가 연결되어 있습니다.',
            code: 'SR001',
          },
          { status: 409 }
        );
      }

      // 설문 존재 확인
      const survey = MOCK_SURVEYS.find((s) => s.survey_uuid === surveyUuid);
      if (!survey) {
        return HttpResponse.json(
          { message: '설문을 찾을 수 없습니다.', code: 'S001' },
          { status: 404 }
        );
      }

      // 초기 리소스 생성
      resourceIdCounter++;
      const newResource: MockStreamingResource = {
        uuid: `resource-${resourceIdCounter}-uuid`,
        status: StreamingResourceStatus.CREATING, // Start with CREATING
        current_capacity: 0,
        max_capacity: body.max_capacity,
        instance_type: body.instance_type,
        created_at: new Date().toISOString(),
      };

      MOCK_STREAMING_RESOURCES[surveyUuid] = newResource;
      // 프로비저닝 시작 시간 기록
      PROVISIONING_START_TIMES[surveyUuid] = Date.now();

      return HttpResponse.json({ result: newResource }, { status: 201 });
    }
  ),

  // 스트리밍 리소스 삭제 (연결 해제)
  http.delete(
    `${API_BASE_URL}/surveys/:surveyUuid/streaming-resource`,
    async ({ params }) => {
      await delay(300);
      const surveyUuid = params.surveyUuid as string;

      if (!MOCK_STREAMING_RESOURCES[surveyUuid]) {
        return HttpResponse.json(
          {
            message: '스트리밍 리소스가 연결되어 있지 않습니다.',
            code: 'SR002',
          },
          { status: 404 }
        );
      }

      delete MOCK_STREAMING_RESOURCES[surveyUuid];
      delete PROVISIONING_START_TIMES[surveyUuid];

      return new HttpResponse(null, { status: 204 });
    }
  ),

  // ----------------------------------------
  // Phase 4-5: 설문 상태 업데이트 API
  // ----------------------------------------

  // 설문 상태 업데이트 (ACTIVE/CLOSED)
  http.patch(
    `${API_BASE_URL}/surveys/:surveyUuid/status`,
    async ({ params, request }) => {
      await delay(500);
      const surveyUuid = params.surveyUuid as string;
      const body = (await request.json()) as { status: 'ACTIVE' | 'CLOSED' };

      const survey = MOCK_SURVEYS.find((s) => s.survey_uuid === surveyUuid);
      if (!survey) {
        return HttpResponse.json(
          { message: '설문을 찾을 수 없습니다.', code: 'S001' },
          { status: 404 }
        );
      }

      survey.status = body.status;
      const resource = MOCK_STREAMING_RESOURCES[surveyUuid];

      if (body.status === 'ACTIVE') {
        // 이미 ACTIVE 상태라면 그대로 유지
        if (resource && resource.status === StreamingResourceStatus.ACTIVE) {
          return HttpResponse.json({
            result: {
              survey_uuid: survey.survey_uuid,
              status: survey.status,
              streaming_resource: {
                status: resource.status,
                current_capacity: resource.current_capacity,
              },
            },
          });
        }

        // 확장 중 시뮬레이션 (기존 로직 유지)
        return HttpResponse.json({
          result: {
            survey_uuid: survey.survey_uuid,
            status: survey.status,
            streaming_resource: resource
              ? {
                  status: StreamingResourceStatus.SCALING,
                  current_capacity: resource.current_capacity,
                  message: '서버 확장 중입니다.',
                }
              : undefined,
          },
        });
      }

      // CLOSED
      return HttpResponse.json({
        result: {
          survey_uuid: survey.survey_uuid,
          status: survey.status,
        },
      });
    }
  ),
];
