/**
 * MSW 유틸리티 함수
 */

/**
 * Date 객체를 한국 시간(KST) 기준 ISO 8601 형식 문자열로 변환
 * @example toKSTISOString(new Date()) // "2026-01-01T17:30:00+09:00"
 */
export function toKSTISOString(date: Date): string {
  const kstOffset = 9 * 60; // KST는 UTC+9
  const localTime = new Date(date.getTime() + kstOffset * 60 * 1000);

  const year = localTime.getUTCFullYear();
  const month = String(localTime.getUTCMonth() + 1).padStart(2, '0');
  const day = String(localTime.getUTCDate()).padStart(2, '0');
  const hours = String(localTime.getUTCHours()).padStart(2, '0');
  const minutes = String(localTime.getUTCMinutes()).padStart(2, '0');
  const seconds = String(localTime.getUTCSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+09:00`;
}
