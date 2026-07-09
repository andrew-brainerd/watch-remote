import { usePrefsStore } from '@/stores/prefsStore';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

// User settings (behind the header cog). Toggles here are device-local, persisted preferences.
export const SettingsModal = ({ open, onClose }: SettingsModalProps) => {
  const showRentalTitles = usePrefsStore(s => s.showRentalTitles);
  const setShowRentalTitles = usePrefsStore(s => s.setShowRentalTitles);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-xl border border-line bg-panel p-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-sm font-semibold text-neutral-100">Settings</h3>

        <label className="mt-3 flex items-start gap-2 text-xs text-neutral-300">
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

        <div className="mt-4 flex justify-end">
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
