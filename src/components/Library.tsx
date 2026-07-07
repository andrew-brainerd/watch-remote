import { useDeviceStore } from '@/stores/deviceStore';
import { rokuLaunch } from '@/api/ipc';
import { removeFromWatch, updateWatchItem } from '@/api/watchApi';
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

// Prefer a deep-linkable option on a service the user subscribes to; fall back to any deep link.
const pickRoku = (item: WatchListItem, services: string[]) => {
  const options = item.media?.streamingOptions ?? [];
  const mine = options.find(o => o.roku && services.includes(o.service.id));
  return (mine ?? options.find(o => o.roku))?.roku;
};

export const Library = ({ items, services, onChanged }: LibraryProps) => {
  const { devices, activeId } = useDeviceStore();
  const active = devices.find(d => d.id === activeId);

  const cast = (item: WatchListItem) => {
    const roku = pickRoku(item, services);
    if (!active || !roku?.channelId) return;
    rokuLaunch(active.ip, roku.channelId, roku.contentId, roku.mediaType).catch(() => {});
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
              const roku = pickRoku(item, services);
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
                    <button
                      type="button"
                      onClick={() => remove(item)}
                      className="text-xs text-neutral-500 transition-colors hover:text-red-400"
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
