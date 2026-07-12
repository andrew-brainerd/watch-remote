import { useEffect, useState } from 'react';

import { type RokuApp } from '@/api/ipc';
import { getCachedIcon, loadIcon } from '@/api/rokuIcons';

interface ShortcutTileProps {
  app: RokuApp;
  ip: string;
  pinned: boolean;
  launched: boolean;
  onLaunch: () => void;
  onTogglePin: () => void;
}

// A launcher tile for a Roku channel/input: cover-art (falls back to the name), tap to launch, star to
// pin. Shared by the Shortcuts catalog and the Remote tab's pinned strip.
export const ShortcutTile = ({ app, ip, pinned, launched, onLaunch, onTogglePin }: ShortcutTileProps) => {
  const [icon, setIcon] = useState<string | null | undefined>(getCachedIcon(ip, app.id));

  useEffect(() => {
    if (icon !== undefined) return;
    let cancelled = false;
    loadIcon(ip, app.id).then(url => {
      if (!cancelled) setIcon(url);
    });
    return () => {
      cancelled = true;
    };
  }, [ip, app.id, icon]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onLaunch}
        className={`flex w-full flex-col items-center gap-1.5 rounded-xl border bg-panel-2 p-2 transition-colors active:bg-accent/20 ${
          launched ? 'border-accent' : 'border-line'
        }`}
      >
        <div className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg bg-black/40">
          {icon ? (
            <img src={icon} alt="" className="h-full w-full object-contain" />
          ) : (
            <span className="px-1 text-center text-xs font-semibold leading-tight text-neutral-300">{app.name}</span>
          )}
        </div>
        <span className="w-full truncate text-center text-[11px] text-neutral-300">{app.name}</span>
      </button>
      {app.kind === 'input' && (
        <span className="pointer-events-none absolute left-1 top-1 rounded bg-black/60 px-1 text-[8px] uppercase tracking-wide text-neutral-300">
          input
        </span>
      )}
      <button
        type="button"
        aria-label={pinned ? `Unpin ${app.name}` : `Pin ${app.name}`}
        onClick={onTogglePin}
        className={`absolute right-1 top-1 rounded-full bg-black/50 px-1 text-sm leading-none transition-colors ${
          pinned ? 'text-accent' : 'text-neutral-500 hover:text-neutral-200'
        }`}
      >
        {pinned ? '★' : '☆'}
      </button>
    </div>
  );
};
