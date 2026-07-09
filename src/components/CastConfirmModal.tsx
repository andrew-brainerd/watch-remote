import { useEffect, useState } from 'react';
import { useCastStore } from '@/stores/castStore';
import { useDeviceStore } from '@/stores/deviceStore';
import { useWatchStore } from '@/stores/watchStore';
import { useTrailerStore } from '@/stores/trailerStore';
import { useServicesStore } from '@/stores/servicesStore';
import { usePrefsStore } from '@/stores/prefsStore';
import { rokuKeypress, rokuLaunch } from '@/api/ipc';
import { updateWatchItem } from '@/api/watchApi';
import { accessLabel, accessNote, castableServices, ownsAddon, PROFILE_GATE_APPS } from '@/utils/roku';

// Prime/Disney show a profile picker on launch; after casting we wait this long, then press Select to
// pick the highlighted default profile so the deep link continues. Tuned on-device.
const PROFILE_SELECT_DELAY_MS = 6000;

// Confirmation before casting: "Play {title} on {device}?" with play + cancel icon buttons. When a title
// is on multiple castable services and the user hasn't picked one yet, a service step comes first — the
// choice persists via the API so future casts skip straight to the confirm.
export const CastConfirmModal = () => {
  const { pending, clear } = useCastStore();
  const { devices, activeId } = useDeviceStore();
  const active = devices.find(d => d.id === activeId);
  // `?? []` must stay OUTSIDE the selector: returning a fresh [] from the selector makes Zustand's
  // useSyncExternalStore see a new snapshot every render → infinite re-render → React #185.
  const services = useWatchStore(s => s.data?.settings.services) ?? [];
  const patchItem = useWatchStore(s => s.patchItem);
  const openTrailer = useTrailerStore(s => s.open);
  const catalog = useServicesStore(s => s.catalog);
  const hideOwnedAddons = usePrefsStore(s => s.hideOwnedAddons);

  // Just-picked service (this session) + a flag to re-open the picker via "Change". Reset per title.
  const [chosen, setChosen] = useState<string | undefined>(undefined);
  const [repick, setRepick] = useState(false);

  useEffect(() => {
    setChosen(undefined);
    setRepick(false);
  }, [pending?.id]);

  if (!pending) return null;

  const title = pending.media?.title ?? pending.id;
  const trailer = pending.media?.trailer;

  const allCastable = castableServices(pending);
  // Drop an add-on route when the required add-on is a subscription the user already has directly — but
  // never hide every route, so a title with only an owned-add-on option stays castable.
  const filtered = hideOwnedAddons
    ? allCastable.filter(option => !(option.type === 'addon' && ownsAddon(option.addon, services, catalog)))
    : allCastable;
  const castable = filtered.length > 0 ? filtered : allCastable;
  const preferredId = chosen ?? pending.preferredService;
  const needsPick = repick || (castable.length > 1 && !preferredId);

  // The option we'll actually launch: preferred service, else a subscribed one, else the first castable.
  const selected =
    (preferredId ? castable.find(c => c.service.id === preferredId) : undefined) ??
    castable.find(c => services.includes(c.service.id)) ??
    castable[0];
  const roku = selected?.roku;
  const usingService = selected?.service;
  const note = selected ? accessNote(selected) : null;
  const canCast = !!active && !!roku?.channelId;

  const choose = (serviceId: string) => {
    setChosen(serviceId);
    setRepick(false);
    patchItem(pending.id, { preferredService: serviceId });
    updateWatchItem(pending.id, { preferredService: serviceId }).catch(() => {});
  };

  const confirm = () => {
    if (active && roku?.channelId) {
      rokuLaunch(active.ip, roku.channelId, roku.contentId, roku.mediaType).catch(() => {});
      // Prime/Disney land on a profile picker first — auto-select the default profile so it plays through.
      if (PROFILE_GATE_APPS.has(roku.app)) {
        const { ip } = active;
        setTimeout(() => rokuKeypress(ip, 'Select').catch(() => {}), PROFILE_SELECT_DELAY_MS);
      }
    }
    clear();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6" onClick={clear}>
      <div
        className="w-full max-w-xs rounded-2xl border border-line bg-panel p-5 text-center"
        onClick={e => e.stopPropagation()}
      >
        {needsPick ? (
          <>
            <p className="text-sm text-neutral-100">
              Where do you want to watch <span className="font-semibold">&ldquo;{title}&rdquo;</span>?
            </p>
            <div className="mt-4 flex flex-col gap-2">
              {castable.map(option => {
                const label = accessLabel(option);
                return (
                  <button
                    key={option.service.id}
                    type="button"
                    onClick={() => choose(option.service.id)}
                    className="flex items-center gap-3 rounded-lg border border-line bg-panel-2 px-3 py-2 text-left text-sm text-neutral-100 transition-colors hover:border-accent"
                  >
                    {option.service.imageUrl ? (
                      <img src={option.service.imageUrl} alt="" className="h-6 w-6 shrink-0 rounded object-contain" />
                    ) : (
                      <span className="h-6 w-6 shrink-0 rounded bg-panel" />
                    )}
                    <span className="min-w-0 flex-1 truncate">{option.service.name}</span>
                    {label && <span className="shrink-0 text-[11px] text-amber-400/90">{label}</span>}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={clear}
              className="mt-4 text-xs text-neutral-500 transition-colors hover:text-neutral-300"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
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

            {usingService && (
              <p className="mt-1 text-xs text-neutral-500">
                via {usingService.name}
                {castable.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setRepick(true)}
                    className="ml-2 text-accent transition-colors hover:text-accent-hover"
                  >
                    Change
                  </button>
                )}
              </p>
            )}

            {note && <p className="mt-2 text-xs font-medium text-amber-400">{note}</p>}

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
          </>
        )}
      </div>
    </div>
  );
};
