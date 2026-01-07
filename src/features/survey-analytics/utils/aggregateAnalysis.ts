import type { GEQScores, QuestionAnalysisResult } from '../types';

/**
 * 전체 질문 분석 결과에서 평균 GEQ 점수 계산
 */
function calculateAverageGEQ(
  analysisMap: Record<number, QuestionAnalysisResult>
): GEQScores {
  const questionIds = Object.keys(analysisMap).map(Number);

  if (questionIds.length === 0) {
    return {
      competence: 0,
      immersion: 0,
      flow: 0,
      tension: 0,
      challenge: 0,
      positive_affect: 0,
      negative_affect: 0,
    };
  }

  // 모든 클러스터의 GEQ 점수를 가중 평균으로 계산
  let totalWeight = 0;
  const sums: GEQScores = {
    competence: 0,
    immersion: 0,
    flow: 0,
    tension: 0,
    challenge: 0,
    positive_affect: 0,
    negative_affect: 0,
  };

  questionIds.forEach((questionId) => {
    const analysis = analysisMap[questionId];
    analysis.clusters.forEach((cluster) => {
      const weight = cluster.count;
      totalWeight += weight;

      sums.competence += cluster.geq_scores.competence * weight;
      sums.immersion += cluster.geq_scores.immersion * weight;
      sums.flow += cluster.geq_scores.flow * weight;
      sums.tension += cluster.geq_scores.tension * weight;
      sums.challenge += cluster.geq_scores.challenge * weight;
      sums.positive_affect += cluster.geq_scores.positive_affect * weight;
      sums.negative_affect += cluster.geq_scores.negative_affect * weight;
    });
  });

  if (totalWeight === 0) {
    return sums;
  }

  return {
    competence: Math.round(sums.competence / totalWeight),
    immersion: Math.round(sums.immersion / totalWeight),
    flow: Math.round(sums.flow / totalWeight),
    tension: Math.round(sums.tension / totalWeight),
    challenge: Math.round(sums.challenge / totalWeight),
    positive_affect: Math.round(sums.positive_affect / totalWeight),
    negative_affect: Math.round(sums.negative_affect / totalWeight),
  };
}

/**
 * 전체 질문 분석 결과에서 평균 감정 점수 계산
 */
function calculateAverageSentiment(
  analysisMap: Record<number, QuestionAnalysisResult>
): {
  averageScore: number;
  distribution: { positive: number; neutral: number; negative: number };
} {
  const questionIds = Object.keys(analysisMap).map(Number);

  if (questionIds.length === 0) {
    return {
      averageScore: 0,
      distribution: { positive: 0, neutral: 0, negative: 0 },
    };
  }

  let totalWeight = 0;
  let weightedScore = 0;
  let weightedPositive = 0;
  let weightedNeutral = 0;
  let weightedNegative = 0;

  questionIds.forEach((questionId) => {
    const analysis = analysisMap[questionId];
    const weight = analysis.total_answers;

    if (weight > 0) {
      totalWeight += weight;
      weightedScore += analysis.sentiment.score * weight;
      weightedPositive += analysis.sentiment.distribution.positive * weight;
      weightedNeutral += analysis.sentiment.distribution.neutral * weight;
      weightedNegative += analysis.sentiment.distribution.negative * weight;
    }
  });

  if (totalWeight === 0) {
    return {
      averageScore: 0,
      distribution: { positive: 0, neutral: 0, negative: 0 },
    };
  }

  return {
    averageScore: Math.round(weightedScore / totalWeight),
    distribution: {
      positive: Math.round(weightedPositive / totalWeight),
      neutral: Math.round(weightedNeutral / totalWeight),
      negative: Math.round(weightedNegative / totalWeight),
    },
  };
}

/**
 * 전체 응답 수 계산
 */
function calculateTotalAnswers(
  analysisMap: Record<number, QuestionAnalysisResult>
): number {
  return Object.values(analysisMap).reduce(
    (sum, analysis) => sum + analysis.total_answers,
    0
  );
}

/**
 * 감정 점수에 따른 라벨 반환
 */
function getSentimentLabel(score: number): string {
  if (score >= 80) return '매우 긍정적';
  if (score >= 60) return '긍정적';
  if (score >= 40) return '보통';
  if (score >= 20) return '부정적';
  return '매우 부정적';
}

/**
 * 감정 점수에 따른 색상 클래스 반환
 */
function getSentimentColorClass(score: number): string {
  if (score >= 70) return 'text-success';
  if (score >= 50) return 'text-warning';
  return 'text-destructive';
}

export {
  calculateAverageGEQ,
  calculateAverageSentiment,
  calculateTotalAnswers,
  getSentimentColorClass,
  getSentimentLabel,
};
