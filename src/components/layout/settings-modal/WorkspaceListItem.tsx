import { Building2, Check } from 'lucide-react';

import type { Workspace } from '@/features/workspace';
import { cn } from '@/lib/utils';

interface WorkspaceListItemProps {
  workspace: Workspace;
  isSelected: boolean;
  onSelect: (workspace: Workspace) => void;
}

/**
 * WorkspaceListItem - 단일 워크스페이스 항목
 */
function WorkspaceListItem({
  workspace,
  isSelected,
  onSelect,
}: WorkspaceListItemProps) {
  return (
    <button
      type="button"
      key={workspace.workspaceUuid}
      onClick={() => onSelect(workspace)}
      className={cn(
        'flex items-center gap-3 rounded-lg border p-3 text-left transition-colors',
        isSelected
          ? 'border-primary bg-primary/5'
          : 'hover:bg-muted/50 border-transparent'
      )}
    >
      <div className="bg-primary/10 flex size-10 shrink-0 items-center justify-center rounded-lg">
        <Building2 className="text-primary size-5" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-foreground truncate text-sm font-medium">
          {workspace.name}
        </span>
        {workspace.description && (
          <span className="text-muted-foreground truncate text-xs">
            {workspace.description}
          </span>
        )}
        <span className="text-muted-foreground text-xs">
          게임 {workspace.gameCount}개
        </span>
      </div>
      {isSelected && <Check className="text-primary size-5 shrink-0" />}
    </button>
  );
}

export default WorkspaceListItem;
