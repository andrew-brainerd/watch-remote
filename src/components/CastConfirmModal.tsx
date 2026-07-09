import { useCastStore } from '@/stores/castStore';
import { useDeviceStore } from '@/stores/deviceStore';
import { useWatchStore } from '@/stores/watchStore';
import { useTrailerStore } from '@/stores/trailerStore';
import { rokuLaunch } from '@/api/ipc';
import { pickRokuDeepLink } from '@/utils/roku';

// Confirmation before casting: "Play {title} on {device}?" with play + cancel icon buttons.
export const CastConfirmModal = () => {
  const { pending, clear } = useCastStore();
  const { devices, activeId } = useDeviceStore();
  const active = devices.find(d => d.id === activeId);
  // `?? []` must stay OUTSIDE the selector: returning a fresh [] from the selector makes Zustand's
  // useSyncExternalStore see a new snapshot every render → infinite re-render → React #185.
  const services = useWatchStore(s => s.data?.settings.services) ?? [];
  const openTrailer = useTrailerStore(s => s.open);

  if (!pending) return null;

  const title = pending.media?.title ?? pending.id;
  const roku = pickRokuDeepLink(pending, services);
  const trailer = pending.media?.trailer;
  const canCast = !!active && !!roku?.channelId;

  const confirm = () => {
    if (active && roku?.channelId) {
      rokuLaunch(active.ip, roku.channelId, roku.contentId, roku.mediaType).catch(() => {});
    }
    clear();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6" onClick={clear}>
      <div
        className="w-full max-w-xs rounded-2xl border border-line bg-panel p-5 text-center"
        onClick={e => e.stopPropagation()}
      >
        <p className="text-sm text-neutral-100">
          Play <span className="font-semibold">&ldquo;{title}&rdquo;</span>
          {active ? (
            <>
              {' '}
              on <span className="font-semibold">{active.name}</span>
            </>
          ) : null}
          ?
        </p>

        {!canCast && (
          <p className="mt-2 text-xs text-neutral-500">
            {!active ? 'Select a device in the Remote tab first.' : 'No deep link available for this title.'}
          </p>
        )}

        <div className="mt-5 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={clear}
            aria-label="Cancel"
            className="flex h-14 w-14 items-center justify-center rounded-full border border-line bg-panel-2 text-neutral-300 transition active:opacity-80"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={!canCast}
            aria-label="Play"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white transition active:opacity-80 disabled:opacity-40"
          >
            <svg viewBox="0 0 24 24" className="h-7 w-7 translate-x-0.5" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </div>

        {trailer && (
          <button
            type="button"
            onClick={() => openTrailer(title, trailer.key)}
            className="mt-4 text-xs text-neutral-400 underline transition-colors hover:text-white"
          >
            Watch trailer
          </button>
        )}
      </div>
    </div>
  );
};
