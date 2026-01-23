import { useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { GameGenreConfig } from '@/features/game';

import type { QuestionAnalysisResult } from '../types';
import { getSentimentColorClass } from '../utils';
import { AnswerList, type AnswerListItem } from './AnswerList';
import { ClusterDetailPanel } from './ClusterDetailPanel';
import { ClusterSelector } from './ClusterSelector';
import { InsufficientDataWarning } from './InsufficientDataWarning';

// 성별 한글 변환
const getGenderLabel = (gender: string): string => {
  const map: Record<string, string> = {
    M: '남성',
    F: '여성',
    MALE: '남성',
    FEMALE: '여성',
    MAN: '남성',
    WOMAN: '여성',
  };
  return map[gender.toUpperCase()] ?? gender;
};

// 연령대 한글 변환
const getAgeGroupLabel = (ageGroup: string): string => {
  const normalized = ageGroup.toLowerCase().trim();
  const map: Record<string, string> = {
    '10s': '10대',
    '20s': '20대',
    '30s': '30대',
    '40s': '40대',
    '50s': '50대',
    '60s': '60대',
    '60+': '60대 이상',
    'teens': '10대',
    'twenties': '20대',
    'thirties': '30대',
    'forties': '40대',
    'fifties': '50대',
    'sixties': '60대',
  };
  return map[normalized] ?? ageGroup;
};

// 장르 한글 변환
const getGenreLabel = (genre: string): string => {
  // 대소문자 구분 없이 매핑
  const genreUpper = genre.toUpperCase().trim();

  // GameGenreConfig에서 찾기
  const config = GameGenreConfig[genreUpper as keyof typeof GameGenreConfig];
  if (config) {
    return config.label;
  }

  // 추가 매핑 (소문자나 다른 형식으로 올 경우 대비)
  const fallbackMap: Record<string, string> = {
    'ACTION': '액션',
    'ADVENTURE': '어드벤처',
    'SIMULATION': '시뮬레이션',
    'PUZZLE': '퍼즐',
    'STRATEGY': '전략',
    'RPG': 'RPG',
    'ARCADE': '아케이드',
    'HORROR': '호러',
    'SHOOTER': '슈팅',
    'VISUAL_NOVEL': '비주얼 노벨',
    'ROGUELIKE': '로그라이크',
    'SPORTS': '스포츠',
    'RHYTHM': '리듬',
    'FIGHTING': '대전',
    'CASUAL': '캐주얼',
  };

  return fallbackMap[genreUpper] ?? genre;
};

type QuestionAnalysisDetailProps = {
  readonly data: QuestionAnalysisResult;
};

/**
 * 질문별 상세 분석 뷰
 * 이미지 기반 새로운 UI:
 * - 상단: 전체 정보 요약
 * - 중단: 클러스터 선택 탭
 * - 하단: 선택된 클러스터 상세 + 원문 리스트
 */
function QuestionAnalysisDetail({ data }: QuestionAnalysisDetailProps) {
  const [selectedClusterIndex, setSelectedClusterIndex] = useState(0);

  // 데이터 유효성 검사
  // 1. clusters가 undefined면 아직 로딩 중 (분석 결과가 아직 없음)
  // 2. clusters가 빈 배열이면 분석 완료 but 클러스터 형성 실패 → 데이터 부족
  if (!data?.clusters) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        클러스터 데이터를 불러오는 중...
      </div>
    );
  }

  if (data.clusters.length === 0) {
    return <InsufficientDataWarning />;
  }

  // 선택된 인덱스가 범위를 벗어나면 0으로 리셋
  const safeClusterIndex = selectedClusterIndex < data.clusters.length ? selectedClusterIndex : 0;

  // 현재 선택된 클러스터
  const selectedCluster = data.clusters[safeClusterIndex];

  // 현재 선택된 클러스터의 대표 답변 텍스트 매핑
  const representativeAnswers = selectedCluster?.representative_answers ?? [];
  const answerIds = selectedCluster?.answer_ids ?? [];
  const answerList: AnswerListItem[] = representativeAnswers.map((text, index) => {
    // answer_ids와 representative_answers는 같은 인덱스로 매핑됨
    const answerId = answerIds[index];
    const profile = answerId ? data.answer_profiles?.[answerId] : undefined;

    // 프로필 태그 생성: 성별, 나이, 선호장르
    const tags: string[] = [];
    if (profile) {
      if (profile.gender) {
        tags.push(getGenderLabel(profile.gender));
      }
      if (profile.age_group) {
        tags.push(getAgeGroupLabel(profile.age_group));
      }
      if (profile.prefer_genre) {
        tags.push(getGenreLabel(profile.prefer_genre));
      }
    }

    return {
      id: `answer-${index}`,
      text: text,

      tags: tags.length > 0 ? tags : undefined,
    };
  });



  return (
    <div className="space-y-6">
      {/* 상단: 전체 요약 정보 */}
      <Card className="border-primary/20 bg-linear-to-r from-primary/5 to-accent/5">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-foreground">
                질문 분석 결과
              </h2>
              <p className="text-sm text-muted-foreground">
                응답 {data.total_answers}개 • 공감 {data.sentiment.score}%
              </p>
            </div>
            
            <Badge className={`px-3 py-1 text-sm font-semibold ${getSentimentColorClass(data.sentiment.score, 'bg')} ${getSentimentColorClass(data.sentiment.score, 'bg').replace('bg-', 'text-')}-foreground`}>
              {data.sentiment.score}점
            </Badge>
          </div>
        </CardHeader>
        
        {data.meta_summary && (
          <CardContent className="pt-0">
            <p className="text-sm leading-relaxed text-foreground/80">
              {data.meta_summary}
            </p>
          </CardContent>
        )}
      </Card>

      {/* 중단: 클러스터 선택 탭 */}
      <Card>
        <CardHeader className="pb-3">
          <h3 className="text-sm font-semibold text-foreground">
            질문별 응답 요약 (의견 클러스터링)
          </h3>
        </CardHeader>
        <CardContent className="pt-0">
          <ClusterSelector
            clusters={data.clusters}
            selectedClusterIndex={safeClusterIndex}
            onSelectCluster={setSelectedClusterIndex}
          />
        </CardContent>
      </Card>

      {/* 하단: 선택된 클러스터 상세 */}
      {selectedCluster && (
        <>
          <ClusterDetailPanel
            cluster={selectedCluster}
            profiles={data.answer_profiles}
          />

          {/* 대표 답변 */}
          <AnswerList
            answers={answerList}
            title={`대표 답변 (${answerList.length}개)`}
          />
        </>
      )}
    </div>
  );
}

export { QuestionAnalysisDetail };
