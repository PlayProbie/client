/**
 * StreamSettingsForm - 스트리밍 설정 폼 컴포넌트
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

import { useStreamSettingsMutation, useStreamSettingsQuery } from '../hooks';
import type { GpuProfile, ResolutionFps, StreamSettings } from '../types';

interface StreamSettingsFormProps {
  gameUuid: string;
}

const GPU_PROFILE_OPTIONS: { value: GpuProfile; label: string }[] = [
  { value: 'entry', label: 'Entry' },
  { value: 'performance', label: 'Performance' },
  { value: 'high', label: 'High' },
];

const RESOLUTION_FPS_OPTIONS: { value: ResolutionFps; label: string }[] = [
  { value: '720p30', label: '720p @ 30fps' },
  { value: '1080p60', label: '1080p @ 60fps (권장)' },
];

/** Outer component - handles data fetching and loading/error states */
export function StreamSettingsForm({ gameUuid }: StreamSettingsFormProps) {
  const { data, isLoading, isError, refetch } =
    useStreamSettingsQuery(gameUuid);
  const mutation = useStreamSettingsMutation(gameUuid);

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
        스트림 설정을 불러오지 못했습니다.
      </InlineAlert>
    );
  }

  if (!data) {
    return null;
  }

  // Key pattern: remount StreamSettingsFormContent when gameUuid changes
  return (
    <StreamSettingsFormContent
      key={gameUuid}
      initialData={data}
      mutation={mutation}
    />
  );
}

interface StreamSettingsFormContentProps {
  initialData: StreamSettings;
  mutation: ReturnType<typeof useStreamSettingsMutation>;
}

/** Inner form component - receives guaranteed data, initializes state directly */
function StreamSettingsFormContent({
  initialData,
  mutation,
}: StreamSettingsFormContentProps) {
  // Initialize state directly from props (no useEffect needed)
  const [formData, setFormData] = useState<StreamSettings>(() => initialData);
  const [isDirty, setIsDirty] = useState(false);

  const handleGpuProfileChange = (value: GpuProfile) => {
    setFormData({ ...formData, gpuProfile: value });
    setIsDirty(true);
  };

  const handleResolutionFpsChange = (value: ResolutionFps) => {
    setFormData({ ...formData, resolutionFps: value });
    setIsDirty(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData, {
      onSuccess: () => setIsDirty(false),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* GPU Profile */}
      <div className="space-y-2">
        <Label htmlFor="gpu-profile">GPU Profile</Label>
        <Select
          value={formData.gpuProfile}
          onValueChange={handleGpuProfileChange}
        >
          <SelectTrigger id="gpu-profile">
            <SelectValue placeholder="GPU Profile 선택" />
          </SelectTrigger>
          <SelectContent>
            {GPU_PROFILE_OPTIONS.map((option) => (
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

      {/* Resolution / FPS */}
      <div className="space-y-2">
        <Label>Resolution / FPS</Label>
        <div className="space-y-2">
          {RESOLUTION_FPS_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-3"
            >
              <input
                type="radio"
                name="resolutionFps"
                value={option.value}
                checked={formData.resolutionFps === option.value}
                onChange={() => handleResolutionFpsChange(option.value)}
                className="size-4"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* OS (Readonly) */}
      <div className="space-y-2">
        <Label>OS</Label>
        <div className="bg-muted text-muted-foreground rounded-md border px-3 py-2 text-sm">
          {formData.os}
        </div>
      </div>

      {/* Region (Readonly) */}
      <div className="space-y-2">
        <Label>Region</Label>
        <div className="bg-muted text-muted-foreground rounded-md border px-3 py-2 text-sm">
          {formData.region}
        </div>
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
