import { useWatchStore } from '@/stores/watchStore';
import { useDeviceStore } from '@/stores/deviceStore';
import { rokuLaunch } from '@/api/ipc';
import { pickRokuDeepLink } from '@/utils/roku';
import type { WatchListItem, WatchStatus } from '@/types/watch';

// The "want to watch / watching now" set — the active watchlist, minus the completed/dropped archive.
const SHOWN_STATUSES: WatchStatus[] = ['watching', 'watchlist'];

export const WatchView = () => {
  const { data, loading, error } = useWatchStore();
  const { devices, activeId } = useDeviceStore();
  const active = devices.find(d => d.id === activeId);
  const services = data?.settings.services ?? [];

  const items = (data?.items ?? []).filter(item => SHOWN_STATUSES.includes(item.status));

  const cast = (item: WatchListItem) => {
    const roku = pickRokuDeepLink(item, services);
    if (!active || !roku?.channelId) return;
    rokuLaunch(active.ip, roku.channelId, roku.contentId, roku.mediaType).catch(() => {});
  };

  if (loading && !data) return <p className="text-sm text-neutral-500">Loading your watchlist…</p>;
  if (error) return <p className="text-sm text-red-400">Couldn&apos;t load watchlist — {error}</p>;
  if (items.length === 0) {
    return <p className="text-sm text-neutral-500">Nothing on your watchlist yet — add shows in the Library tab.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-neutral-500">
        {active ? `Tap a poster to cast to ${active.name}` : 'Select a device in the Remote tab to cast'}
      </p>
      <div className="grid grid-cols-3 gap-2">
        {items.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => cast(item)}
            title={item.media?.title ? `Cast ${item.media.title}` : undefined}
            className="relative aspect-[2/3] overflow-hidden rounded-lg border border-line bg-panel-2 active:opacity-80"
          >
            {item.media?.poster ? (
              <img src={item.media.poster} alt={item.media?.title ?? ''} className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full items-center justify-center p-2 text-center text-[11px] text-neutral-400">
                {item.media?.title ?? item.id}
              </span>
            )}
            <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/85 to-transparent px-1.5 pb-1 pt-5 text-left text-[10px] font-medium text-white">
              {item.media?.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
