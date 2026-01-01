/**
 * UI Select/Checkbox Options
 */

import { type GameGenre, GameGenreConfig } from '@/features/game';
import { type TestPurpose, TestPurposeConfig } from '@/features/survey-design';

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
