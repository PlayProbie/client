/** API 에러 상세 정보 */
export interface ApiErrorDetail {
  field: string;
  value: string;
  reason: string;
}

/** API 에러 응답 */
export interface ApiErrorResponse {
  message: string;
  status: number;
  errors: ApiErrorDetail[];
  code: string;
}

/** API 성공 응답 */
export interface ApiResponse<T> {
  result: T;
}
