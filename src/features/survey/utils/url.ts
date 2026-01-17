/**
 * 설문 관련 URL 생성 유틸리티
 */

/**
 * 설문 응답 세션 URL을 반환합니다.
 * (관리자/테스터가 설문에 응답하는 페이지)
 */
export function getSurveySessionUrl(surveyUuid: string): string {
  const baseUrl =
    import.meta.env.VITE_CLIENT_BASE_URL || window.location.origin;
  return `${baseUrl}/surveys/session/${surveyUuid}`;
}

/**
 * 설문 플레이(배포) URL을 반환합니다.
 * (테스터가 게임 플레이 및 설문 참여를 위해 접속하는 줄세우기 페이지)
 */
export function getSurveyPlayUrl(surveyUuid: string): string {
  const baseUrl =
    import.meta.env.VITE_CLIENT_BASE_URL || window.location.origin;
  return `${baseUrl}/play/queue/${surveyUuid}`;
}
