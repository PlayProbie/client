/**
 * SurveyOpenStep - 설문 오픈 단계
 * Step 3: 오픈 완료 안내 및 개요 페이지 이동
 */
import { PartyPopper } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';

interface SurveyOpenStepProps {
  gameUuid: string;
  surveyUuid: string;
}

export function SurveyOpenStep({ gameUuid, surveyUuid }: SurveyOpenStepProps) {
  return (
    <div className="flex flex-col items-center gap-8 py-8">
      {/* 성공 헤더 */}
      <div className="flex flex-col items-center gap-4">
        <div className="bg-success/10 text-success flex size-20 items-center justify-center rounded-full">
          <PartyPopper className="size-10" />
        </div>
        <div className="text-center">
          <h3 className="text-2xl font-bold">
            리소스 설정이 성공적으로 저장되었습니다!
          </h3>
          <p className="text-muted-foreground mt-2">
            설문 관리 메뉴의 개요 페이지에서 설문을 시작해 보세요.
          </p>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-4">
        <Button
          size="lg"
          asChild
        >
          <Link to={`/games/${gameUuid}/surveys/${surveyUuid}/overview`}>
            설문 개요로 이동
          </Link>
        </Button>
      </div>
    </div>
  );
}
