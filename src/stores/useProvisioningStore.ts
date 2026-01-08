/**
 * 전역 프로비저닝 상태 관리 스토어
 * 리소스 프로비저닝 진행 상황을 페이지 이동 시에도 유지
 */
import { create } from 'zustand';

// ----------------------------------------
// Types
// ----------------------------------------

export type ProvisioningStatus =
  | 'CREATING'
  | 'PROVISIONING'
  | 'READY'
  | 'ACTIVE'
  | 'ERROR';

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
}

type ProvisioningStore = ProvisioningStoreState & ProvisioningStoreActions;

// ----------------------------------------
// Store
// ----------------------------------------

export const useProvisioningStore = create<ProvisioningStore>()((set) => ({
  // State
  items: [],
  isMinimized: false,

  // Actions
  startProvisioning: (params) => {
    const id = `provisioning-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    const newItem: ProvisioningItem = {
      id,
      surveyUuid: params.surveyUuid,
      buildName: params.buildName,
      status: 'CREATING',
      startedAt: Date.now(),
    };

    set((state) => ({
      items: [...state.items, newItem],
      isMinimized: false, // 새 프로비저닝 시작 시 위젯 펼치기
    }));

    return id;
  },

  updateStatus: (id, status) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, status } : item
      ),
    }));
  },

  setError: (id, message) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id
          ? { ...item, status: 'ERROR' as const, errorMessage: message }
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
          item.status !== 'ACTIVE' &&
          item.status !== 'READY' &&
          item.status !== 'ERROR'
      ),
    }));
  },

  toggleMinimize: () => {
    set((state) => ({ isMinimized: !state.isMinimized }));
  },
}));

// ----------------------------------------
// Derived Selectors
// ----------------------------------------

/** 진행중인 프로비저닝이 있는지 */
export const selectHasActiveProvisioning = (state: ProvisioningStore) =>
  state.items.some((item) =>
    ['CREATING', 'PROVISIONING'].includes(item.status)
  );

/** 진행중인 항목 수 */
export const selectActiveCount = (state: ProvisioningStore) =>
  state.items.filter((item) =>
    ['CREATING', 'PROVISIONING'].includes(item.status)
  ).length;

/** 완료된 항목 수 (ACTIVE + ERROR) */
export const selectCompletedCount = (state: ProvisioningStore) =>
  state.items.filter(
    (item) =>
      item.status === 'ACTIVE' ||
      item.status === 'READY' ||
      item.status === 'ERROR'
  ).length;
