import { API_BASE_URL } from '@/constants/api';

import type { TestStage,ThemeCategory } from '../types';

/** 테마 추천 응답 아이템 */
interface ThemeCategoryItem {
    code: ThemeCategory;
    displayName: string;
}

/** 테마 추천 API 응답 */
interface GetThemeRecommendationsResponse {
    result: ThemeCategoryItem[];
}

/**
 * GET /themes/recommendations - 테스트 단계별 추천 테마 조회
 * @param stage 테스트 단계 (PROTOTYPE, PLAYTEST, PRE_LAUNCH)
 */
export async function getThemeRecommendations(
    stage: TestStage
): Promise<GetThemeRecommendationsResponse> {
    const response = await fetch(
        `${API_BASE_URL}/themes/recommendations?stage=${stage.toUpperCase()}`,
        {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        }
    );

    if (!response.ok) {
        throw new Error('Failed to fetch theme recommendations');
    }

    return response.json();
}

/** 테마 세부항목 아이템 */
interface ThemeDetailItem {
    code: string;
    displayName: string;
    category: string;
}

/** 테마 세부항목 API 응답 */
interface GetThemeDetailsResponse {
    result: ThemeDetailItem[];
}

/**
 * GET /themes/{category}/details - 테마 세부항목 조회
 * @param category 테마 카테고리 (GAMEPLAY, UI_UX 등)
 */
export async function getThemeDetails(
    category: ThemeCategory
): Promise<GetThemeDetailsResponse> {
    const response = await fetch(
        `${API_BASE_URL}/themes/${category.toUpperCase()}/details`,
        {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        }
    );

    if (!response.ok) {
        throw new Error('Failed to fetch theme details');
    }

    return response.json();
}
