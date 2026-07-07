import { useEffect, useState } from 'react';
import { addToWatch, searchWatch } from '@/api/watchApi';
import type { WatchSearchResult, WatchStatus } from '@/types/watch';

const STATUSES: { value: WatchStatus; label: string }[] = [
  { value: 'watchlist', label: 'Watchlist' },
  { value: 'watching', label: 'Watching' },
  { value: 'completed', label: 'Completed' },
  { value: 'dropped', label: 'Dropped' }
];

interface WatchSearchProps {
  existingIds: Set<string>;
  onChanged: () => void | Promise<void>;
}

export const WatchSearch = ({ existingIds, onChanged }: WatchSearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<WatchSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    let active = true;
    setSearching(true);
    const timer = setTimeout(() => {
      searchWatch(q)
        .then(r => {
          if (active) {
            setResults(r);
            setSearching(false);
          }
        })
        .catch(() => {
          if (active) {
            setResults([]);
            setSearching(false);
          }
        });
    }, 400);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  const add = async (result: WatchSearchResult, status: WatchStatus) => {
    setAddingId(result.id);
    try {
      await addToWatch(result.id, result.showType, status);
      await onChanged();
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search movies & TV…"
        className="w-full rounded-lg border border-line bg-panel-2 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600"
      />

      {query.trim().length >= 2 && (
        <div className="mt-2 rounded-lg border border-line bg-panel">
          {searching && results.length === 0 ? (
            <p className="p-3 text-xs text-neutral-500">Searching…</p>
          ) : results.length === 0 ? (
            <p className="p-3 text-xs text-neutral-500">No results</p>
          ) : (
            <ul className="max-h-72 divide-y divide-line overflow-y-auto">
              {results.map(result => (
                <li key={result.id} className="flex items-center gap-2 p-2">
                  {result.poster ? (
                    <img src={result.poster} alt="" className="h-12 w-8 shrink-0 rounded object-cover" />
                  ) : (
                    <div className="h-12 w-8 shrink-0 rounded bg-panel-2" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs text-neutral-100">{result.title}</p>
                    <p className="text-[10px] text-neutral-500">
                      {result.showType === 'series' ? 'Series' : 'Movie'}
                      {result.year ? ` · ${result.year}` : ''}
                    </p>
                  </div>
                  {existingIds.has(result.id) ? (
                    <span className="shrink-0 text-[10px] text-neutral-600">In library</span>
                  ) : (
                    <select
                      defaultValue=""
                      disabled={addingId === result.id}
                      onChange={e => {
                        const value = e.target.value as WatchStatus | '';
                        e.target.value = '';
                        if (value) add(result, value);
                      }}
                      className="shrink-0 rounded border border-line bg-panel-2 px-1 py-1 text-[10px] text-neutral-300"
                    >
                      <option value="" disabled>
                        {addingId === result.id ? 'Adding…' : 'Add…'}
                      </option>
                      {STATUSES.map(s => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
