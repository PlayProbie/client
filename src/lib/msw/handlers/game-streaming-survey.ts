/**
 * Game Streaming Survey MSW Handlers
 * Phase 2: 설문 & 리소스 할당 (JIT Provisioning)
 */
import { delay, http, HttpResponse } from 'msw';

import type {
  ApiCreateStreamingResourceRequest,
  ApiSurvey,
} from '@/features/game-streaming-survey/types';

import {
  MOCK_STREAMING_RESOURCES,
  type MockStreamingResource,
} from './streaming-resource-store';

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

    // game_uuid 필터링 (실제 구현에서는 DB 조인)
    if (gameUuidParam) {
      // Mock에서는 필터링 로직 생략 (모든 설문 반환)
    }

    return HttpResponse.json({ result: surveys });
  }),

  // ----------------------------------------
  // Streaming Resource API
  // ----------------------------------------

  // 스트리밍 리소스 조회
  http.get(
    `${API_BASE_URL}/surveys/:surveyId/streaming-resource`,
    async ({ params }) => {
      await delay(300);
      const surveyId = params.surveyId as string;

      const resource = MOCK_STREAMING_RESOURCES[surveyId];

      if (!resource) {
        return HttpResponse.json(
          {
            message: '스트리밍 리소스가 연결되어 있지 않습니다.',
            code: 'SR002',
          },
          { status: 404 }
        );
      }

      return HttpResponse.json({ result: resource });
    }
  ),

  // 스트리밍 리소스 생성 (빌드 연결)
  http.post(
    `${API_BASE_URL}/surveys/:surveyId/streaming-resource`,
    async ({ params, request }) => {
      await delay(500);
      const surveyId = params.surveyId as string;
      const body = (await request.json()) as ApiCreateStreamingResourceRequest;

      // 이미 연결된 경우
      if (MOCK_STREAMING_RESOURCES[surveyId]) {
        return HttpResponse.json(
          {
            message: '이미 스트리밍 리소스가 연결되어 있습니다.',
            code: 'SR001',
          },
          { status: 409 }
        );
      }

      // 설문 존재 확인
      const survey = MOCK_SURVEYS.find((s) => s.survey_uuid === surveyId);
      if (!survey) {
        return HttpResponse.json(
          { message: '설문을 찾을 수 없습니다.', code: 'S001' },
          { status: 404 }
        );
      }

      resourceIdCounter++;
      const newResource: MockStreamingResource = {
        uuid: `resource-${resourceIdCounter}-uuid`,
        status: 'PROVISIONING',
        current_capacity: 0,
        max_capacity: body.max_capacity,
        instance_type: body.instance_type,
        build_uuid: body.build_uuid,
        created_at: new Date().toISOString(),
      };

      MOCK_STREAMING_RESOURCES[surveyId] = newResource;

      // 3초 후 READY 상태로 변경 (비동기 시뮬레이션)
      setTimeout(() => {
        if (MOCK_STREAMING_RESOURCES[surveyId]) {
          MOCK_STREAMING_RESOURCES[surveyId].status = 'READY';
        }
      }, 3000);

      return HttpResponse.json({ result: newResource }, { status: 201 });
    }
  ),

  // 스트리밍 리소스 삭제 (연결 해제)
  http.delete(
    `${API_BASE_URL}/surveys/:surveyId/streaming-resource`,
    async ({ params }) => {
      await delay(300);
      const surveyId = params.surveyId as string;

      if (!MOCK_STREAMING_RESOURCES[surveyId]) {
        return HttpResponse.json(
          {
            message: '스트리밍 리소스가 연결되어 있지 않습니다.',
            code: 'SR002',
          },
          { status: 404 }
        );
      }

      delete MOCK_STREAMING_RESOURCES[surveyId];

      return new HttpResponse(null, { status: 204 });
    }
  ),

  // ----------------------------------------
  // Phase 4-5: 설문 상태 업데이트 API
  // ----------------------------------------

  // 설문 상태 업데이트 (ACTIVE/CLOSED)
  http.patch(
    `${API_BASE_URL}/surveys/:surveyId/status`,
    async ({ params, request }) => {
      await delay(500);
      const surveyId = params.surveyId as string;
      const body = (await request.json()) as { status: 'ACTIVE' | 'CLOSED' };

      const survey = MOCK_SURVEYS.find((s) => s.survey_uuid === surveyId);
      if (!survey) {
        return HttpResponse.json(
          { message: '설문을 찾을 수 없습니다.', code: 'S001' },
          { status: 404 }
        );
      }

      survey.status = body.status;
      const resource = MOCK_STREAMING_RESOURCES[surveyId];

      if (body.status === 'ACTIVE') {
        // 확장 중 시뮬레이션
        return HttpResponse.json({
          result: {
            survey_uuid: survey.survey_uuid,
            status: survey.status,
            streaming_resource: resource
              ? {
                  status: 'SCALING',
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
