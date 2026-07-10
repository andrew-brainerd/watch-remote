import { useDeviceStore } from '@/stores/deviceStore';
import { useCastStore } from '@/stores/castStore';
import { useOrientation } from '@/hooks/useOrientation';
import { CoverFlow } from '@/components/CoverFlow';
import type { WatchListItem } from '@/types/watch';

interface MediaBrowseProps {
  items: WatchListItem[];
  emptyText: string;
}

// Shared cover browser: a poster grid in portrait, Cover Flow in landscape; tapping a title opens the
// cast-confirm modal. Used by the Watch and Favorites tabs.
export const MediaBrowse = ({ items, emptyText }: MediaBrowseProps) => {
  const { devices, activeId } = useDeviceStore();
  const active = devices.find(d => d.id === activeId);
  const orientation = useOrientation();
  const requestCast = useCastStore(s => s.request);

  // Selecting a title always opens the confirm modal; it validates device + deep link and explains when
  // a cast isn't possible, rather than silently doing nothing here.
  const cast = (item: WatchListItem) => requestCast(item);

  if (items.length === 0) {
    return <p className="text-sm text-neutral-500">{emptyText}</p>;
  }

  if (orientation === 'landscape') {
    return <CoverFlow items={items} onCast={cast} />;
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
