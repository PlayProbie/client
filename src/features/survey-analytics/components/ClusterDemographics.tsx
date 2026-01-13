import { User } from 'lucide-react';
import { useMemo } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/progress';
import { type AnswerProfile,parsePreferGenre } from '@/features/survey-analytics';

interface ClusterDemographicsProps {
  answerIds?: string[];
  profiles?: Record<string, AnswerProfile>;
}


// 연령대 라벨 변환 (e.g., '20s' -> '20대')
const formatAgeGroup = (age: string) => {
  if (age.endsWith('s')) return age.replace('s', '대');
  return age;
};

export function ClusterDemographics({
  answerIds = [],
  profiles = {},
}: ClusterDemographicsProps) {
  const stats = useMemo(() => {
    const rawStats = {
      gender: { M: 0, F: 0, Unknown: 0 },
      ageGroup: {} as Record<string, number>,
      genre: {} as Record<string, number>,
      totalCount: 0,
    };

    if (!answerIds || answerIds.length === 0) {
      return { gender: { m: 0, f: 0, u: 0, mPct: 0, fPct: 0 }, ageGroup: [], genre: [], totalCount: 0, ageScaleMax: 100 };
    }

    answerIds.forEach((id) => {
      const profile = profiles[id];
      if (!profile) return;

      rawStats.totalCount++;

      // Gender
      const g =
        profile.gender === 'MALE'
          ? 'M'
          : profile.gender === 'FEMALE'
            ? 'F'
            : 'Unknown';
      rawStats.gender[g]++;

      // Age Group
      if (profile.age_group) {
        rawStats.ageGroup[profile.age_group] =
          (rawStats.ageGroup[profile.age_group] || 0) + 1;
      }

      // Genre
      const genres = parsePreferGenre(profile.prefer_genre);
      genres.forEach((genre) => {
        rawStats.genre[genre] = (rawStats.genre[genre] || 0) + 1;
      });
    });

    // Age Group Processing (All fixed ranges + sorting)

    const ageDataSorted = Object.entries(rawStats.ageGroup)
      .map(([name, value]) => ({ 
        name: formatAgeGroup(name), 
        count: value,
        percent: Math.round((value / rawStats.totalCount) * 100)
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    // Calculate max scale for Relative Scaling
    // 최대값이 작을 경우 시각적 변별력을 위해 스케일을 조정 (buffer 1.5x)
    const maxAgePercent = Math.max(...ageDataSorted.map(d => d.percent), 0);
    const scaleMax = Math.min(100, Math.ceil((maxAgePercent * 1.5) / 10) * 10);

    // Genre Processing
    const genreData = Object.entries(rawStats.genre)
      .map(([name, value]) => ({ 
        name, 
        count: value,
        percent: Math.round((value / rawStats.totalCount) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5

    // Calculate percentages safely
    const total = rawStats.totalCount;
    const mPct = total > 0 ? Math.round((rawStats.gender.M / total) * 100) : 0;
    const fPct = total > 0 ? Math.round((rawStats.gender.F / total) * 100) : 0;

    return {
      gender: { 
        m: rawStats.gender.M, 
        f: rawStats.gender.F, 
        u: rawStats.gender.Unknown,
        mPct,
        fPct,
      },
      ageGroup: ageDataSorted,
      ageScaleMax: scaleMax, // Return calculated scale
      genre: genreData,
      totalCount: rawStats.totalCount,
    };
  }, [answerIds, profiles]);

  if (stats.totalCount === 0) return null;

  return (
    <div className="rounded-lg border bg-card p-5 shadow-sm">
       {/* Header */}
       <div className="mb-6 flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <h4 className="font-semibold text-foreground">테스터 분포</h4>
        </div>

      {/* 1. 성별 (Gender) - Custom Stacked Bar (Progress 컴포넌트는 단일 값만 지원하므로 유지) */}
      <div className="mb-6 space-y-4">
        <span className="block text-sm font-semibold text-foreground">성별</span>
        <div className="flex h-9 w-full overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800 text-sm font-medium text-white shadow-inner filter-none">
          {stats.gender.mPct > 0 && (
            <div 
              style={{ width: `${stats.gender.mPct}%` }} 
              className="flex items-center justify-center bg-blue-500"
            >
              남성 {stats.gender.mPct}%
            </div>
          )}
          {stats.gender.fPct > 0 && (
            <div 
              style={{ width: `${stats.gender.fPct}%` }} 
              className="flex items-center justify-center bg-pink-500"
            >
              여성 {stats.gender.fPct}%
            </div>
          )}
        </div>
      </div>

      {/* 2. 나이 (Age) - Use Progress Component with Relative Scaling */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="block text-sm font-semibold text-foreground">나이</span>
        </div>
        <div className="space-y-3">
          {stats.ageGroup.map((age) => (
            <div key={age.name} className="flex items-center gap-3 text-xs">
              <span className="w-8 shrink-0 text-muted-foreground">{age.name}</span>
              <Progress 
                // 시각적 길이는 scaleMax 대비 비율로 설정
                value={(age.percent / (stats.ageScaleMax || 100)) * 100} 
                className="h-2.5 bg-slate-100 dark:bg-slate-800 [&>div]:bg-blue-500" 
              />
              <span className="w-8 shrink-0 text-right font-medium text-foreground">{age.percent}%</span>
            </div>
          ))}
          {stats.ageGroup.length === 0 && (
             <div className="text-xs text-muted-foreground">데이터 없음</div>
          )}
        </div>
      </div>

      {/* 3. 선호 장르 (Genre) - Use Badge Component */}
      <div className="space-y-4">
        <span className="block text-sm font-semibold text-foreground">선호 장르</span>
        <div className="flex flex-wrap gap-2">
          {stats.genre.map((genre) => (
            <Badge 
              key={genre.name} 
              variant="secondary"
              className="flex items-center gap-1.5 rounded-md bg-blue-50 dark:bg-blue-950/30 px-2.5 py-1.5 text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50"
            >
              <span className="text-blue-600 dark:text-blue-400">{genre.name}</span>
              <span className="text-blue-400/80 dark:text-blue-500/80">{genre.percent}%</span>
            </Badge>
          ))}
          {stats.genre.length === 0 && (
             <span className="text-xs text-muted-foreground">-</span>
          )}
        </div>
      </div>
    </div>
  );
}
