/**
 * SurveyOpenStep - 설문 오픈 단계
 * Step 3: 설문 링크 표시 및 복사
 */
import { Check, Copy, ExternalLink } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { getSurveyPlayUrl } from '@/features/survey/utils/url';
import { useToast } from '@/hooks/useToast';

interface SurveyOpenStepProps {
  surveyUuid: string;
}

export function SurveyOpenStep({ surveyUuid }: SurveyOpenStepProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const surveyLink = getSurveyPlayUrl(surveyUuid);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(surveyLink);
      setCopied(true);
      toast({
        variant: 'success',
        title: '복사 완료',
        description: '설문 링크가 클립보드에 복사되었습니다.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        variant: 'destructive',
        title: '복사 실패',
        description: '링크 복사에 실패했습니다.',
      });
    }
  };

  const handleOpenLink = () => {
    window.open(surveyLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold">설문 오픈</h3>
        <p className="text-muted-foreground text-sm">
          아래 링크를 공유하여 테스터들이 설문에 참여할 수 있습니다.
        </p>
      </div>

      {/* Link Display */}
      <div className="space-y-3">
        <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          설문 링크
        </p>
        <div className="flex items-center gap-2">
          <div className="bg-muted flex-1 rounded-lg border px-4 py-3">
            <code className="text-sm break-all">{surveyLink}</code>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopyLink}
            title="링크 복사"
          >
            {copied ? (
              <Check className="size-4 text-green-500" />
            ) : (
              <Copy className="size-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleOpenLink}
            title="새 탭에서 열기"
          >
            <ExternalLink className="size-4" />
          </Button>
        </div>
      </div>

      {/* QR Code */}
      <div className="space-y-3">
        <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          QR 코드
        </p>
        <div className="bg-card inline-block rounded-lg border p-4">
          <QRCodeSVG
            value={surveyLink}
            size={160}
            level="M"
          />
        </div>
        <p className="text-muted-foreground text-sm">
          모바일 기기에서 QR 코드를 스캔하여 설문에 참여할 수 있습니다.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4">
        <Button onClick={handleCopyLink}>
          {copied ? (
            <Check className="mr-2 size-4" />
          ) : (
            <Copy className="mr-2 size-4" />
          )}
          링크 복사
        </Button>
        <Button
          variant="outline"
          onClick={handleOpenLink}
        >
          <ExternalLink className="mr-2 size-4" />
          미리보기
        </Button>
      </div>
    </div>
  );
}
