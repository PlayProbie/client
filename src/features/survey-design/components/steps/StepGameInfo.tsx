import type { Control } from 'react-hook-form';

import { CheckboxGroup } from '@/components/ui/CheckboxGroup';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { GAME_GENRE_OPTIONS } from '@/constants';

import type { SurveyFormData } from '../../types';

type StepGameInfoProps = {
  control: Control<SurveyFormData>;
};

/**
 * Step 0: 게임 정보
 * - 게임 이름
 * - 게임 장르
 * - 게임 컨텍스트
 */
function StepGameInfo({ control }: StepGameInfoProps) {
  return (
    <div className="flex flex-col gap-4">
      <FormField
        control={control}
        name="gameName"
        rules={{ required: '게임 이름을 입력해주세요' }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>게임 이름</FormLabel>
            <FormControl>
              <Input
                placeholder="예: 던전 앤 파이터"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="gameGenre"
        rules={{
          validate: (value) => {
            if (!value || value.length === 0) {
              return '게임 장르를 1개 이상 선택해주세요';
            }
            if (value.length > 3) {
              return '게임 장르는 최대 3개까지 선택 가능합니다';
            }
            return true;
          },
        }}
        render={({ field, fieldState }) => (
          <CheckboxGroup
            id="gameGenre"
            label="게임 장르"
            options={GAME_GENRE_OPTIONS}
            value={field.value || []}
            onChange={field.onChange}
            error={fieldState.error?.message}
            columns={4}
            maxSelection={3}
          />
        )}
      />

      <FormField
        control={control}
        name="gameContext"
        rules={{ required: '게임 설명을 입력해주세요' }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>게임 설명</FormLabel>
            <FormControl>
              <Textarea
                placeholder="게임의 배경, 스토리, 주요 특징 등을 설명해주세요"
                className="min-h-[120px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export { StepGameInfo };
