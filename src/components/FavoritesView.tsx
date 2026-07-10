import { useWatchStore } from '@/stores/watchStore';
import { MediaBrowse } from '@/components/MediaBrowse';

// Titles the user starred (any status). Favorites are intentional, so the rental filter isn't applied.
export const FavoritesView = () => {
  const { data, loading, error } = useWatchStore();
  const items = (data?.items ?? []).filter(item => item.favorite);

  if (loading && !data) return <p className="text-sm text-neutral-500">Loading your favorites…</p>;
  if (error) return <p className="text-sm text-red-400">Couldn&apos;t load favorites — {error}</p>;

  return <MediaBrowse items={items} emptyText="No favorites yet — tap the star on a title in the Library tab." />;
};
