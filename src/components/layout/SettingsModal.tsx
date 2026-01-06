import { Building2, Settings, User } from 'lucide-react';
import { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { cn } from '@/lib/utils';

import { AccountSettingsTab, WorkspaceSettingsTab } from './settings-modal';

type TabId = 'account' | 'workspace';

interface Tab {
  id: TabId;
  label: string;
  icon: typeof User;
}

const TABS: Tab[] = [
  { id: 'account', label: '계정', icon: User },
  { id: 'workspace', label: '워크스페이스', icon: Building2 },
];

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * SettingsModal - 2탭 설정 모달 (계정/워크스페이스)
 */
function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('account');

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-2xl p-0">
        <div className="flex min-h-[400px]">
          {/* 왼쪽 탭 네비게이션 */}
          <div className="bg-muted/30 flex w-48 shrink-0 flex-col border-r p-4">
            <DialogHeader className="mb-4">
              <DialogTitle className="flex items-center gap-2 text-base">
                <Settings className="size-4" />
                설정
              </DialogTitle>
            </DialogHeader>

            <nav className="flex flex-col gap-1">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    type="button"
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="size-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* 오른쪽 탭 컨텐츠 */}
          <div className="flex-1 p-6">
            {activeTab === 'account' && <AccountSettingsTab />}
            {activeTab === 'workspace' && <WorkspaceSettingsTab />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SettingsModal;
