/**
 * Step 4: 생성 완료
 */
function StepComplete() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <div className="bg-primary/10 text-primary flex size-16 items-center justify-center rounded-full">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="size-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold">설문이 생성되었습니다!</h3>
      <p className="text-muted-foreground text-center text-sm">
        설문이 성공적으로 생성되었습니다.
        <br />
        대시보드에서 설문 상태를 확인할 수 있습니다.
      </p>
    </div>
  );
}

export { StepComplete };
