import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getBackground as apiGetBackground, saveBackground as apiSaveBackground } from '@/api/watchApi';

// Custom wallpaper behind the app. Cached in localStorage for instant load AND synced to the user's
// account (brainerd-api `/watch/background`) so a change on iOS shows on desktop and vice versa.
// `image` is a downscaled JPEG data URL; `blur` is the chosen blur in px (Apple-wallpaper style).
export const MAX_BLUR = 40;

interface BackgroundState {
  image: string | null;
  blur: number;
  setImage: (image: string | null) => void;
  setBlur: (blur: number) => void;
  clear: () => void;
  syncFromBackend: () => Promise<void>;
}

// Bumped on every local change. A sync captures it at the start and bails on adopt if it changed while
// the fetch was in flight — otherwise a focus-triggered sync (fired when the photo picker refocuses the
// app) could clobber the image the user just picked with the stale remote value.
let localGeneration = 0;

// Debounce the account push — the blur slider fires continuously while dragging, so we don't want a
// request per pixel. Image picks/clears push immediately (delay 0).
let pushTimer: ReturnType<typeof setTimeout> | undefined;
const pushToBackend = (image: string | null, blur: number, delay: number) => {
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    void apiSaveBackground({ image, blur }).catch(() => {});
  }, delay);
};

export const useBackgroundStore = create<BackgroundState>()(
  persist(
    (set, get) => ({
      image: null,
      blur: 16,
      setImage: image => {
        localGeneration += 1;
        set({ image });
        pushToBackend(image, get().blur, 0);
      },
      setBlur: blur => {
        localGeneration += 1;
        set({ blur });
        pushToBackend(get().image, blur, 400);
      },
      clear: () => {
        localGeneration += 1;
        set({ image: null });
        pushToBackend(null, get().blur, 0);
      },
      syncFromBackend: async () => {
        const generation = localGeneration;
        try {
          const remote = await apiGetBackground();
          // The user changed the wallpaper locally while this fetch was in flight — their change is newer,
          // so don't overwrite it with the (now stale) remote value.
          if (generation !== localGeneration) return;
          if (remote.image) {
            // The account has a wallpaper — adopt it (a change from another client wins).
            set({ image: remote.image, blur: typeof remote.blur === 'number' ? remote.blur : get().blur });
          } else if (get().image) {
            // Account has none yet but this device does (e.g. set before sync existed) — seed the account
            // so it carries to the other clients instead of being wiped.
            void apiSaveBackground({ image: get().image, blur: get().blur }).catch(() => {});
          }
        } catch {
          // Offline or not signed in — keep the local cache.
        }
      }
    }),
    { name: 'watch-remote-background' }
  )
);
