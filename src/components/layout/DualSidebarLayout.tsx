/**
 * DualSidebarLayout
 *
 * 새로운 이중 사이드바 레이아웃
 * - IconBar: 게임 아이콘 리스트
 * - GameSidebar: 게임 정보 + 버전 리스트
 * - GlobalSidebarFooter: 유저 프로필
 * - EmptyGamePrompt: 게임 없을 때
 */

import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useGamesQuery } from '@/features/game-streaming';
import { GameFormModal, useCreateGameMutation, useGameForm } from '@/features/game';
import {
  useVersionsQuery,
  useCreateVersionMutation,
  VersionFormModal,
  type CreateVersionRequest,
} from '@/features/version';
import { TabValue } from '@/components/layout/types';
import { useCurrentWorkspaceStore, useSettingStore } from '@/stores';

import EmptyGamePrompt from './EmptyGamePrompt';
import GameSidebar from './GameSidebar';
import GlobalSidebarFooter from './GlobalSidebarFooter';
import IconBar from './IconBar';
import Topbar from './Topbar';

interface DualSidebarLayoutProps {
  children: React.ReactNode;
}

const INITIAL_VERSION_FORM: CreateVersionRequest = {
  versionName: '',
  description: '',
  status: 'beta',
};

function DualSidebarLayout({ children }: DualSidebarLayoutProps) {
  const navigate = useNavigate();
  const { gameUuid: routeGameUuid, versionUuid: routeVersionUuid } = useParams<{
    gameUuid?: string;
    versionUuid?: string;
  }>();

  const { currentWorkspace } = useCurrentWorkspaceStore();
  const { openSettings, setActiveTab } = useSettingStore();

  // 게임 목록 조회
  const { data: games = [] } = useGamesQuery();

  // 선택된 게임 (URL 기반 또는 첫 번째 게임)
  const selectedGameUuid = routeGameUuid && !routeGameUuid.startsWith(':')
    ? routeGameUuid
    : games[0]?.gameUuid;

  const selectedGame = games.find((g) => g.gameUuid === selectedGameUuid);

  // 버전 목록 조회
  const { data: versions = [] } = useVersionsQuery({
    gameUuid: selectedGameUuid,
    enabled: !!selectedGameUuid,
  });

  // 선택된 버전
  const [selectedVersionUuid, setSelectedVersionUuid] = useState<string | undefined>(
    routeVersionUuid
  );

  // 모달 상태
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);

  // 게임 폼
  const {
    formData: gameFormData,
    setFormData: setGameFormData,
    resetForm: resetGameForm,
    handleGenreToggle,
  } = useGameForm();

  // 버전 폼
  const [versionFormData, setVersionFormData] = useState<CreateVersionRequest>(
    INITIAL_VERSION_FORM
  );

  // Mutations
  const createGameMutation = useCreateGameMutation();
  const createVersionMutation = useCreateVersionMutation({
    gameUuid: selectedGameUuid || '',
  });

  // 워크스페이스 없으면 설정 열기
  useEffect(() => {
    if (!currentWorkspace) {
      openSettings();
      setActiveTab(TabValue.WORKSPACE);
    }
  }, [currentWorkspace, openSettings, setActiveTab]);

  // URL 변경 시 버전 선택 동기화
  useEffect(() => {
    if (routeVersionUuid) {
      setSelectedVersionUuid(routeVersionUuid);
    }
  }, [routeVersionUuid]);

  // 핸들러
  const handleGameSelect = useCallback(
    (gameUuid: string) => {
      navigate(`/games/${gameUuid}/overview`);
    },
    [navigate]
  );

  const handleAddGame = useCallback(() => {
    resetGameForm();
    setIsGameModalOpen(true);
  }, [resetGameForm]);

  const handleCreateGame = useCallback(() => {
    createGameMutation.mutate(gameFormData, {
      onSuccess: () => {
        setIsGameModalOpen(false);
        resetGameForm();
      },
    });
  }, [createGameMutation, gameFormData, resetGameForm]);

  const handleVersionSelect = useCallback((versionUuid: string) => {
    setSelectedVersionUuid(versionUuid);
  }, []);

  const handleAddVersion = useCallback(() => {
    setVersionFormData(INITIAL_VERSION_FORM);
    setIsVersionModalOpen(true);
  }, []);

  const handleCreateVersion = useCallback(() => {
    createVersionMutation.mutate(versionFormData, {
      onSuccess: (newVersion) => {
        setIsVersionModalOpen(false);
        setVersionFormData(INITIAL_VERSION_FORM);
        // 생성된 버전으로 네비게이션
        if (selectedGameUuid) {
          navigate(`/games/${selectedGameUuid}/versions/${newVersion.versionUuid}`);
        }
      },
    });
  }, [createVersionMutation, versionFormData, selectedGameUuid, navigate]);

  const hasGames = games.length > 0;
  const hasSelectedGame = !!selectedGame;

  return (
    <div className="bg-background flex h-screen overflow-hidden">
      {/* 왼쪽 사이드바 영역 */}
      <div className="flex h-full flex-col">
        <div className="flex flex-1 overflow-hidden">
          {/* IconBar (항상 표시) */}
          <IconBar
            games={games.map((g) => ({
              gameUuid: g.gameUuid,
              gameName: g.gameName,
            }))}
            selectedGameUuid={selectedGameUuid}
            onGameSelect={handleGameSelect}
            onAddGame={handleAddGame}
          />

          {/* GameSidebar (게임 선택 시만) */}
          {hasSelectedGame && (
            <GameSidebar
              game={{
                gameUuid: selectedGame.gameUuid,
                gameName: selectedGame.gameName,
              }}
              versions={versions}
              selectedVersionUuid={selectedVersionUuid}
              onVersionSelect={handleVersionSelect}
              onAddVersion={handleAddVersion}
            />
          )}
        </div>

        {/* 하단 유저 프로필 */}
        <GlobalSidebarFooter hasGameSidebar={hasSelectedGame} />
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />

        <main className="bg-background flex-1 overflow-auto p-6">
          {!hasGames ? (
            <EmptyGamePrompt onAddGame={handleAddGame} />
          ) : (
            children
          )}
        </main>
      </div>

      {/* 게임 추가 모달 */}
      <GameFormModal
        isOpen={isGameModalOpen}
        onClose={() => setIsGameModalOpen(false)}
        title="새 게임 만들기"
        description="새 게임의 정보를 입력하세요."
        formData={gameFormData}
        setFormData={setGameFormData}
        onGenreToggle={handleGenreToggle}
        onSubmit={handleCreateGame}
        isSubmitting={createGameMutation.isPending}
        submitLabel="생성"
      />

      {/* 버전 추가 모달 */}
      <VersionFormModal
        isOpen={isVersionModalOpen}
        onClose={() => setIsVersionModalOpen(false)}
        formData={versionFormData}
        setFormData={setVersionFormData}
        onSubmit={handleCreateVersion}
        isSubmitting={createVersionMutation.isPending}
      />
    </div>
  );
}

export default DualSidebarLayout;

