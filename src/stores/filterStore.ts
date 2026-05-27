import { create } from 'zustand';
import type { ItemType, ItemStatus } from '../types';

interface FilterState {
  type: ItemType | null;
  status: ItemStatus | null;
  setType: (type: ItemType | null) => void;
  setStatus: (status: ItemStatus | null) => void;
  reset: () => void;
}

// 필터 UI 상태 스토어
export const useFilterStore = create<FilterState>((set) => ({
  type: null,
  status: null,
  setType: (type) => set({ type }),
  setStatus: (status) => set({ status }),
  reset: () => set({ type: null, status: null }),
}));
