import { Building2, ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui';

import { MOCK_USER } from '../sidebar-components';

function WorkspaceSelector() {
  return (
    <div className="border-border mr-2 flex items-center gap-4 border-r pr-6">
      <Button
        variant="ghost"
        className="gap-2"
      >
        <div className="bg-success/20 flex size-6 items-center justify-center rounded">
          <Building2 className="text-success size-3.5 stroke-2" />
        </div>
        {MOCK_USER.workspace.name}
        <ChevronDown className="size-4 stroke-2" />
      </Button>
    </div>
  );
}

export default WorkspaceSelector;
