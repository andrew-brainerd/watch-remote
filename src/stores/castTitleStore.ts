import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// The title we last cast to a device, remembered so the Remote tab's now-playing can show the actual
// title (the Roku's ECP doesn't expose content titles — only the app). Keyed by device id (its IP).
// `appId` is the Roku channel id we cast to, which matches the ECP `<plugin id>` of the running app, so
// now-playing only shows the remembered title while that same app is in the foreground. Cleared when the
// content changes on the device (position resets) — see NowPlaying.
export interface CastTitle {
  title: string;
  appId: string;
  castAt: number;
}

interface CastTitleStore {
  titles: Record<string, CastTitle>;
  setCastTitle: (deviceId: string, title: string, appId: string) => void;
  clearCastTitle: (deviceId: string) => void;
}

export const useCastTitleStore = create<CastTitleStore>()(
  persist(
    set => ({
      titles: {},
      setCastTitle: (deviceId, title, appId) =>
        set(state => ({ titles: { ...state.titles, [deviceId]: { title, appId, castAt: Date.now() } } })),
      clearCastTitle: deviceId =>
        set(state => {
          if (!state.titles[deviceId]) return state;
          const titles = { ...state.titles };
          delete titles[deviceId];
          return { titles };
        })
    }),
    { name: 'rimokon-miru-cast-titles' }
  )
);
