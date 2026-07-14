import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useConfigStore } from '@/stores/configStore';
import { usePrefsStore } from '@/stores/prefsStore';
import { MAX_BLUR, useBackgroundStore } from '@/stores/backgroundStore';
import { getYoutubeConnection, syncYoutubeWatchlist } from '@/api/watchApi';
import { fileToDownscaledDataUrl } from '@/utils/image';
import { DeviceBar } from '@/components/DeviceBar';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

// Settings (behind the header cog): device management, the Watch-server config, viewing
// preferences, and sign out — everything that used to live inline in the header / remote tab.
export const SettingsModal = ({ open, onClose }: SettingsModalProps) => {
  const user = useAuthStore(s => s.user);
  const signOut = useAuthStore(s => s.signOut);
  const showRentalTitles = usePrefsStore(s => s.showRentalTitles);
  const setShowRentalTitles = usePrefsStore(s => s.setShowRentalTitles);
  const switchToRemoteOnCast = usePrefsStore(s => s.switchToRemoteOnCast);
  const setSwitchToRemoteOnCast = usePrefsStore(s => s.setSwitchToRemoteOnCast);
  const apiBase = useConfigStore(s => s.apiBase);
  const setApiBase = useConfigStore(s => s.setApiBase);
  const [serverDraft, setServerDraft] = useState(apiBase);

  const bgImage = useBackgroundStore(s => s.image);
  const blur = useBackgroundStore(s => s.blur);
  const setBgImage = useBackgroundStore(s => s.setImage);
  const setBlur = useBackgroundStore(s => s.setBlur);
  const clearBg = useBackgroundStore(s => s.clear);
  const [bgBusy, setBgBusy] = useState(false);

  const handleBgFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBgBusy(true);
    try {
      setBgImage(await fileToDownscaledDataUrl(file));
    } catch {
      // ignore — a bad/unsupported image just leaves the current background
    } finally {
      setBgBusy(false);
    }
  };

  const [ytConnected, setYtConnected] = useState<boolean | null>(null);
  const [ytSyncing, setYtSyncing] = useState(false);
  const [ytMsg, setYtMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setYtMsg(null);
    let cancelled = false;
    getYoutubeConnection()
      .then(r => !cancelled && setYtConnected(r.connected))
      .catch(() => !cancelled && setYtConnected(false));
    return () => {
      cancelled = true;
    };
  }, [open]);

  const syncYoutube = async () => {
    setYtSyncing(true);
    setYtMsg(null);
    try {
      const result = await syncYoutubeWatchlist();
      if (result.connected === false) {
        setYtConnected(false);
      } else if (result.playlistFound === false) {
        setYtMsg('No YouTube playlist named “Watchlist” found.');
      } else {
        setYtMsg(
          result.imported > 0
            ? `Imported ${result.imported} new video${result.imported === 1 ? '' : 's'}.`
            : 'Up to date.'
        );
      }
    } catch {
      setYtMsg('Sync failed. Please try again.');
    } finally {
      setYtSyncing(false);
    }
  };

  if (!open) return null;

  const label = 'text-[11px] uppercase tracking-wide text-neutral-600';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="max-h-[92vh] w-full max-w-sm overflow-y-auto rounded-xl border border-line bg-panel p-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-100">Settings</h3>
          <button
            type="button"
            aria-label="Close settings"
            onClick={onClose}
            className="text-neutral-500 transition-colors hover:text-neutral-300"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <section>
          <span className={label}>Devices</span>
          <div className="mt-1">
            <DeviceBar />
          </div>
        </section>

        <section className="mt-4">
          <span className={label}>Watch server</span>
          <div className="mt-1 flex gap-2">
            <input
              value={serverDraft}
              onChange={e => setServerDraft(e.target.value)}
              spellCheck={false}
              autoCapitalize="off"
              className="min-w-0 flex-1 rounded border border-line bg-panel-2 px-2 py-1 text-xs text-neutral-300"
            />
            <button
              type="button"
              onClick={() => setApiBase(serverDraft)}
              disabled={serverDraft.trim() === apiBase}
              className="rounded border border-line bg-panel-2 px-2 py-1 text-xs text-neutral-300 disabled:opacity-40"
            >
              Save
            </button>
          </div>
          <p className="mt-1 text-[10px] text-neutral-600">
            On a phone, set this to your Mac&apos;s LAN IP or the production API.
          </p>
        </section>

        <section className="mt-4">
          <span className={label}>Preferences</span>
          <label className="mt-2 flex items-start gap-2 text-xs text-neutral-300">
            <input
              type="checkbox"
              checked={showRentalTitles}
              onChange={e => setShowRentalTitles(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-accent"
            />
            <span>
              Show titles that require rental
              <span className="mt-0.5 block text-[11px] text-neutral-500">
                Titles only available to rent or buy (not on any subscription)
              </span>
            </span>
          </label>
          <label className="mt-3 flex items-start gap-2 text-xs text-neutral-300">
            <input
              type="checkbox"
              checked={switchToRemoteOnCast}
              onChange={e => setSwitchToRemoteOnCast(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-accent"
            />
            <span>
              Switch to Remote after casting
              <span className="mt-0.5 block text-[11px] text-neutral-500">
                Jump to the Remote tab when you cast, to see now-playing and controls
              </span>
            </span>
          </label>
        </section>

        <section className="mt-4">
          <span className={label}>Background</span>
          <div className="mt-2 flex items-center gap-3">
            {bgImage ? (
              <div
                className="h-12 w-12 shrink-0 rounded border border-line bg-cover bg-center"
                style={{ backgroundImage: `url(${bgImage})` }}
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded border border-line bg-panel-2 text-neutral-600">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <circle cx="8.5" cy="9.5" r="1.5" />
                  <path d="M4 17l5-5 4 4 3-3 4 4" />
                </svg>
              </div>
            )}
            <label className="cursor-pointer rounded border border-line bg-panel-2 px-2 py-1 text-xs text-neutral-300">
              {bgBusy ? 'Processing…' : bgImage ? 'Change' : 'Choose image'}
              <input type="file" accept="image/*" onChange={handleBgFile} className="hidden" />
            </label>
            {bgImage && (
              <button
                type="button"
                onClick={clearBg}
                className="text-xs text-neutral-500 transition-colors hover:text-red-400"
              >
                Remove
              </button>
            )}
          </div>
          {bgImage && (
            <label className="mt-3 block text-xs text-neutral-400">
              <span className="mb-1 flex items-center justify-between">
                <span>Blur</span>
                <span className="text-neutral-500">{blur}px</span>
              </span>
              <input
                type="range"
                min={0}
                max={MAX_BLUR}
                value={blur}
                onChange={e => setBlur(Number(e.target.value))}
                className="w-full accent-accent"
              />
            </label>
          )}
        </section>

        <section className="mt-4">
          <span className={label}>YouTube</span>
          {ytConnected === null ? (
            <p className="mt-2 text-xs text-neutral-500">Checking…</p>
          ) : ytConnected ? (
            <>
              <p className="mt-1 text-xs text-neutral-400">
                Connected. Your <span className="text-neutral-300">Watchlist</span> playlist syncs into your library
                automatically on open.
              </p>
              <div className="mt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={syncYoutube}
                  disabled={ytSyncing}
                  className="rounded border border-line bg-panel-2 px-2 py-1 text-xs text-neutral-300 disabled:opacity-40"
                >
                  {ytSyncing ? 'Syncing…' : 'Sync now'}
                </button>
                {ytMsg && <span className="text-[11px] text-neutral-500">{ytMsg}</span>}
              </div>
            </>
          ) : (
            <p className="mt-1 text-xs text-neutral-500">
              Not connected. Connect your YouTube account on the web at{' '}
              <span className="text-neutral-300">brainerd.dev/watch</span> to import your Watchlist playlist.
            </p>
          )}
        </section>

        <section className="mt-5 border-t border-line pt-3">
          <span className={label}>Account</span>
          {user?.email && <p className="mt-1 truncate text-xs text-neutral-400">{user.email}</p>}
          <div className="mt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                void signOut();
                onClose();
              }}
              className="text-xs text-neutral-500 transition-colors hover:text-red-400"
            >
              Sign out
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded bg-accent px-3 py-1.5 text-xs text-white transition-colors hover:bg-accent-hover"
            >
              Done
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
