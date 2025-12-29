/** API 에러 상세 정보 */
export interface ApiErrorDetail {
  field: string;
  reason: string;
}

/** API 에러 객체 */
export interface ApiError {
  code: string;
  message: string;
  details?: ApiErrorDetail[];
}

/** API 에러 응답 */
export interface ApiErrorResponse {
  error: ApiError;
}

/** API 성공 응답 래퍼 */
export interface ApiResponse<T> {
  result: T;
}
