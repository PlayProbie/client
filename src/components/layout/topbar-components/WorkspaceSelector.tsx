import { Building2, ChevronDown } from 'lucide-react';

import { MOCK_USER } from '../sidebar-components';

function WorkspaceSelector() {
  return (
    <div className="border-border mr-2 flex items-center gap-4 border-r pr-6">
      <button className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm font-medium transition-colors">
        <div className="bg-success/20 flex size-6 items-center justify-center rounded">
          <Building2 className="text-success size-3.5 stroke-2" />
        </div>
        {MOCK_USER.workspace.name}
        <ChevronDown className="size-4 stroke-2" />
      </button>
    </div>
  );
}

export default WorkspaceSelector;
