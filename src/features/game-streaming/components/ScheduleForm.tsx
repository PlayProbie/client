/**
 * ScheduleForm - 스케줄 설정 폼 컴포넌트
 */
import { useState } from 'react';

import { Button, InlineAlert, Skeleton } from '@/components/ui';
import { Label } from '@/components/ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';

import { useScheduleMutation, useScheduleQuery } from '../hooks';
import type { Schedule, ScheduleStatus } from '../types';

interface ScheduleFormProps {
  gameUuid: string;
}

type FormData = Pick<
  Schedule,
  'startDateTime' | 'endDateTime' | 'timezone' | 'maxSessions'
>;

const TIMEZONE_OPTIONS = [
  { value: 'Asia/Seoul', label: 'Asia/Seoul (UTC+9)' },
  { value: 'America/New_York', label: 'America/New_York (UTC-5)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (UTC-8)' },
  { value: 'Europe/London', label: 'Europe/London (UTC+0)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (UTC+1)' },
];

/** Create initial form data from schedule data */
function createInitialFormData(data: Schedule): FormData {
  return {
    startDateTime: data.startDateTime,
    endDateTime: data.endDateTime,
    timezone: data.timezone,
    maxSessions: data.maxSessions,
  };
}

/** 날짜/시간 문자열을 datetime-local input 형식으로 변환 */
function toDateTimeLocal(isoString: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

/** datetime-local input 값을 ISO 8601로 변환 */
function fromDateTimeLocal(localString: string): string {
  if (!localString) return '';
  return new Date(localString).toISOString();
}

/** 스케줄 상태 계산 */
function calculateStatus(
  startDateTime: string,
  endDateTime: string
): ScheduleStatus {
  const now = new Date();
  const start = new Date(startDateTime);
  const end = new Date(endDateTime);

  if (now >= start && now <= end) {
    return 'ACTIVE';
  }
  return 'INACTIVE';
}

/** Outer component - handles data fetching and loading/error states */
export function ScheduleForm({ gameUuid }: ScheduleFormProps) {
  const { data, isLoading, isError, refetch } = useScheduleQuery(gameUuid);
  const mutation = useScheduleMutation(gameUuid);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <InlineAlert
        variant="error"
        title="로딩 실패"
        actions={
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
          >
            다시 시도
          </Button>
        }
      >
        스케줄을 불러오지 못했습니다.
      </InlineAlert>
    );
  }

  if (!data) {
    return null;
  }

  // Key pattern: remount ScheduleFormContent when gameUuid changes
  return (
    <ScheduleFormContent
      key={gameUuid}
      initialData={data}
      mutation={mutation}
    />
  );
}

interface ScheduleFormContentProps {
  initialData: Schedule;
  mutation: ReturnType<typeof useScheduleMutation>;
}

/** Inner form component - receives guaranteed data, initializes state directly */
function ScheduleFormContent({
  initialData,
  mutation,
}: ScheduleFormContentProps) {
  // Initialize state directly from props (no useEffect needed)
  const [formData, setFormData] = useState<FormData>(() =>
    createInitialFormData(initialData)
  );
  const [isDirty, setIsDirty] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = <K extends keyof FormData>(
    key: K,
    value: FormData[K]
  ) => {
    setFormData({ ...formData, [key]: value });
    setIsDirty(true);
    setValidationError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation: start < end
    const start = new Date(formData.startDateTime);
    const end = new Date(formData.endDateTime);
    if (start >= end) {
      setValidationError('종료 시간은 시작 시간보다 이후여야 합니다.');
      return;
    }

    mutation.mutate(formData, {
      onSuccess: () => setIsDirty(false),
    });
  };

  const currentStatus = calculateStatus(
    formData.startDateTime,
    formData.endDateTime
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Status Preview */}
      <div className="bg-muted/50 rounded-lg border p-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">현재 상태:</span>
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${
              currentStatus === 'ACTIVE'
                ? 'bg-success/20 text-success'
                : 'bg-muted-foreground/20 text-muted-foreground'
            }`}
          >
            {currentStatus}
          </span>
          {formData.maxSessions === 0 && (
            <span className="text-muted-foreground text-xs">
              (Capacity OFF)
            </span>
          )}
        </div>
      </div>

      {/* Active Window - Start */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="start-date-time">시작 시간</Label>
          <input
            id="start-date-time"
            type="datetime-local"
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            value={toDateTimeLocal(formData.startDateTime)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange('startDateTime', fromDateTimeLocal(e.target.value))
            }
          />
        </div>

        {/* Active Window - End */}
        <div className="space-y-2">
          <Label htmlFor="end-date-time">종료 시간</Label>
          <input
            id="end-date-time"
            type="datetime-local"
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            value={toDateTimeLocal(formData.endDateTime)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange('endDateTime', fromDateTimeLocal(e.target.value))
            }
          />
        </div>
      </div>

      {validationError && (
        <p className="text-destructive text-sm">{validationError}</p>
      )}

      {/* Timezone */}
      <div className="space-y-2">
        <Label htmlFor="timezone">Timezone</Label>
        <Select
          value={formData.timezone}
          onValueChange={(value) => handleChange('timezone', value)}
        >
          <SelectTrigger id="timezone">
            <SelectValue placeholder="Timezone 선택" />
          </SelectTrigger>
          <SelectContent>
            {TIMEZONE_OPTIONS.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Capacity Target */}
      <div className="space-y-2">
        <Label htmlFor="max-sessions">Capacity Target (Max Sessions)</Label>
        <input
          id="max-sessions"
          type="number"
          min={0}
          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          value={formData.maxSessions}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleChange('maxSessions', parseInt(e.target.value, 10) || 0)
          }
        />
        <p className="text-muted-foreground text-xs">
          0으로 설정하면 용량 제한이 비활성화됩니다.
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="submit"
          disabled={!isDirty || mutation.isPending}
        >
          {mutation.isPending ? '저장 중...' : '저장'}
        </Button>
      </div>
    </form>
  );
}
