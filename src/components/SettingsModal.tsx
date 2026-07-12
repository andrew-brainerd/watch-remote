import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useConfigStore } from '@/stores/configStore';
import { usePrefsStore } from '@/stores/prefsStore';
import { DeviceBar } from '@/components/DeviceBar';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

// Settings (behind the header cog): device management, the Watch-server config, viewing
// preferences, and sign out — everything that used to live inline in the header / remote tab.
export const SettingsModal = ({ open, onClose }: SettingsModalProps) => {
  const signOut = useAuthStore(s => s.signOut);
  const showRentalTitles = usePrefsStore(s => s.showRentalTitles);
  const setShowRentalTitles = usePrefsStore(s => s.setShowRentalTitles);
  const apiBase = useConfigStore(s => s.apiBase);
  const setApiBase = useConfigStore(s => s.setApiBase);
  const [serverDraft, setServerDraft] = useState(apiBase);

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
        </section>

        <div className="mt-5 flex items-center justify-between border-t border-line pt-3">
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
      </div>
    </div>
  );
};
