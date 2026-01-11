/**
 * SurveySessionStartPage - 새 설문 세션 생성 및 테스터 정보 입력
 * URL: /surveys/session/:surveyUuid
 */

import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { Spinner } from '@/components/ui/loading';
import { createChatSession } from '@/features/survey-session';
import type { TesterProfile } from '@/features/survey-session/types';

function SurveySessionStartPage() {
  const { surveyUuid } = useParams<{ surveyUuid: string }>();
  const [searchParams] = useSearchParams();
  const sessionUuid = searchParams.get('sessionUuid');
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [gender, setGender] = useState<string>('');
  const [ageGroup, setAgeGroup] = useState<string>('');
  const [preferGenre, setPreferGenre] = useState<string>('');

  const handleStart = async () => {
    if (!surveyUuid) {
      setError('잘못된 설문 UUID입니다.');
      return;
    }

    if (!gender || !ageGroup || !preferGenre) {
      setError('모든 정보를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const profile: TesterProfile = {
        gender,
        ageGroup,
        preferGenre,
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
            테스터 정보 입력
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

          {/* 선호 장르 입력 */}
          <div className="space-y-2">
            <Label>선호하는 게임 장르</Label>
            <Input
              placeholder="예: RPG, FPS, 퍼즐 등"
              value={preferGenre}
              onChange={(e) => setPreferGenre(e.target.value)}
            />
          </div>

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
