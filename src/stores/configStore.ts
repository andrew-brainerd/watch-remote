import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Production brainerd-api (mounts at `/`, valid cert — works on any device). Override via the
// "Watch server" field for local dev (e.g. https://local.brainerd.dev:5002/api on the Mac, or the
// Mac's LAN IP from a phone).
export const DEFAULT_API_BASE = 'https://api.brainerd.dev';

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
