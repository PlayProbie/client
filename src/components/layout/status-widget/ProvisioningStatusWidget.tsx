/**
 * ProvisioningStatusWidget - 플로팅 프로비저닝 상태 위젯
 * 우측 하단에 고정되어 프로비저닝 진행 상태를 표시
 */
import { Server } from 'lucide-react';

import { ScrollArea } from '@/components/ui/ScrollArea';
import {
  selectActiveCount,
  selectCompletedCount,
  selectHasActiveProvisioning,
  useProvisioningStore,
} from '@/stores/useProvisioningStore';

import { ProvisioningItemRow } from './ProvisioningItemRow';
import { StatusWidgetContainer } from './StatusWidgetContainer';
import { StatusWidgetHeader } from './StatusWidgetHeader';

export function ProvisioningStatusWidget() {
  const items = useProvisioningStore((state) => state.items);
  const isMinimized = useProvisioningStore((state) => state.isMinimized);
  const hasActiveProvisioning = useProvisioningStore(
    selectHasActiveProvisioning
  );

  const activeCount = useProvisioningStore(selectActiveCount);
  const completedCount = useProvisioningStore(selectCompletedCount);

  const toggleMinimize = useProvisioningStore((state) => state.toggleMinimize);
  const removeItem = useProvisioningStore((state) => state.removeItem);
  const clearCompleted = useProvisioningStore((state) => state.clearCompleted);

  // 프로비저닝 항목이 없으면 위젯 숨김
  if (items.length === 0) {
    return null;
  }

  return (
    <StatusWidgetContainer bottomPosition="bottom-28">
      <StatusWidgetHeader
        icon={<Server className="size-4" />}
        title="프로비저닝"
        count={items.length}
        progressInfo={
          hasActiveProvisioning && activeCount > 0 ? (
            <span className="text-muted-foreground ml-1 text-xs">
              진행 중 {activeCount}
            </span>
          ) : undefined
        }
        isMinimized={isMinimized}
        onToggleMinimize={toggleMinimize}
        showClearCompleted={completedCount > 0}
        onClearCompleted={clearCompleted}
      />

      {/* Content (최소화 상태가 아닐 때만) */}
      {!isMinimized && (
        <ScrollArea className="max-h-60">
          <div className="divide-y">
            {items.map((item) => (
              <ProvisioningItemRow
                key={item.id}
                item={item}
                onRemove={removeItem}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </StatusWidgetContainer>
  );
}
