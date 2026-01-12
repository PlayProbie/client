/**
 * SurveySessionStartPage - 새 설문 세션 생성 및 테스터 정보 입력
 * URL: /surveys/session/:surveyUuid
 */

import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Clock } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import {
  Button,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { CheckboxGroup } from '@/components/ui/CheckboxGroup';
import { PageSpinner, Spinner } from '@/components/ui/loading';
import { GAME_GENRE_OPTIONS } from '@/constants';
import { getSurveys } from '@/features/survey-design/api/get-surveys';
import { SurveyStatusConfig } from '@/features/survey-design/types';
import { createChatSession } from '@/features/survey-session';
import type { TesterProfile } from '@/features/survey-session/types';

function SurveySessionStartPage() {
  const { surveyUuid } = useParams<{ surveyUuid: string }>();
  const [searchParams] = useSearchParams();
  const sessionUuid = searchParams.get('sessionUuid');
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 설문 상태 확인을 위한 쿼리
  const { data: surveysData, isLoading: isSurveysLoading } = useQuery({
    queryKey: ['surveys'],
    queryFn: getSurveys,
    enabled: !!surveyUuid,
  });

  // Form State
  const [gender, setGender] = useState<string>('');
  const [ageGroup, setAgeGroup] = useState<string>('');
  const [preferGenre, setPreferGenre] = useState<string[]>([]);

  // 설문 로딩 중
  if (isSurveysLoading) {
    return <PageSpinner message="설문 정보를 불러오는 중입니다..." />;
  }

  const targetSurvey = surveysData?.result.find(
    (s) => s.survey_uuid === surveyUuid
  );

  // 설문이 존재하지 않거나, 진행 중(ACTIVE) 상태가 아닌 경우
  if (
    !targetSurvey ||
    targetSurvey.status !== SurveyStatusConfig.ACTIVE.value
  ) {
    return (
      <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4 py-8">
        <div className="flex w-full max-w-md flex-col items-center space-y-6 text-center">
          <div className="bg-muted flex size-20 items-center justify-center rounded-full">
            {targetSurvey?.status === SurveyStatusConfig.CLOSED.value ? (
              <AlertCircle className="text-muted-foreground size-10" />
            ) : (
              <Clock className="text-muted-foreground size-10" />
            )}
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {!targetSurvey
                ? '설문을 찾을 수 없습니다'
                : targetSurvey.status === SurveyStatusConfig.CLOSED.value
                  ? '종료된 설문입니다'
                  : '설문이 아직 시작되지 않았습니다'}
            </h1>
            <p className="text-muted-foreground">
              {!targetSurvey
                ? '올바른 설문 주소인지 확인해주세요.'
                : targetSurvey.status === SurveyStatusConfig.CLOSED.value
                  ? '참여해주셔서 감사합니다. 이미 종료된 설문입니다.'
                  : '설문 시작 전입니다. 잠시만 기다려주세요.'}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/')}
          >
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const handleStart = async () => {
    if (!surveyUuid) {
      setError('잘못된 설문 UUID입니다.');
      return;
    }

    if (!gender || !ageGroup || preferGenre.length === 0) {
      setError('모든 정보를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const profile: TesterProfile = {
        gender,
        ageGroup,
        preferGenre: preferGenre.join(', '), // DB 호환을 위해 콤마로 연결
      };

      const response = await createChatSession({
        surveyUuid: surveyUuid,
        testerProfile: profile,
        sessionUuid: sessionUuid || undefined,
      });

      const { session, sse_url: sseUrl } = response.result;

      // 세션 정보를 state로 전달하면서 리다이렉트
      navigate(`/surveys/session/sessions/${session.session_uuid}`, {
        replace: true,
        state: {
          surveyUuid: session.survey_uuid,
          sessionUuid: session.session_uuid,
          sseUrl: sseUrl,
        },
      });
    } catch {
      // 에러 로깅은 생략
      setError('세션 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4">
        <Spinner
          size="lg"
          className="text-primary mb-4"
        />
        <p className="text-muted-foreground">인터뷰를 준비하고 있습니다...</p>
      </div>
    );
  }

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            테스터 정보 입력 ({targetSurvey.survey_name})
          </h1>
          <p className="text-muted-foreground mt-2">
            원활한 인터뷰 진행을 위해 간단한 정보를 입력해주세요.
          </p>
        </div>

        <div className="space-y-6 rounded-lg border p-6 shadow-sm">
          {/* 성별 선택 */}
          <div className="space-y-2">
            <Label>성별</Label>
            <Select
              onValueChange={setGender}
              value={gender}
            >
              <SelectTrigger>
                <SelectValue placeholder="성별을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">남성</SelectItem>
                <SelectItem value="FEMALE">여성</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 연령대 선택 */}
          <div className="space-y-2">
            <Label>연령대</Label>
            <Select
              onValueChange={setAgeGroup}
              value={ageGroup}
            >
              <SelectTrigger>
                <SelectValue placeholder="연령대를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10s">10대</SelectItem>
                <SelectItem value="20s">20대</SelectItem>
                <SelectItem value="30s">30대</SelectItem>
                <SelectItem value="40s">40대</SelectItem>
                <SelectItem value="50s">50대 이상</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 선호 장르 선택 */}
          <CheckboxGroup
            id="preferGenre"
            label="선호하는 게임 장르"
            options={GAME_GENRE_OPTIONS}
            value={preferGenre}
            onChange={setPreferGenre}
            columns={2}
            maxSelection={3}
          />

          {error && (
            <p className="text-destructive text-sm font-medium">{error}</p>
          )}

          <Button
            className="w-full"
            size="lg"
            onClick={handleStart}
          >
            인터뷰 시작하기
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SurveySessionStartPage;
