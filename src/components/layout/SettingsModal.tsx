import { DialogTitle } from '@radix-ui/react-dialog';
import {
  Building2,
  CreditCard,
  LogOut,
  Settings,
  User,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Dialog, DialogContent, DialogHeader } from '@/components/ui/Dialog';
import { postLogout } from '@/features/auth';
import { useAuthStore, useSettingStore } from '@/stores';

import AccountSettingsTab from './settings-modal/AccountSettingsTab';
import { TeamSettingsTab } from './settings-modal-member/TeamSettingsTab';
import { WorkspaceSettingsTab } from './settings-modal-workspace/WorkspaceSettingsTab';

export default function SettingsModal() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { isSettingsOpen, closeSettings, activeTab, setActiveTab } =
    useSettingStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await postLogout();
      logout();
      navigate('/login', { replace: true });
    } catch {
      logout();
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Dialog
      open={isSettingsOpen}
      onOpenChange={closeSettings}
    >
      <DialogContent className="h-[600px] max-w-[900px] p-0">
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="bg-muted/30 flex w-[240px] flex-col border-r py-6">
            <DialogHeader className="px-6 pb-6">
              <DialogTitle className="text-lg font-semibold">설정</DialogTitle>
            </DialogHeader>
            <nav className="flex flex-1 flex-col gap-1 px-4">
              <button
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'workspace'
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
                onClick={() => setActiveTab('workspace')}
              >
                <Building2 className="size-4" />
                워크스페이스
              </button>
              <button
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'team'
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
                onClick={() => setActiveTab('team')}
              >
                <Users className="size-4" />팀 관리
              </button>
              <button
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'billing'
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
                onClick={() => setActiveTab('billing')}
              >
                <CreditCard className="size-4" />
                청구 및 결제
              </button>
              <button
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'account'
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
                onClick={() => setActiveTab('account')}
              >
                <User className="size-4" />
                계정 설정
              </button>
            </nav>

            <div className="border-t px-6 pt-6">
              <button
                className="text-muted-foreground hover:bg-muted hover:text-foreground flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <LogOut className="size-4" />
                {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'account' && <AccountSettingsTab />}
            {activeTab === 'workspace' && <WorkspaceSettingsTab />}
            {activeTab === 'team' && <TeamSettingsTab />}
            {activeTab === 'billing' && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <Settings className="text-muted-foreground mb-4 size-12 opacity-20" />
                <h3 className="text-lg font-semibold">준비 중인 기능입니다</h3>
                <p className="text-muted-foreground text-sm">
                  청구 및 결제 기능은 곧 제공될 예정입니다.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
