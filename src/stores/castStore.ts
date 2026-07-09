import { create } from 'zustand';
import type { WatchListItem } from '@/types/watch';

// Holds the title awaiting cast confirmation; the CastConfirmModal reads it and does the launch.
interface CastStore {
  pending: WatchListItem | null;
  request: (item: WatchListItem) => void;
  clear: () => void;
}

export const useCastStore = create<CastStore>(set => ({
  pending: null,
  request: item => set({ pending: item }),
  clear: () => set({ pending: null })
}));
