import { create } from 'zustand';

// The active bottom-nav tab. Lifted into a store (not App-local state) so a cast can switch the user to
// the Remote tab. Not persisted — the app always opens on Remote.
export type TabId = 'remote' | 'watch' | 'favorites' | 'library' | 'shortcuts';

interface NavStore {
  tab: TabId;
  setTab: (tab: TabId) => void;
}

export const useNavStore = create<NavStore>(set => ({
  tab: 'remote',
  setTab: tab => set({ tab })
}));
