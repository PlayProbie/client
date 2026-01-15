/**
 * Game API - 게임 요소 추출
 * POST /api/games/extract-elements
 */
import { API_BASE_URL } from '@/constants/api';

import type { ApiExtractElementsResponse, ExtractedElements } from '../types';

export interface ExtractElementsRequest {
  game_name: string;
  genres: string[];
  game_description: string;
}

/** 게임 요소 추출 요청 */
export async function postExtractElements(
  data: ExtractElementsRequest
): Promise<ExtractedElements> {
  // 30초 타임아웃 설정
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(`${API_BASE_URL}/games/extract-elements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 408) {
        throw new Error('분석 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.');
      }
      throw new Error('게임 분석에 실패했습니다.');
    }

    const result: ApiExtractElementsResponse = await response.json();

    const requiredFields = result.required_fields || [];
    let optionalFields = result.optional_fields || [];

    // Fallback: If there are keys in elements that are not in required or optional lists, add them to optional
    const allKeys = Object.keys(result.elements);
    const usedKeys = new Set([...requiredFields, ...optionalFields]);
    const extraKeys = allKeys.filter((k) => !usedKeys.has(k));

    if (extraKeys.length > 0) {
      optionalFields = [...optionalFields, ...extraKeys];
    }

    return {
      elements: result.elements,
      requiredFields,
      optionalFields,
      missingRequired: result.missing_required,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error(
          '분석 시간이 오래 걸리고 있습니다. 잠시 후 다시 시도해주세요.'
        );
      }
    }
    throw error;
  }
}
