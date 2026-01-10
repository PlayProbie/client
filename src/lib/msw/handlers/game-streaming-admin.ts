import { delay, http, HttpResponse } from 'msw';

import { StreamingResourceStatus } from '@/features/game-streaming-survey/types';

import { MOCK_STREAMING_RESOURCES } from './streaming-resource-store';

const API_BASE_URL = '/api';

export const gameStreamingAdminHandlers = [
  // ----------------------------------------
  // Admin Test API
  // ----------------------------------------

  // 관리자 테스트 시작
  http.post(
    `${API_BASE_URL}/surveys/:surveyUuid/streaming-resource/start-test`,
    async ({ params }) => {
      await delay(500);
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

      // 상태를 TESTING으로 변경, capacity를 1로
      resource.status = StreamingResourceStatus.TESTING;
      resource.current_capacity = 1;

      // 3초 후 instances_ready 상태로 변경 (비동기 시뮬레이션)
      setTimeout(() => {
        if (
          MOCK_STREAMING_RESOURCES[surveyUuid] &&
          MOCK_STREAMING_RESOURCES[surveyUuid].status ===
            StreamingResourceStatus.TESTING
        ) {
          MOCK_STREAMING_RESOURCES[surveyUuid].instances_ready = true;
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
    `${API_BASE_URL}/surveys/:surveyUuid/streaming-resource/status`,
    async ({ params }) => {
      await delay(200);
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
    `${API_BASE_URL}/surveys/:surveyUuid/streaming-resource/stop-test`,
    async ({ params }) => {
      await delay(500);
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

      // 상태를 READY로 변경, capacity를 0으로
      resource.status = StreamingResourceStatus.READY;
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
