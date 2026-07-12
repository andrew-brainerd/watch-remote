import { create } from 'zustand';
import { getWatchList, syncYoutubeWatchlist } from '@/api/watchApi';
import type { WatchListItem, WatchListResponse } from '@/types/watch';

// Shared watch collection — loaded once and refreshed after mutations, so the Watch (poster) and
// Library (management) tabs always agree.
interface WatchStore {
  data: WatchListResponse | null;
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  patchItem: (id: string, patch: Partial<WatchListItem>) => void;
}

export const useWatchStore = create<WatchStore>((set, get) => ({
  data: null,
  loading: false,
  error: null,
  load: async () => {
    // On the first load (app open), pull in newly-added "Watchlist" videos before fetching the list.
    // Best-effort and only on the initial load, so mutation-triggered refreshes stay snappy.
    const isInitial = !get().data;
    set({ loading: true });
    try {
      if (isInitial) {
        await syncYoutubeWatchlist().catch(() => {});
      }
      const data = await getWatchList();
      set({ data, error: null, loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },
  // Optimistic local patch (e.g. saved preferred service) so a re-cast skips the picker immediately.
  patchItem: (id, patch) =>
    set(state =>
      state.data
        ? { data: { ...state.data, items: state.data.items.map(i => (i.id === id ? { ...i, ...patch } : i)) } }
        : {}
    )
}));
