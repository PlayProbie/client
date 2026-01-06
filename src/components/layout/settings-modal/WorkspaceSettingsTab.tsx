import { Building2, Users } from 'lucide-react';

import { MOCK_USER } from '@/components/layout/types';
import { Button } from '@/components/ui';

/**
 * WorkspaceSettingsTab - 워크스페이스 관리 탭
 * - 워크스페이스 정보 표시
 * - 팀원 관리 링크
 */
function WorkspaceSettingsTab() {
  return (
    <div className="flex flex-col gap-6">
      {/* 워크스페이스 정보 */}
      <div className="bg-muted/50 flex items-center gap-4 rounded-lg p-4">
        <div className="bg-primary/10 flex size-12 items-center justify-center rounded-lg">
          <Building2 className="text-primary size-6" />
        </div>
        <div className="flex flex-col">
          <p className="text-foreground text-lg font-semibold">
            {MOCK_USER.workspace.name}
          </p>
          <div className="flex items-center gap-2">
            <span className="bg-primary/10 text-primary rounded px-2 py-0.5 text-xs font-medium">
              {MOCK_USER.workspace.role}
            </span>
            <span className="text-muted-foreground text-xs">
              {MOCK_USER.workspace.permission}
            </span>
          </div>
        </div>
      </div>

      {/* 구분선 */}
      <div className="bg-border h-px" />

      {/* 워크스페이스 관리 섹션 */}
      <div className="flex flex-col gap-4">
        <h3 className="text-foreground text-sm font-medium">
          워크스페이스 관리
        </h3>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="text-muted-foreground size-4" />
            <div className="flex flex-col">
              <span className="text-foreground/80 text-sm">팀원 관리</span>
              <span className="text-muted-foreground text-xs">
                팀원 초대 및 권한 관리
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
          >
            관리
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="text-muted-foreground size-4" />
            <div className="flex flex-col">
              <span className="text-foreground/80 text-sm">
                워크스페이스 설정
              </span>
              <span className="text-muted-foreground text-xs">
                워크스페이스 이름 및 설정 변경
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
          >
            설정
          </Button>
        </div>
      </div>
    </div>
  );
}

export default WorkspaceSettingsTab;
