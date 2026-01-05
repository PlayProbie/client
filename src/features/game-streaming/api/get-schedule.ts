/**
 * Schedule 조회 API
 * GET /streaming-games/{gameUuid}/schedule
 */
import type { ApiSchedule, Schedule } from '../types';
import { toSchedule } from '../types';
import { apiFetch } from '../utils';

/** 스케줄 조회 */
export async function getSchedule(gameUuid: string): Promise<Schedule> {
  const data = await apiFetch<ApiSchedule>(
    `/api/streaming-games/${gameUuid}/schedule`,
    { method: 'GET' },
    '스케줄을 불러오는데 실패했습니다.'
  );
  return toSchedule(data);
}
