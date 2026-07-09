import { useMemo, useState } from 'react';
import { useWatchStore } from '@/stores/watchStore';
import { usePrefsStore } from '@/stores/prefsStore';
import { requiresRental } from '@/utils/roku';
import { WatchSearch } from '@/components/WatchSearch';
import { Library } from '@/components/Library';
import { ServicesModal } from '@/components/ServicesModal';

export const LibraryView = () => {
  const { data, loading, error, load } = useWatchStore();
  const showRentalTitles = usePrefsStore(s => s.showRentalTitles);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const allItems = data?.items ?? [];
  const items = allItems.filter(item => showRentalTitles || !requiresRental(item));
  const services = data?.settings.services ?? [];
  // Dedup search against the full list (including hidden rentals) so we don't re-offer an existing title.
  const existingIds = useMemo(() => new Set(allItems.map(item => item.id)), [allItems]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-neutral-500">
          {services.length > 0 ? `${services.length} service${services.length === 1 ? '' : 's'} configured` : 'No services set'}
        </p>
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="rounded border border-line px-2 py-1 text-xs text-neutral-300 transition-colors hover:text-white"
        >
          My services
        </button>
      </div>

      <WatchSearch existingIds={existingIds} onChanged={load} />

      {loading && !data ? (
        <p className="text-sm text-neutral-500">Loading your library…</p>
      ) : error ? (
        <p className="text-sm text-red-400">Couldn&apos;t load library — {error}</p>
      ) : (
        <Library items={items} services={services} onChanged={load} />
      )}

      <ServicesModal open={settingsOpen} current={services} onClose={() => setSettingsOpen(false)} onSaved={load} />
    </div>
  );
};
