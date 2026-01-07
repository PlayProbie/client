import { Check } from 'lucide-react';

import { ScrollArea, ScrollBar } from '@/components/ui/ScrollArea';

import type { ClusterInfo } from '../types';

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
  const getSatisfactionColor = (score: number) => {
    if (score >= 60) return 'text-success';
    if (score >= 40) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-3 pb-3">
        {clusters.map((cluster, index) => {
          const isSelected = selectedClusterIndex === index;
          
          return (
            <button
              key={`cluster-${cluster.summary}-${index}`}
              onClick={() => onSelectCluster(index)}
              className={`group relative flex min-w-55 flex-col items-start rounded-lg border p-4 transition-all ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border bg-card hover:border-primary/50 hover:shadow-sm'
              }`}
            >
              {/* 선택 체크 표시 */}
              {isSelected && (
                <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
              
              <div className="mb-2 flex w-full items-start justify-between gap-2">
                <p className={`line-clamp-2 whitespace-normal text-left text-sm font-medium leading-snug ${
                  isSelected ? 'text-primary' : 'text-foreground'
                }`}>
                  {cluster.summary}
                </p>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isSelected 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {cluster.percentage}%
                </div>
              </div>
              
              <div className="flex w-full items-center gap-2 text-xs text-muted-foreground">
                <span>응답 {cluster.count}개</span>
                <span>•</span>
                <span className={`font-semibold ${getSatisfactionColor(cluster.satisfaction)}`}>
                  {cluster.satisfaction}점
                </span>
              </div>
            </button>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

export { ClusterSelector };
