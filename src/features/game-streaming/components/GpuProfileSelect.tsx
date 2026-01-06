import { type Control,Controller } from 'react-hook-form';

import { Label } from '@/components/ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';

import type { GpuProfile, StreamSettings } from '../types';

interface GpuProfileSelectProps {
  control: Control<StreamSettings>;
}

const GPU_PROFILE_OPTIONS: { value: GpuProfile; label: string }[] = [
  { value: 'entry', label: 'Entry' },
  { value: 'performance', label: 'Performance' },
  { value: 'high', label: 'High' },
];

export function GpuProfileSelect({ control }: GpuProfileSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="gpu-profile">GPU Profile</Label>
      <Controller
        control={control}
        name="gpuProfile"
        render={({ field }) => (
          <Select
            value={field.value}
            onValueChange={field.onChange}
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
        )}
      />
    </div>
  );
}
