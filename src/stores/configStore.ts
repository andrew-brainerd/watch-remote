import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Dev default (works on the Mac). On a phone this hostname won't resolve — set it to the Mac's LAN IP
// (e.g. https://192.168.4.x:5002/api) or the production API.
export const DEFAULT_API_BASE = 'https://local.brainerd.dev:5002/api';

interface ConfigState {
  apiBase: string;
  setApiBase: (base: string) => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    set => ({
      apiBase: DEFAULT_API_BASE,
      setApiBase: base => set({ apiBase: base.trim() || DEFAULT_API_BASE })
    }),
    { name: 'watch-remote-config' }
  )
);
