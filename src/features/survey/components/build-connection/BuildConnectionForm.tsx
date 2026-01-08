import { SubmitButton } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import type { Build } from '@/features/game-streaming';
import { BuildStatusBadge } from '@/features/game-streaming';

import { INSTANCE_TYPE_OPTIONS } from './constants';

interface BuildConnectionFormProps {
  uploadedBuilds: Build[];
  formAction: (formData: FormData) => void;
  isPending: boolean;
  errorMessage?: string | null;
}

export function BuildConnectionForm({
  uploadedBuilds,
  formAction,
  isPending,
  errorMessage,
}: BuildConnectionFormProps) {
  return (
    <form
      action={formAction}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="build-select">빌드 선택</Label>
        <Select
          name="buildUuid"
          disabled={isPending}
        >
          <SelectTrigger id="build-select">
            <SelectValue placeholder="UPLOADED 상태의 빌드를 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            {uploadedBuilds.map((build) => (
              <SelectItem
                key={build.uuid}
                value={build.uuid}
              >
                <div className="flex w-full items-center justify-between gap-3">
                  <span className="truncate">{build.filename}</span>
                  <BuildStatusBadge status={build.status} />
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="instance-type">Instance Type</Label>
        <Select
          name="instanceType"
          disabled={isPending}
        >
          <SelectTrigger id="instance-type">
            <SelectValue placeholder="인스턴스 타입을 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            {INSTANCE_TYPE_OPTIONS.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">{option.label}</span>
                  <span className="text-muted-foreground text-xs">
                    {option.detail}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="max-capacity">목표 동시 접속자 수</Label>
        <Input
          id="max-capacity"
          name="maxCapacity"
          type="number"
          min={1}
          defaultValue={10}
          disabled={isPending}
        />
        <p className="text-muted-foreground text-xs">
          서비스 오픈 시 확장할 최대 세션 수를 입력합니다.
        </p>
      </div>

      {errorMessage && (
        <p className="text-destructive text-sm">{errorMessage}</p>
      )}

      <div className="flex justify-end gap-2">
        <SubmitButton isPending={isPending}>빌드 연결</SubmitButton>
      </div>
    </form>
  );
}
