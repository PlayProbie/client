/**
 * Schedule 저장 API
 * PUT /streaming-games/{gameUuid}/schedule
 */
import type { ApiSchedule, Schedule } from '../types';
import { toApiSchedule, toSchedule } from '../types';
import { apiFetch } from '../utils';

/** 스케줄 저장 input 타입 */
export type ScheduleInput = Pick<
  Schedule,
  'startDateTime' | 'endDateTime' | 'timezone' | 'maxSessions'
>;

/** 스케줄 저장 */
export async function putSchedule(
  gameUuid: string,
  schedule: ScheduleInput
): Promise<Schedule> {
  const apiSchedule = toApiSchedule(schedule);
  const data = await apiFetch<
    ApiSchedule,
    Omit<ApiSchedule, 'status' | 'next_activation' | 'next_deactivation'>
  >(
    `/api/streaming-games/${gameUuid}/schedule`,
    { method: 'PUT', body: apiSchedule },
    '스케줄 저장에 실패했습니다.'
  );
  return toSchedule(data);
}
