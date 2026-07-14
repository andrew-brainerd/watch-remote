import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Local user preferences (device-scoped, persisted).
interface PrefsState {
  // Hide a title's add-on cast option (e.g. Prime → Crunchyroll add-on) when the required add-on is a
  // service the user already subscribes to directly — no point routing through the add-on.
  hideOwnedAddons: boolean;
  setHideOwnedAddons: (value: boolean) => void;
  // Show titles that are only available to rent or buy (not included in any subscription).
  showRentalTitles: boolean;
  setShowRentalTitles: (value: boolean) => void;
  // After confirming a cast, jump to the Remote tab (to see now-playing / control playback).
  switchToRemoteOnCast: boolean;
  setSwitchToRemoteOnCast: (value: boolean) => void;
}

export const usePrefsStore = create<PrefsState>()(
  persist(
    set => ({
      hideOwnedAddons: true,
      setHideOwnedAddons: hideOwnedAddons => set({ hideOwnedAddons }),
      showRentalTitles: true,
      setShowRentalTitles: showRentalTitles => set({ showRentalTitles }),
      switchToRemoteOnCast: true,
      setSwitchToRemoteOnCast: switchToRemoteOnCast => set({ switchToRemoteOnCast })
    }),
    { name: 'watch-remote-prefs' }
  )
);
