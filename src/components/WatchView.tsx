import { useWatchStore } from '@/stores/watchStore';
import { usePrefsStore } from '@/stores/prefsStore';
import { requiresRental } from '@/utils/roku';
import { MediaBrowse } from '@/components/MediaBrowse';
import type { WatchStatus } from '@/types/watch';

// The "want to watch / watching now" set — the active watchlist, minus the completed/dropped archive.
const SHOWN_STATUSES: WatchStatus[] = ['watching', 'watchlist'];

export const WatchView = () => {
  const { data, loading, error } = useWatchStore();
  const showRentalTitles = usePrefsStore(s => s.showRentalTitles);

  const items = (data?.items ?? [])
    .filter(item => SHOWN_STATUSES.includes(item.status))
    .filter(item => showRentalTitles || !requiresRental(item));

  if (loading && !data) return <p className="text-sm text-neutral-500">Loading your watchlist…</p>;
  if (error) return <p className="text-sm text-red-400">Couldn&apos;t load watchlist — {error}</p>;

  return <MediaBrowse items={items} emptyText="Nothing on your watchlist yet — add shows in the Library tab." />;
};
