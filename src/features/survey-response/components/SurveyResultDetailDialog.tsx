import { useQuery } from '@tanstack/react-query';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/Accordion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';

import { getSurveyResultDetails } from '../api/get-survey-result-details';
import type { QuestionAnswerExcerpt, SurveySessionStatus } from '../types';

const STATUS_LABELS: Record<string, string> = {
  COMPLETED: '완료',
  IN_PROGRESS: '진행 중',
  ABANDONED: '중단',
};

function getStatusClassName(status: SurveySessionStatus): string {
  if (status === 'COMPLETED') return 'text-success';
  if (status === 'IN_PROGRESS') return 'text-info';
  return 'text-destructive';
}

type SurveyResultDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  surveyId: number;
  sessionId: number;
};

/**
 * 설문 응답 상세 다이얼로그
 * - 세션별 상세 응답 정보 표시
 * - 각 질문은 아코디언으로 펼쳐서 확인 가능
 */
function SurveyResultDetailDialog({
  open,
  onOpenChange,
  surveyId,
  sessionId,
}: SurveyResultDetailDialogProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['survey-result-details', surveyId, sessionId],
    queryFn: () => getSurveyResultDetails({ surveyId, sessionId }),
    enabled: open && !!surveyId && !!sessionId,
  });

  const details = data?.result;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <DialogHeader className="text-center">
          <DialogTitle>응답 상세</DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="text-muted-foreground py-8 text-center">
            데이터를 불러오는 중...
          </div>
        )}

        {isError && (
          <div className="text-destructive py-8 text-center">
            데이터를 불러오는 중 오류가 발생했습니다.
          </div>
        )}

        {details && (
          <div className="space-y-4">
            {/* 세션 정보 */}
            <div className="bg-muted/50 rounded-lg p-4">
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">설문명</dt>
                  <dd className="font-medium">{details.session.survey_name}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">상태</dt>
                  <dd
                    className={`font-medium ${getStatusClassName(details.session.status)}`}
                  >
                    {STATUS_LABELS[details.session.status] ??
                      details.session.status}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">테스터 ID</dt>
                  <dd className="font-medium">{details.session.tester_id}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">종료일시</dt>
                  <dd className="font-medium">
                    {details.session.ended_at
                      ? new Date(details.session.ended_at).toLocaleString(
                          'ko-KR'
                        )
                      : '-'}
                  </dd>
                </div>
              </dl>
            </div>

            {/* 질문별 응답 아코디언 */}
            <Accordion
              type="single"
              collapsible
              className="w-full"
            >
              {details.by_fixed_question.map((fq) => (
                <AccordionItem
                  key={fq.fixed_q_id}
                  value={`q-${fq.fixed_q_id}`}
                >
                  <AccordionTrigger className="text-left font-bold">
                    {fq.fixed_question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      {fq.excerpt.map((qa, idx) => (
                        <QuestionAnswerBlock
                          key={idx}
                          qa={qa}
                        />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

type QuestionAnswerBlockProps = {
  qa: QuestionAnswerExcerpt;
};

function QuestionAnswerBlock({ qa }: QuestionAnswerBlockProps) {
  const isFixed = qa.q_type === 'FIXED';

  return (
    <div className="border-border rounded-md border p-3">
      <div className="mb-2 flex items-center gap-2">
        <span
          className={`rounded px-2 py-0.5 text-xs font-medium ${
            isFixed
              ? 'bg-primary/10 text-primary'
              : 'bg-accent/10 text-accent-foreground'
          }`}
        >
          {isFixed ? '고정 질문' : '꼬리 질문'}
        </span>
      </div>
      <p className="text-muted-foreground mb-1 text-sm">{qa.question_text}</p>
      <p className="text-sm font-medium">{qa.answer_text}</p>
    </div>
  );
}

export { SurveyResultDetailDialog };
