import { RotateCcw } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { cn } from '@/lib/utils';

import { ELEMENT_LABELS, type ExtractedElements } from '../types';

interface GameElementAnalysisStepProps {
  elements: ExtractedElements;
  onElementChange: (key: string, value: string) => void;
  onReanalyze?: () => void;
  onBack?: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

export function GameElementAnalysisStep({
  elements,
  onElementChange,
  onReanalyze,
  onBack,
  onConfirm,
  isSubmitting,
}: GameElementAnalysisStepProps) {
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const {
    elements: currentElements,
    requiredFields,
    optionalFields,
    missingRequired,
  } = elements;

  // 필수 항목이 모두 채워졌는지 확인 (missing_required 감지 + 빈 값 체크)
  const canConfirm = useMemo(() => {
    // missingRequired에 있는 키들은 반드시 값이 있어야 함
    const missingStillEmpty = missingRequired.some(
      (key) => !currentElements[key] || currentElements[key]?.trim() === ''
    );
    if (missingStillEmpty) return false;

    // requiredFields에 있는 키들도 값이 있어야 함 (기본적으로 API가 주지만, 사용자가 지웠을 수도 있음)
    const requiredEmpty = requiredFields.some(
      (key) => !currentElements[key] || currentElements[key]?.trim() === ''
    );

    return !missingStillEmpty && !requiredEmpty;
  }, [currentElements, missingRequired, requiredFields]);

  // 저장 버튼 클릭 핸들러: 필수 항목 미입력 시 경고 표시
  const handleConfirmClick = () => {
    if (!canConfirm) {
      setHasAttemptedSubmit(true);
      return;
    }
    onConfirm();
  };

  const renderField = (key: string, isRequired: boolean) => {
    const label = ELEMENT_LABELS[key] || key;
    const value = currentElements[key] || '';
    const isMissing = missingRequired.includes(key);
    const isEmpty = !value.trim();
    // 제출 시도 후에만 경고 표시
    const showWarning = hasAttemptedSubmit && isRequired && (isMissing || isEmpty);

    return (
      <div
        key={key}
        className="grid gap-2"
      >
        <Label
          htmlFor={key}
          className="flex items-center gap-1"
          required={isRequired}
        >
          {label}
        </Label>
        <Input
          id={key}
          value={value}
          onChange={(e) => onElementChange(key, e.target.value)}
          className={cn(showWarning && 'border-destructive focus-visible:ring-destructive')}
          placeholder={isRequired ? '필수 입력 항목입니다' : '선택 입력 항목입니다'}
        />
        {showWarning && (
          <p className="text-destructive text-sm font-medium">
            {isMissing
              ? '⚠️ 필수 항목입니다.'
              : '필수 항목입니다.'}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">AI 분석 결과 확인</h3>
        <p className="text-muted-foreground text-sm">
          AI가 분석한 게임 핵심 요소를 확인하고 수정해주세요. 정확한 정보는 더 나은 설문
          생성에 도움이 됩니다.
        </p>
      </div>

      <div className="grid gap-6">
        {/* 필수 항목 */}
        <Card>
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base font-semibold text-primary">
              📌 필수 항목
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 pt-4">
            {requiredFields.map((key) => renderField(key, true))}
          </CardContent>
        </Card>

        {/* 선택 항목 */}
        {optionalFields.length > 0 && (
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-semibold text-muted-foreground">
                💡 선택 항목 (더 정확한 질문 생성에 도움)
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 pt-4">
              {optionalFields.map((key) => renderField(key, false))}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-2">
          {onBack && (
            <Button
              variant="outline"
              onClick={onBack}
              type="button"
            >
              이전으로
            </Button>
          )}
          {onReanalyze && (
            <Button
              variant="ghost"
              onClick={onReanalyze}
              type="button"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              다시 분석하기
            </Button>
          )}
        </div>
        <div className="flex-1" /> {/* Spacer */}
        <Button
          onClick={handleConfirmClick}
          disabled={isSubmitting}
          className="min-w-[120px]"
        >
          {isSubmitting ? '저장 중...' : '확인 및 저장'}
        </Button>
      </div>
    </div>
  );
}
