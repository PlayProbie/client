/**
 * ProvisioningStatusWidget - 플로팅 프로비저닝 상태 위젯
 * 우측 하단에 고정되어 프로비저닝 진행 상태를 표시
 */
import { Server } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import { ScrollArea } from '@/components/ui/ScrollArea';
import {
  ProvisioningStatus,
  selectActiveCount,
  selectCompletedCount,
  selectHasActiveProvisioning,
  useProvisioningStore,
} from '@/stores/useProvisioningStore';

import { ProvisioningItemRow } from './ProvisioningItemRow';
import { StatusWidgetContainer } from './StatusWidgetContainer';
import { StatusWidgetHeader } from './StatusWidgetHeader';

export function ProvisioningStatusWidget() {
  const {
    items,
    isMinimized,
    isVisible,
    hasActiveProvisioning,
    activeCount,
    toggleMinimize,
    hideWidget,
    removeItem,
  } = useProvisioningStore(
    useShallow((state) => ({
      items: state.items,
      isMinimized: state.isMinimized,
      isVisible: state.isVisible,
      hasActiveProvisioning: selectHasActiveProvisioning(state),
      activeCount: selectActiveCount(state),
      completedCount: selectCompletedCount(state),
      toggleMinimize: state.toggleMinimize,
      hideWidget: state.hideWidget,
      removeItem: state.removeItem,
      clearCompleted: state.clearCompleted,
    }))
  );

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!hasActiveProvisioning) return;

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [hasActiveProvisioning]);

  // 프로비저닝 항목이 없거나 숨김 상태면 렌더링 안 함
  if (items.length === 0 || !isVisible) {
    return null;
  }

  return (
    <StatusWidgetContainer bottomPosition="bottom-44">
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
        showAction={true}
        onAction={hideWidget}
        actionLabel="닫기"
      />

      {/* Content (최소화 상태가 아닐 때만) */}
      {!isMinimized && (
        <ScrollArea className="max-h-60">
          <div className="divide-y">
            {items.map((item) => {
              const isActive =
                item.status === ProvisioningStatus.CREATING ||
                item.status === ProvisioningStatus.PROVISIONING ||
                item.status === ProvisioningStatus.READY;
              return (
                <ProvisioningItemRow
                  key={item.id}
                  item={item}
                  now={isActive ? now : undefined}
                  onRemove={removeItem}
                />
              );
            })}
          </div>
        </ScrollArea>
      )}
    </StatusWidgetContainer>
  );
}
