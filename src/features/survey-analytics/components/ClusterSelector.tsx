import { Check } from 'lucide-react';

import type { ClusterInfo } from '../types';
import { getSentimentColorClass } from '../utils';

type ClusterSelectorProps = {
  readonly clusters: ClusterInfo[];
  readonly selectedClusterIndex: number;
  readonly onSelectCluster: (index: number) => void;
};

/**
 * 클러스터 선택 탭
 * 이미지의 상단 클러스터 선택 UI
 */
function ClusterSelector({
  clusters,
  selectedClusterIndex,
  onSelectCluster,
}: ClusterSelectorProps) {


  return (
    <div className="grid grid-cols-1 gap-3">
      {clusters.map((cluster, index) => {
        const isSelected = selectedClusterIndex === index;
        
        return (
          <button
            key={`cluster-${cluster.summary}-${index}`}
            onClick={() => onSelectCluster(index)}
            className={`group relative flex w-full flex-col items-start rounded-lg border p-4 text-left transition-all ${
              isSelected
                ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary'
                : 'border-border bg-card hover:border-primary/50 hover:shadow-sm'
            }`}
          >
            {/* 선택 체크 표시 (우측 상단) */}
            {isSelected && (
              <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                <Check className="h-3 w-3 text-primary-foreground" />
              </div>
            )}
            
            {/* 상단: 요약 & 퍼센티지 */}
            <div className="mb-2 flex w-full items-start justify-between gap-4 pr-6">
              <p className={`line-clamp-2 text-sm font-medium leading-relaxed ${
                isSelected ? 'text-primary' : 'text-foreground'
              }`}>
                {cluster.summary}
              </p>
              <div className={`flex h-6 shrink-0 items-center justify-center rounded-full px-2 text-xs font-bold ${
                isSelected 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {cluster.percentage}%
              </div>
            </div>
            
            {/* 하단: 메타 정보 */}
            <div className="flex w-full items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                응답 {cluster.count}개
              </span>
              <span>•</span>
              <span className={`font-semibold ${getSentimentColorClass(cluster.satisfaction)}`}>
                만족도 {cluster.satisfaction}점
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export { ClusterSelector };
