/**
 * 선호 장르 문자열을 파싱하여 배열로 반환합니다.
 * @param preferGenreStr "RPG, FPS" 형태의 문자열
 * @returns ["RPG", "FPS"] 형태의 배열
 */
export function parsePreferGenre(preferGenreStr: string | undefined | null): string[] {
  if (!preferGenreStr) {
    return [];
  }
  return preferGenreStr.split(',').map((genre) => genre.trim()).filter((g) => g.length > 0);
}
