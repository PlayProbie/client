type InsufficientDataWarningProps = {
  /** 필터가 적용된 상태인지 여부 */
  readonly isFiltered?: boolean;
};

export function InsufficientDataWarning({ isFiltered = false }: InsufficientDataWarningProps) {
  return (
    <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-6 text-center">
      <svg className="mx-auto h-12 w-12 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <h3 className="mt-4 text-lg font-semibold text-amber-600">분석 데이터 부족</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        {isFiltered ? (
          <>
            선택한 필터 조건에 해당하는 응답 데이터가 부족하여 분석을 수행할 수 없습니다.
            <br />
            필터 조건을 변경하거나 더 많은 응답이 수집될 때까지 기다려 주세요.
          </>
        ) : (
          <>
            분석할 응답 데이터가 부족합니다.
            <br />
            더 많은 응답이 수집될 때까지 기다려 주세요.
          </>
        )}
      </p>
    </div>
  );
}
