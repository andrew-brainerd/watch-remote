import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Prod brainerd-api (mounts at `/`, valid cert — works on any device).
export const PROD_API_BASE = 'https://api.brainerd.dev';
// Local brainerd-api reachable from the phone: the Mac's LAN IP (run the API with HOST=0.0.0.0 so it
// binds beyond localhost; dev mounts at `/api` on :5002). Debug iOS builds accept its self-signed cert.
// Both must be on the same Wi-Fi; update the IP (or the "Watch server" field) if it changes.
export const LOCAL_API_BASE = 'https://local.brainerd.dev:5002/api';

// Testing against local for now — flip to PROD_API_BASE to ship against prod.
export const DEFAULT_API_BASE = LOCAL_API_BASE;

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
    // Key bumped so devices holding the old persisted prod base re-default to the local one above.
    { name: 'watch-remote-config-local' }
  )
);
