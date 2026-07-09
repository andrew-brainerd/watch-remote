import { create } from 'zustand';
import { getWatchList } from '@/api/watchApi';
import type { WatchListResponse } from '@/types/watch';

// Shared watch collection — loaded once and refreshed after mutations, so the Watch (poster) and
// Library (management) tabs always agree.
interface WatchStore {
  data: WatchListResponse | null;
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
}

export const useWatchStore = create<WatchStore>(set => ({
  data: null,
  loading: false,
  error: null,
  load: async () => {
    set({ loading: true });
    try {
      const data = await getWatchList();
      set({ data, error: null, loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  }
}));
