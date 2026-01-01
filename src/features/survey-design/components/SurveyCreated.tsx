import { Check, Copy, PartyPopper } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';

import { Button } from '@/components/ui';

type SurveyCreatedProps = {
  surveyUrl: string;
};

/**
 * 설문 생성 완료 화면
 * 설문 URL 및 QR 코드 표시
 */
function SurveyCreated({ surveyUrl }: SurveyCreatedProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(surveyUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('클립보드 복사 실패:', error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 py-12">
      {/* 성공 헤더 */}
      <div className="flex flex-col items-center gap-4">
        <div className="bg-success/10 text-success flex size-20 items-center justify-center rounded-full">
          <PartyPopper className="size-10" />
        </div>
        <div className="text-center">
          <h3 className="text-2xl font-bold">설문이 생성되었습니다!</h3>
          <p className="text-muted-foreground mt-2">
            아래 링크나 QR 코드를 통해 설문에 참여할 수 있습니다.
          </p>
        </div>
      </div>

      {/* URL 복사 카드 */}
      <div className="bg-surface border-border w-full max-w-lg rounded-xl border p-6 shadow-sm">
        <p className="text-muted-foreground mb-2 text-sm font-medium">
          설문 링크
        </p>
        <div className="bg-muted flex items-center gap-3 rounded-lg p-3">
          <code className="flex-1 truncate text-sm">{surveyUrl}</code>
          <Button
            type="button"
            variant={isCopied ? 'default' : 'outline'}
            size="sm"
            onClick={handleCopyUrl}
            className="shrink-0 gap-1.5"
          >
            {isCopied ? (
              <>
                <Check className="size-4" />
                복사됨
              </>
            ) : (
              <>
                <Copy className="size-4" />
                복사
              </>
            )}
          </Button>
        </div>
      </div>

      {/* QR 코드 카드 */}
      <div className="bg-surface border-border flex flex-col items-center gap-4 rounded-xl border p-8 shadow-sm">
        <p className="text-muted-foreground text-sm font-medium">
          QR 코드로 접속하기
        </p>
        <div className="rounded-lg bg-white p-4">
          <QRCodeSVG
            value={surveyUrl}
            size={200}
            level="M"
            includeMargin={false}
          />
        </div>
        <p className="text-muted-foreground text-center text-xs">
          스마트폰 카메라로 QR 코드를 스캔해 주세요
        </p>
      </div>

      {/* 안내 */}
      <p className="text-muted-foreground text-sm">
        대시보드에서 설문 상태와 응답을 확인할 수 있습니다.
      </p>
    </div>
  );
}

export { SurveyCreated };
export type { SurveyCreatedProps };
