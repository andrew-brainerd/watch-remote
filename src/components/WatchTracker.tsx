import { useCallback, useEffect, useMemo, useState } from 'react';
import { getWatchList } from '@/api/watchApi';
import type { WatchListResponse } from '@/types/watch';
import { WatchSearch } from '@/components/WatchSearch';
import { Library } from '@/components/Library';
import { ServicesModal } from '@/components/ServicesModal';

export const WatchTracker = () => {
  const [data, setData] = useState<WatchListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await getWatchList();
      setData(res);
      setError(null);
    } catch (e) {
      setError(String(e));
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const items = data?.items ?? [];
  const services = data?.settings.services ?? [];
  const existingIds = useMemo(() => new Set(items.map(i => i.id)), [items]);

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

      <WatchSearch existingIds={existingIds} onChanged={refresh} />

      {loading ? (
        <p className="text-sm text-neutral-500">Loading your library…</p>
      ) : error ? (
        <p className="text-sm text-red-400">Couldn&apos;t load library — {error}</p>
      ) : (
        <Library items={items} services={services} onChanged={refresh} />
      )}

      <ServicesModal open={settingsOpen} current={services} onClose={() => setSettingsOpen(false)} onSaved={refresh} />
    </div>
  );
};
