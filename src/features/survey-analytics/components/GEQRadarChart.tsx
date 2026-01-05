import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts';

import type { GEQScores } from '../types';

type GEQRadarChartProps = {
  readonly scores: GEQScores;
  readonly className?: string;
};

/**
 * GEQ 7차원 점수 레이더 차트
 */
function GEQRadarChart({ scores, className }: GEQRadarChartProps) {
  // 데이터 변환
  // Recharts RadarChart에 맞는 형식으로 변환
  const data = [
    { subject: '성취감', value: scores.competence, fullMark: 10 },
    { subject: '몰입감', value: scores.immersion, fullMark: 10 },
    { subject: '집중도', value: scores.flow, fullMark: 10 },
    { subject: '긴장감', value: scores.tension, fullMark: 10 },
    { subject: '도전감', value: scores.challenge, fullMark: 10 },
    { subject: '즐거움', value: scores.positive_affect, fullMark: 10 },
    { subject: '불쾌감', value: scores.negative_affect, fullMark: 10 },
  ];

  return (
    <div className={`h-64 w-full ${className ?? ''}`}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="var(--color-border)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 10]}
            tick={false}
            axisLine={false}
          />
          <Radar
            name="GEQ 점수"
            dataKey="value"
            stroke="var(--color-primary)"
            strokeWidth={2}
            fill="var(--color-primary)"
            fillOpacity={0.3}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export { GEQRadarChart };
