import { delay, http, HttpResponse } from 'msw';

import type { ApiStreamingResource } from '@/features/game-streaming-survey/types';

const API_BASE_URL = '/api';

// ----------------------------------------
// Mock Data: Streaming Resources (surveyId -> resource)
// ----------------------------------------
const MOCK_STREAMING_RESOURCES: Record<string, ApiStreamingResource> = {
  'survey-002-uuid': {
    uuid: 'resource-001-uuid',
    status: 'READY',
    current_capacity: 0,
    max_capacity: 10,
    instance_type: 'g4dn.xlarge',
    build_uuid: 'build-001',
    created_at: '2025-12-18T14:30:00Z',
  },
};

export const gameStreamingSurveyHandlers = [
  // ----------------------------------------
  // Admin Test API
  // ----------------------------------------

  // 관리자 테스트 시작
  http.post(
    `${API_BASE_URL}/surveys/:surveyId/streaming-resource/start-test`,
    async ({ params }) => {
      await delay(500);
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

      // 상태를 TESTING으로 변경, capacity를 1로
      resource.status = 'TESTING';
      resource.current_capacity = 1;

      // 3초 후 instances_ready 상태로 변경 (비동기 시뮬레이션)
      setTimeout(() => {
        if (
          MOCK_STREAMING_RESOURCES[surveyId] &&
          MOCK_STREAMING_RESOURCES[surveyId].status === 'TESTING'
        ) {
          (
            MOCK_STREAMING_RESOURCES[surveyId] as typeof resource & {
              instances_ready?: boolean;
            }
          ).instances_ready = true;
        }
      }, 3000);

      return HttpResponse.json({
        result: {
          status: resource.status,
          current_capacity: resource.current_capacity,
        },
      });
    }
  ),

  // 리소스 상태 조회 (테스트 중 instances_ready 확인용)
  http.get(
    `${API_BASE_URL}/surveys/:surveyId/streaming-resource/status`,
    async ({ params }) => {
      await delay(200);
      const surveyId = params.surveyId as string;

      const resource = MOCK_STREAMING_RESOURCES[
        surveyId
      ] as (typeof MOCK_STREAMING_RESOURCES)[number] & {
        instances_ready?: boolean;
      };

      if (!resource) {
        return HttpResponse.json(
          {
            message: '스트리밍 리소스가 연결되어 있지 않습니다.',
            code: 'SR002',
          },
          { status: 404 }
        );
      }

      return HttpResponse.json({
        result: {
          status: resource.status,
          current_capacity: resource.current_capacity,
          instances_ready: resource.instances_ready ?? false,
        },
      });
    }
  ),

  // 관리자 테스트 종료
  http.post(
    `${API_BASE_URL}/surveys/:surveyId/streaming-resource/stop-test`,
    async ({ params }) => {
      await delay(500);
      const surveyId = params.surveyId as string;

      const resource = MOCK_STREAMING_RESOURCES[
        surveyId
      ] as (typeof MOCK_STREAMING_RESOURCES)[number] & {
        instances_ready?: boolean;
      };

      if (!resource) {
        return HttpResponse.json(
          {
            message: '스트리밍 리소스가 연결되어 있지 않습니다.',
            code: 'SR002',
          },
          { status: 404 }
        );
      }

      // 상태를 READY로 변경, capacity를 0으로
      resource.status = 'READY';
      resource.current_capacity = 0;
      resource.instances_ready = false;

      return HttpResponse.json({
        result: {
          status: resource.status,
          current_capacity: resource.current_capacity,
        },
      });
    }
  ),
];
