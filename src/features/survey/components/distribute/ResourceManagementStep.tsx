/**
 * ResourceManagementStep - 리소스 관리 단계
 * Step 2: 스트리밍 리소스 설정 및 생성
 */
import { ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button, InlineAlert } from '@/components/ui';
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
import type { CreateStreamingResourceRequest } from '@/features/game-streaming-survey';
import { useCreateStreamingResource } from '@/features/game-streaming-survey';
import { useToast } from '@/hooks/useToast';

interface ResourceManagementStepProps {
  surveyUuid: string;
  selectedBuild: Build;
  onBack: () => void;
  onSuccess: () => void;
}

const INSTANCE_TYPES = [
  { value: 'g4dn.xlarge', label: 'g4dn.xlarge (NVIDIA T4)' },
  { value: 'g4dn.2xlarge', label: 'g4dn.2xlarge (NVIDIA T4)' },
  { value: 'g5.xlarge', label: 'g5.xlarge (NVIDIA A10G)' },
  { value: 'g5.2xlarge', label: 'g5.2xlarge (NVIDIA A10G)' },
];

interface FormData {
  instanceType: string;
  maxCapacity: number;
}

export function ResourceManagementStep({
  surveyUuid,
  selectedBuild,
  onBack,
  onSuccess,
}: ResourceManagementStepProps) {
  const { toast } = useToast();
  const createMutation = useCreateStreamingResource(surveyUuid);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      instanceType: 'g4dn.xlarge',
      maxCapacity: 10,
    },
  });

  const instanceType = watch('instanceType');

  const onSubmit = async (data: FormData) => {
    const request: CreateStreamingResourceRequest = {
      buildUuid: selectedBuild.uuid,
      instanceType: data.instanceType,
      maxCapacity: data.maxCapacity,
    };

    try {
      await createMutation.mutateAsync(request);
      toast({
        variant: 'success',
        title: '리소스 생성 완료',
        description: '스트리밍 리소스가 생성되었습니다.',
      });
      onSuccess();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '리소스 생성에 실패했습니다.';
      toast({
        variant: 'destructive',
        title: '리소스 생성 실패',
        description: message,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h3 className="text-base font-semibold">리소스 관리</h3>
          <p className="text-muted-foreground text-sm">
            스트리밍 환경 설정을 구성합니다.
          </p>
        </div>
      </div>

      {/* Selected Build Info */}
      <div className="bg-muted/50 rounded-lg border p-4">
        <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          선택된 빌드
        </p>
        <p className="font-medium">{selectedBuild.filename}</p>
        {selectedBuild.version && (
          <p className="text-muted-foreground text-sm">
            v{selectedBuild.version}
          </p>
        )}
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        {createMutation.isError && (
          <InlineAlert
            variant="error"
            title="오류"
          >
            리소스 생성에 실패했습니다. 다시 시도해주세요.
          </InlineAlert>
        )}

        {/* Instance Type */}
        <div className="space-y-2">
          <Label htmlFor="instance-type">GPU 인스턴스 타입</Label>
          <Select
            value={instanceType}
            onValueChange={(value) => setValue('instanceType', value)}
          >
            <SelectTrigger id="instance-type">
              <SelectValue placeholder="인스턴스 타입 선택" />
            </SelectTrigger>
            <SelectContent>
              {INSTANCE_TYPES.map((type) => (
                <SelectItem
                  key={type.value}
                  value={type.value}
                >
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-muted-foreground text-xs">
            게임 요구사항에 맞는 GPU 인스턴스를 선택하세요.
          </p>
        </div>

        {/* Max Capacity */}
        <div className="space-y-2">
          <Label htmlFor="max-capacity">목표 동시 접속자 수</Label>
          <Input
            id="max-capacity"
            type="number"
            min={1}
            max={100}
            {...register('maxCapacity', {
              required: '동시 접속자 수를 입력해주세요.',
              min: { value: 1, message: '최소 1명 이상이어야 합니다.' },
              max: { value: 100, message: '최대 100명까지 설정 가능합니다.' },
              valueAsNumber: true,
            })}
          />
          {errors.maxCapacity && (
            <p className="text-destructive text-xs">
              {errors.maxCapacity.message}
            </p>
          )}
          <p className="text-muted-foreground text-xs">
            동시에 스트리밍할 수 있는 최대 사용자 수입니다.
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending
              ? '생성 중...'
              : '리소스 생성 및 다음 단계'}
          </Button>
        </div>
      </form>
    </div>
  );
}
