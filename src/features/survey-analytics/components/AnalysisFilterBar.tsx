import { Filter, RotateCcw } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';

import type { AnalysisFilters } from '../types';

interface AnalysisFilterBarProps {
  filters: AnalysisFilters;
  onApplyFilters: (filters: AnalysisFilters) => void;
  isLoading?: boolean;
}

const GENDER_OPTIONS = [
  { value: 'MALE', label: '남성' },
  { value: 'FEMALE', label: '여성' },
];

const AGE_GROUP_OPTIONS = [
  { value: '10s', label: '10대' },
  { value: '20s', label: '20대' },
  { value: '30s', label: '30대' },
  { value: '40s', label: '40대' },
  { value: '50s', label: '50대 이상' },
];

const GENRE_OPTIONS = [
  { value: 'RPG', label: 'RPG' },
  { value: 'FPS', label: 'FPS' },
  { value: 'ACTION', label: '액션' },
  { value: 'ADVENTURE', label: '어드벤처' },
  { value: 'SIMULATION', label: '시뮬레이션' },
  { value: 'SPORTS', label: '스포츠' },
  { value: 'PUZZLE', label: '퍼즐' },
  { value: 'STRATEGY', label: '전략' },
];

/**
 * 분석 필터 바
 * - 성별, 나이대, 선호 장르 필터링 UI
 * - 로컬 상태로 관리 후 "필터링" 버튼 클릭 시 부모에게 전달
 */
export function AnalysisFilterBar({
  filters,
  onApplyFilters,
  isLoading = false,
}: AnalysisFilterBarProps) {
  // 로컬 필터 상태 (버튼 클릭 전까지는 부모에게 전달하지 않음)
  const [localFilters, setLocalFilters] = useState<AnalysisFilters>(filters);

  const handleGenderChange = (value: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      gender: value === 'all' ? null : value,
    }));
  };

  const handleAgeGroupChange = (value: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      ageGroup: value === 'all' ? null : value,
    }));
  };

  const handleGenreChange = (value: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      preferGenre: value === 'all' ? null : value,
    }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      gender: null,
      ageGroup: null,
      preferGenre: null,
    };
    setLocalFilters(resetFilters);
    onApplyFilters(resetFilters);
  };

  const hasActiveFilters =
    localFilters.gender || localFilters.ageGroup || localFilters.preferGenre;

  // 로컬 필터와 적용된 필터가 다른지 확인
  const hasUnappliedChanges =
    localFilters.gender !== filters.gender ||
    localFilters.ageGroup !== filters.ageGroup ||
    localFilters.preferGenre !== filters.preferGenre;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm font-medium text-muted-foreground">필터:</span>

      {/* 성별 필터 */}
      <Select
        value={localFilters.gender ?? 'all'}
        onValueChange={handleGenderChange}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="성별" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체 성별</SelectItem>
          {GENDER_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 나이대 필터 */}
      <Select
        value={localFilters.ageGroup ?? 'all'}
        onValueChange={handleAgeGroupChange}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="나이대" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체 나이대</SelectItem>
          {AGE_GROUP_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 선호 장르 필터 */}
      <Select
        value={localFilters.preferGenre ?? 'all'}
        onValueChange={handleGenreChange}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="선호 장르" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체 장르</SelectItem>
          {GENRE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 필터링 적용 버튼 */}
      <Button
        onClick={handleApply}
        disabled={isLoading}
        size="sm"
        className="h-9 gap-1"
        variant={hasUnappliedChanges ? 'default' : 'secondary'}
      >
        <Filter className="h-4 w-4" />
        필터링
      </Button>

      {/* 필터 초기화 버튼 */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          disabled={isLoading}
          className="h-9 gap-1 text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-4 w-4" />
          초기화
        </Button>
      )}
    </div>
  );
}
