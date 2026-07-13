import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Custom wallpaper behind the app (device-scoped, persisted). `image` is a downscaled JPEG data URL so
// it fits in localStorage; `blur` is the user-chosen blur amount in px (Apple-wallpaper style).
export const MAX_BLUR = 40;

interface BackgroundState {
  image: string | null;
  blur: number;
  setImage: (image: string | null) => void;
  setBlur: (blur: number) => void;
  clear: () => void;
}

export const useBackgroundStore = create<BackgroundState>()(
  persist(
    set => ({
      image: null,
      blur: 16,
      setImage: image => set({ image }),
      setBlur: blur => set({ blur }),
      clear: () => set({ image: null })
    }),
    { name: 'watch-remote-background' }
  )
);
