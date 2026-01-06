/**
 * ResourceManagementStep - 리소스 관리 단계
 * Step 2: 스트리밍 리소스 설정 및 생성
 */
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
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
import {
  getStreamingResource,
  streamingResourceKeys,
  useCreateStreamingResource,
} from '@/features/game-streaming-survey';
import { useToast } from '@/hooks/useToast';

import { INSTANCE_TYPE_OPTIONS } from '../build-connection/constants';

interface ResourceManagementStepProps {
  surveyUuid: string;
  selectedBuild: Build;
  onBack: () => void;
  onSuccess: () => void;
}

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

  // Polling 상태 관리
  const [isPolling, setIsPolling] = useState(false);
  const hasNotifiedRef = useRef(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      instanceType: 'gen6n_pro_win2022',
      maxCapacity: 10,
    },
  });

  const instanceType = watch('instanceType');

  // Polling query - isPolling이 true일 때만 활성화
  const {
    data: streamingResource,
    isError: isPollingError,
    error: pollingError,
    refetch: refetchResource,
  } = useQuery({
    queryKey: streamingResourceKeys.detail(surveyUuid),
    queryFn: () => getStreamingResource(surveyUuid),
    enabled: isPolling,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // ACTIVE 상태가 되면 polling 중지
      if (!isPolling || status === 'ACTIVE') {
        return false;
      }
      return 5000; // 5초 간격
    },
  });

  // ACTIVE 상태 감지 및 onSuccess 호출
  useEffect(() => {
    if (
      isPolling &&
      streamingResource?.status === 'ACTIVE' &&
      !hasNotifiedRef.current
    ) {
      hasNotifiedRef.current = true;
      setIsPolling(false);
      toast({
        variant: 'success',
        title: '리소스 활성화 완료',
        description: '스트리밍 리소스가 준비되었습니다.',
      });
      onSuccess();
    }
  }, [isPolling, streamingResource, onSuccess, toast]);

  const onSubmit = async (data: FormData) => {
    const request: CreateStreamingResourceRequest = {
      buildUuid: selectedBuild.uuid,
      instanceType: data.instanceType,
      maxCapacity: data.maxCapacity,
    };

    try {
      await createMutation.mutateAsync(request);
      // 리소스 생성 요청 성공 → polling 시작
      toast({
        variant: 'default',
        title: '리소스 생성 요청됨',
        description: '리소스 활성화를 기다리는 중...',
      });
      hasNotifiedRef.current = false;
      setIsPolling(true);
      void refetchResource();
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

  // 버튼 상태
  const isLoading = createMutation.isPending || isPolling;
  const getButtonText = () => {
    if (createMutation.isPending) return '생성 요청 중...';
    if (isPolling) {
      const status = streamingResource?.status;
      if (status === 'CREATING') return '리소스 생성 중...';
      if (status === 'PROVISIONING') return '프로비저닝 중...';
      if (status === 'READY') return '준비 중...';
      return '활성화 대기 중...';
    }
    return '리소스 생성 및 다음 단계';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          disabled={isLoading}
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

        {isPolling && isPollingError && (
          <InlineAlert
            variant="error"
            title="상태 확인 실패"
            actions={
              <Button
                size="sm"
                variant="outline"
                onClick={() => refetchResource()}
              >
                다시 시도
              </Button>
            }
          >
            {pollingError instanceof Error
              ? pollingError.message
              : '리소스 상태 조회에 실패했습니다.'}
          </InlineAlert>
        )}

        {isPolling && !isPollingError && (
          <InlineAlert
            variant="info"
            title="리소스 활성화 대기 중"
          >
            리소스가 ACTIVE 상태가 될 때까지 자동으로 확인합니다. (5초 간격)
          </InlineAlert>
        )}

        {/* Instance Type */}
        <div className="space-y-2">
          <Label htmlFor="instance-type">GPU 인스턴스 타입</Label>
          <Select
            value={instanceType}
            onValueChange={(value) => setValue('instanceType', value)}
            disabled={isLoading}
          >
            <SelectTrigger id="instance-type">
              <SelectValue placeholder="인스턴스 타입 선택" />
            </SelectTrigger>
            <SelectContent>
              {INSTANCE_TYPE_OPTIONS.map((type) => {
                const isWindows = type.value.includes('win');
                return (
                  <SelectItem
                    key={type.value}
                    value={type.value}
                    disabled={!isWindows}
                  >
                    <div className="flex flex-col">
                      <span>{type.label}</span>
                      <span className="text-muted-foreground text-xs">
                        {type.detail}
                      </span>
                    </div>
                  </SelectItem>
                );
              })}
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
            disabled={isLoading}
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
            disabled={isLoading}
          >
            {isLoading && (
              <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            {getButtonText()}
          </Button>
        </div>
      </form>
    </div>
  );
}
