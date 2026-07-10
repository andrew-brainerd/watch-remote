import { useDeviceStore } from '@/stores/deviceStore';
import { useCastStore } from '@/stores/castStore';
import { useTrailerStore } from '@/stores/trailerStore';
import { useWatchStore } from '@/stores/watchStore';
import { removeFromWatch, updateWatchItem } from '@/api/watchApi';
import { pickRokuDeepLink } from '@/utils/roku';
import type { WatchListItem, WatchStatus } from '@/types/watch';

const STATUS_ORDER: WatchStatus[] = ['watching', 'watchlist', 'completed', 'dropped'];
const STATUS_LABELS: Record<WatchStatus, string> = {
  watching: 'Watching',
  watchlist: 'Watchlist',
  completed: 'Completed',
  dropped: 'Dropped'
};

interface LibraryProps {
  items: WatchListItem[];
  services: string[];
  onChanged: () => void | Promise<void>;
}

export const Library = ({ items, services, onChanged }: LibraryProps) => {
  const { devices, activeId } = useDeviceStore();
  const active = devices.find(d => d.id === activeId);
  const requestCast = useCastStore(s => s.request);
  const openTrailer = useTrailerStore(s => s.open);
  const patchItem = useWatchStore(s => s.patchItem);

  const cast = (item: WatchListItem) => {
    const roku = pickRokuDeepLink(item, services);
    if (!active || !roku?.channelId) return;
    requestCast(item);
  };

  const toggleFavorite = (item: WatchListItem) => {
    const favorite = !item.favorite;
    patchItem(item.id, { favorite }); // optimistic
    updateWatchItem(item.id, { favorite }).catch(() => {});
  };

  const changeStatus = async (item: WatchListItem, status: WatchStatus) => {
    if (status === item.status) return;
    await updateWatchItem(item.id, { status });
    await onChanged();
  };

  const remove = async (item: WatchListItem) => {
    await removeFromWatch(item.id);
    await onChanged();
  };

  if (items.length === 0) {
    return <p className="text-sm text-neutral-500">Your watchlist is empty — search above to add something.</p>;
  }

  const groups = STATUS_ORDER.map(status => ({
    status,
    items: items.filter(i => i.status === status)
  })).filter(g => g.items.length > 0);

  return (
    <div className="flex flex-col gap-4">
      {groups.map(group => (
        <section key={group.status}>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            {STATUS_LABELS[group.status]} ({group.items.length})
          </h2>
          <div className="flex flex-col gap-2">
            {group.items.map(item => {
              const roku = pickRokuDeepLink(item, services);
              const trailer = item.media?.trailer;
              return (
                <div key={item.id} className="rounded-lg border border-line bg-panel p-2">
                  <div className="flex items-center gap-3">
                    {item.media?.poster ? (
                      <img src={item.media.poster} alt="" className="h-16 w-11 shrink-0 rounded object-cover" />
                    ) : (
                      <div className="h-16 w-11 shrink-0 rounded bg-panel-2" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-neutral-100">{item.media?.title ?? item.id}</p>
                      <p className="text-xs text-neutral-500">
                        {item.media?.showType === 'series' ? 'Series' : 'Movie'}
                        {item.media?.year ? ` · ${item.media.year}` : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleFavorite(item)}
                      aria-label={item.favorite ? 'Remove from favorites' : 'Add to favorites'}
                      title={item.favorite ? 'Favorited' : 'Add to favorites'}
                      className={`shrink-0 p-1 transition-colors ${
                        item.favorite ? 'text-amber-400' : 'text-neutral-500 hover:text-amber-400'
                      }`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill={item.favorite ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinejoin="round"
                      >
                        <path d="M12 2.5l2.9 6.06 6.6.62-4.98 4.4 1.46 6.48L12 16.9l-5.98 3.16 1.46-6.48L2.5 9.18l6.6-.62L12 2.5z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      disabled={!active || !roku?.channelId}
                      onClick={() => cast(item)}
                      title={!active ? 'Select a device first' : !roku?.channelId ? 'No deep link for this title' : 'Cast to TV'}
                      className="shrink-0 rounded-lg bg-accent px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-40"
                    >
                      Cast
                    </button>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <select
                      value={item.status}
                      onChange={e => changeStatus(item, e.target.value as WatchStatus)}
                      className="rounded border border-line bg-panel-2 px-2 py-1 text-xs text-neutral-300"
                    >
                      {STATUS_ORDER.map(status => (
                        <option key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                    {trailer && (
                      <button
                        type="button"
                        onClick={() => openTrailer(item.media?.title ?? item.id, trailer.key)}
                        className="text-xs text-neutral-400 transition-colors hover:text-white"
                      >
                        Trailer
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => remove(item)}
                      className="ml-auto text-xs text-neutral-500 transition-colors hover:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};
