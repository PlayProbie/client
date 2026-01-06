import type { UseFormRegister } from 'react-hook-form';

import { Label } from '@/components/ui/Label';

import type { ResolutionFps, StreamSettings } from '../types';

interface ResolutionSelectProps {
  register: UseFormRegister<StreamSettings>;
}

const RESOLUTION_FPS_OPTIONS: { value: ResolutionFps; label: string }[] = [
  { value: '720p30', label: '720p @ 30fps' },
  { value: '1080p60', label: '1080p @ 60fps (권장)' },
];

export function ResolutionSelect({ register }: ResolutionSelectProps) {
  return (
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
              {...register('resolutionFps')}
              value={option.value}
              className="size-4"
            />
            <span className="text-sm">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
