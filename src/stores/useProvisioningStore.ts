/**
 * 전역 프로비저닝 상태 관리 스토어
 * 리소스 프로비저닝 진행 상황을 페이지 이동 시에도 유지
 */
import { create } from 'zustand';

import { StreamingResourceStatus } from '@/features/game-streaming-survey';

// ----------------------------------------
// Types
// ----------------------------------------

/**
 * UI 위젯용 프로비저닝 상태
 * StreamingResourceStatus의 서브셋 + UI 전용 ERROR 상태
 */
export type ProvisioningStatus =
  | typeof StreamingResourceStatus.CREATING
  | typeof StreamingResourceStatus.PROVISIONING
  | typeof StreamingResourceStatus.READY
  | typeof StreamingResourceStatus.ACTIVE
  | 'ERROR';

/** 프로비저닝 상태 상수 (런타임 값 참조용) */
export const ProvisioningStatus = {
  CREATING: StreamingResourceStatus.CREATING,
  PROVISIONING: StreamingResourceStatus.PROVISIONING,
  READY: StreamingResourceStatus.READY,
  ACTIVE: StreamingResourceStatus.ACTIVE,
  ERROR: 'ERROR',
} as const satisfies Record<string, ProvisioningStatus>;

/**
 * StreamingResourceStatus → ProvisioningStatus 변환
 * UI에 표시되지 않는 중간 상태들을 적절히 매핑
 */
export function mapToProvisioningStatus(
  status: StreamingResourceStatus
): ProvisioningStatus {
  switch (status) {
    case StreamingResourceStatus.CREATING:
      return ProvisioningStatus.CREATING;
    case StreamingResourceStatus.PENDING:
    case StreamingResourceStatus.PROVISIONING:
    case StreamingResourceStatus.TESTING:
    case StreamingResourceStatus.SCALING:
      return ProvisioningStatus.PROVISIONING;
    case StreamingResourceStatus.READY:
      return ProvisioningStatus.READY;
    case StreamingResourceStatus.ACTIVE:
      return ProvisioningStatus.ACTIVE;
    case StreamingResourceStatus.CLEANING:
      return ProvisioningStatus.READY;
    case StreamingResourceStatus.TERMINATED:
    default:
      return ProvisioningStatus.ERROR;
  }
}

/** 프로비저닝 단건 항목 */
export interface ProvisioningItem {
  id: string;
  surveyUuid: string;
  buildName: string;
  status: ProvisioningStatus;
  startedAt: number;
  errorMessage?: string;
}

/** 프로비저닝 시작 파라미터 */
export interface StartProvisioningParams {
  surveyUuid: string;
  buildName: string;
}

interface ProvisioningStoreState {
  /** 프로비저닝 항목 목록 */
  items: ProvisioningItem[];
  /** 위젯 최소화 상태 */
  isMinimized: boolean;
  /** 위젯 표시 상태 (항목은 유지하되 UI만 숨김) */
  isVisible: boolean;
}

interface ProvisioningStoreActions {
  /** 프로비저닝 시작 */
  startProvisioning: (params: StartProvisioningParams) => string;
  /** 상태 업데이트 */
  updateStatus: (id: string, status: ProvisioningStatus) => void;
  /** 에러 설정 */
  setError: (id: string, message: string) => void;
  /** 항목 제거 */
  removeItem: (id: string) => void;
  /** 완료된 항목 모두 제거 */
  clearCompleted: () => void;
  /** 위젯 최소화 토글 */
  toggleMinimize: () => void;
  /** 위젯 보이기 */
  showWidget: () => void;
  /** 위젯 숨기기 */
  hideWidget: () => void;
}

type ProvisioningStore = ProvisioningStoreState & ProvisioningStoreActions;

// ----------------------------------------
// Store
// ----------------------------------------

export const useProvisioningStore = create<ProvisioningStore>()((set) => ({
  // State
  items: [],
  isMinimized: false,
  isVisible: true,

  // Actions
  startProvisioning: (params) => {
    const id = `provisioning-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    const newItem: ProvisioningItem = {
      id,
      surveyUuid: params.surveyUuid,
      buildName: params.buildName,
      status: ProvisioningStatus.CREATING,
      startedAt: Date.now(),
    };

    set((state) => ({
      items: [...state.items, newItem],
      isMinimized: false, // 새 프로비저닝 시작 시 위젯 펼치기
      isVisible: true, // 새 작업 시작 시 위젯 보이기
    }));

    return id;
  },

  updateStatus: (id, status) => {
    set((state) => {
      let didUpdate = false;
      const nextItems = state.items.map((item) => {
        if (item.id !== id) return item;
        const nextErrorMessage =
          status === ProvisioningStatus.ERROR ? item.errorMessage : undefined;
        if (item.status === status && item.errorMessage === nextErrorMessage) {
          return item;
        }
        didUpdate = true;
        return {
          ...item,
          status,
          errorMessage: nextErrorMessage,
        };
      });

      if (!didUpdate) return state;
      return { items: nextItems };
    });
  },

  setError: (id, message) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id
          ? { ...item, status: ProvisioningStatus.ERROR, errorMessage: message }
          : item
      ),
    }));
  },

  removeItem: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },

  clearCompleted: () => {
    set((state) => ({
      items: state.items.filter(
        (item) =>
          item.status !== ProvisioningStatus.ACTIVE &&
          item.status !== ProvisioningStatus.READY &&
          item.status !== ProvisioningStatus.ERROR
      ),
    }));
  },

  toggleMinimize: () => {
    set((state) => ({ isMinimized: !state.isMinimized }));
  },

  showWidget: () => {
    set({ isVisible: true });
  },

  hideWidget: () => {
    set({ isVisible: false });
  },
}));

// ----------------------------------------
// Derived Selectors
// ----------------------------------------

/** 진행중인 프로비저닝이 있는지 */
export const selectHasActiveProvisioning = (state: ProvisioningStore) =>
  state.items.some(
    (item) =>
      item.status === ProvisioningStatus.CREATING ||
      item.status === ProvisioningStatus.PROVISIONING ||
      item.status === ProvisioningStatus.READY
  );

/** 진행중인 항목 수 */
export const selectActiveCount = (state: ProvisioningStore) =>
  state.items.filter(
    (item) =>
      item.status === ProvisioningStatus.CREATING ||
      item.status === ProvisioningStatus.PROVISIONING ||
      item.status === ProvisioningStatus.READY
  ).length;

/** 완료된 항목 수 (ACTIVE + ERROR) */
export const selectCompletedCount = (state: ProvisioningStore) =>
  state.items.filter(
    (item) =>
      item.status === ProvisioningStatus.ACTIVE ||
      item.status === ProvisioningStatus.ERROR
  ).length;
