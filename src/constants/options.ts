/**
 * UI Select/Checkbox Options
 */

import { type GameGenre, GameGenreConfig } from '@/features/game';
import {
  type TestPurpose,
  TestPurposeConfig,
  type TestStage,
  TestStageConfig,
  type ThemeCategory,
  ThemeCategoryConfig,
  type ThemeDetail,
  ThemeDetailConfig,
} from '@/features/survey-design';

/** 공통 Select Option 타입 */
export interface SelectOption<T> {
  label: string;
  value: T;
}

/** 게임 장르 Select Options */
export const GAME_GENRE_OPTIONS: SelectOption<GameGenre>[] = Object.values(
  GameGenreConfig
).map(({ value, label }) => ({ label, value }));

/** 설문 목적 Select Options */
export const TEST_PURPOSE_OPTIONS: SelectOption<TestPurpose>[] = Object.values(
  TestPurposeConfig
).map(({ value, label }) => ({ label, value }));

/** 테스트 단계 Select Options */
export const TEST_STAGE_OPTIONS: SelectOption<TestStage>[] = Object.values(
  TestStageConfig
).map(({ value, label }) => ({ label, value }));

/** 테마 대분류 Select Options */
export const THEME_CATEGORY_OPTIONS: SelectOption<ThemeCategory>[] =
  Object.values(ThemeCategoryConfig).map(({ value, label }) => ({
    label,
    value,
  }));

/** 테마 소분류 (카테고리별 필터링용) */
export const getThemeDetailOptions = (
  category: ThemeCategory
): SelectOption<ThemeDetail>[] =>
  Object.values(ThemeDetailConfig)
    .filter((detail) => detail.category === category)
    .map(({ value, label }) => ({ label, value }));

