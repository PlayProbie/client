/**
 * InlineAlert - 인라인 알림 컴포넌트
 * 업로드 실패 등 에러 메시지 표시
 */
import { AlertCircle, CheckCircle, Info, X, XCircle } from 'lucide-react';
import { type ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface InlineAlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  actions?: ReactNode;
  className?: string;
}

const VARIANT_CONFIG: Record<
  AlertVariant,
  { icon: typeof Info; className: string }
> = {
  info: {
    icon: Info,
    className: 'border-info/50 bg-info/10 text-info',
  },
  success: {
    icon: CheckCircle,
    className: 'border-success/50 bg-success/10 text-success',
  },
  warning: {
    icon: AlertCircle,
    className: 'border-warning/50 bg-warning/10 text-warning',
  },
  error: {
    icon: XCircle,
    className: 'border-destructive/50 bg-destructive/10 text-destructive',
  },
};

export function InlineAlert({
  variant = 'info',
  title,
  children,
  onClose,
  actions,
  className,
}: InlineAlertProps) {
  const config = VARIANT_CONFIG[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'relative flex gap-3 rounded-lg border p-4',
        config.className,
        className
      )}
      role="alert"
    >
      <Icon className="mt-0.5 size-5 shrink-0" />

      <div className="flex-1 space-y-2">
        {title && <p className="font-medium">{title}</p>}
        <div className="text-sm opacity-90">{children}</div>
        {actions && <div className="flex gap-2 pt-1">{actions}</div>}
      </div>

      {onClose && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 size-6"
          onClick={onClose}
        >
          <X className="size-4" />
          <span className="sr-only">닫기</span>
        </Button>
      )}
    </div>
  );
}
