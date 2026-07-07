import { useEffect, useState } from 'react';
import { getWatchList } from '@/api/watchApi';
import { useDeviceStore } from '@/stores/deviceStore';
import { rokuLaunch } from '@/api/ipc';
import type { WatchListItem, WatchListResponse, WatchStatus } from '@/types/watch';

const STATUS_ORDER: WatchStatus[] = ['watching', 'watchlist', 'completed', 'dropped'];
const STATUS_LABELS: Record<WatchStatus, string> = {
  watching: 'Watching',
  watchlist: 'Watchlist',
  completed: 'Completed',
  dropped: 'Dropped'
};

const primaryRoku = (item: WatchListItem) => item.media?.streamingOptions.find(o => o.roku)?.roku;

export const Library = () => {
  const [data, setData] = useState<WatchListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { devices, activeId } = useDeviceStore();
  const active = devices.find(d => d.id === activeId);

  useEffect(() => {
    let cancelled = false;
    getWatchList()
      .then(res => {
        if (!cancelled) {
          setData(res);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(String(err));
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const cast = (item: WatchListItem) => {
    const roku = primaryRoku(item);
    if (!active || !roku?.channelId) return;
    rokuLaunch(active.ip, roku.channelId, roku.contentId, roku.mediaType).catch(() => {});
  };

  if (loading) return <p className="text-sm text-neutral-500">Loading your library…</p>;
  if (error) return <p className="text-sm text-red-400">Couldn&apos;t load library — {error}</p>;

  const items = data?.items ?? [];
  if (items.length === 0) {
    return <p className="text-sm text-neutral-500">Your watchlist is empty. Add titles on the web app.</p>;
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
              const roku = primaryRoku(item);
              return (
                <div key={item.id} className="flex items-center gap-3 rounded-lg border border-line bg-panel p-2">
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
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};
