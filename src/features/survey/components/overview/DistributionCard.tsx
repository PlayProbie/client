import { Check, Copy, ExternalLink, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/loading/Skeleton';
import { useToast } from '@/hooks/useToast';

interface DistributionCardProps {
  title: string;
  description: string;
  url: string;
  isLoading: boolean;
  enabled: boolean;
}

export function DistributionCard({
  title,
  description,
  url,
  isLoading,
  enabled,
}: DistributionCardProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const displayUrl = enabled ? url : url.replace(/\/([^/]+)$/, '/*****');

  const handleCopyLink = async () => {
    if (!url || !enabled) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        variant: 'success',
        title: '복사 완료',
        description: '링크가 클립보드에 복사되었습니다.',
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

  const handleShare = async () => {
    if (!url || !enabled) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description,
          url: url,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast({
            variant: 'destructive',
            title: '공유 실패',
            description: '공유하기 기능을 실행할 수 없습니다.',
          });
        }
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <Card
      className={`flex h-full flex-col overflow-hidden border transition-shadow duration-200 ${
        enabled
          ? 'bg-card shadow-sm hover:shadow-md'
          : 'bg-muted/5 opacity-80 shadow-none'
      }`}
    >
      <div className="flex flex-col gap-1 border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-foreground flex items-center gap-2 text-base font-medium">
            {title}
            <div className="flex items-center gap-1">
              {!enabled && !isLoading && (
                <Badge
                  variant="secondary"
                  className="pointer-events-none h-5 rounded-sm px-1.5 text-[10px] font-medium"
                >
                  비활성
                </Badge>
              )}
              {description && (
                <Badge
                  variant="outline"
                  className="text-muted-foreground pointer-events-none h-5 rounded-sm border-dashed px-1.5 text-[10px] font-medium"
                >
                  {description}
                </Badge>
              )}
            </div>
          </h3>
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col justify-between gap-6 p-6">
        {/* QR Code Section - Material style: Simple, clear, elevated */}
        <div className="flex flex-col items-center justify-center gap-4">
          {isLoading ? (
            <Skeleton className="size-36 rounded-md" />
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div
                className={`rounded-xl border bg-white p-3 shadow-sm ${
                  !enabled ? 'opacity-50 blur-sm grayscale' : ''
                }`}
              >
                {url && (
                  <QRCodeSVG
                    value={url}
                    size={140}
                    level="M"
                  />
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="border-muted-foreground/20 text-foreground hover:bg-muted/50 h-8 gap-2 rounded-full text-xs font-medium"
                onClick={handleShare}
                disabled={isLoading || !url || !enabled}
              >
                <Share2 className="size-3.5" />
                공유하기
              </Button>
            </div>
          )}
        </div>

        {/* Link Section - Material Outlined Text Field look */}
        {isLoading ? (
          <Skeleton className="h-12 w-full rounded-md" />
        ) : (
          <div className="relative">
            <div
              className={`bg-muted/20 flex items-center gap-2 rounded-md border px-3 py-2 transition-colors ${
                enabled ? 'border-input hover:border-ring/50' : 'border-muted'
              }`}
            >
              <code className="text-muted-foreground flex-1 truncate text-xs">
                {displayUrl}
              </code>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-muted/80 h-8 w-8 rounded-full"
                  onClick={handleCopyLink}
                  title="링크 복사"
                  disabled={!enabled}
                >
                  {copied ? (
                    <Check className="size-4 text-green-600" />
                  ) : (
                    <Copy className="text-muted-foreground size-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-muted/80 h-8 w-8 rounded-full"
                  onClick={() => window.open(url, '_blank')}
                  title="새 탭에서 열기"
                  disabled={!enabled}
                >
                  <ExternalLink className="text-muted-foreground size-4" />
                </Button>
              </div>
            </div>
            <span className="bg-card text-muted-foreground absolute -top-2 left-2 px-1 text-[10px] font-medium">
              Link
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
