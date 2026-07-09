import { create } from 'zustand';

// Holds the trailer awaiting playback; TrailerModal reads it and shows the YouTube embed.
interface TrailerStore {
  trailer: { title: string; key: string } | null;
  open: (title: string, key: string) => void;
  close: () => void;
}

export const useTrailerStore = create<TrailerStore>(set => ({
  trailer: null,
  open: (title, key) => set({ trailer: { title, key } }),
  close: () => set({ trailer: null })
}));
