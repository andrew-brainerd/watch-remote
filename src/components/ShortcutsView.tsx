import { useEffect, useMemo, useState } from 'react';
import { useDeviceStore } from '@/stores/deviceStore';
import { rokuApps, rokuLaunch, type RokuApp } from '@/api/ipc';
import { getCachedIcon, loadIcon } from '@/api/rokuIcons';

interface ShortcutTileProps {
  app: RokuApp;
  ip: string;
  pinned: boolean;
  launched: boolean;
  onLaunch: () => void;
  onTogglePin: () => void;
}

const ShortcutTile = ({ app, ip, pinned, launched, onLaunch, onTogglePin }: ShortcutTileProps) => {
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

export const ShortcutsView = () => {
  const devices = useDeviceStore(s => s.devices);
  const activeId = useDeviceStore(s => s.activeId);
  const togglePin = useDeviceStore(s => s.togglePin);
  const active = devices.find(d => d.id === activeId);
  const ip = active?.ip;

  const [apps, setApps] = useState<RokuApp[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [launched, setLaunched] = useState<string | null>(null);

  useEffect(() => {
    if (!ip) {
      setApps([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(false);
    rokuApps(ip)
      .then(list => {
        if (!cancelled) setApps(list);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ip]);

  const pinnedIds = active?.pinnedShortcuts ?? [];
  const byId = useMemo(() => new Map(apps.map(a => [a.id, a])), [apps]);
  const pinned = useMemo(
    () => pinnedIds.map(id => byId.get(id)).filter((a): a is RokuApp => !!a),
    [pinnedIds, byId]
  );
  // Inputs first (fewer, and the physical devices), then channels alphabetical.
  const all = useMemo(() => {
    const inputs = apps.filter(a => a.kind === 'input');
    const channels = apps.filter(a => a.kind === 'app').sort((a, b) => a.name.localeCompare(b.name));
    return [...inputs, ...channels];
  }, [apps]);

  const launch = (id: string) => {
    if (!ip) return;
    rokuLaunch(ip, id).catch(() => {});
    setLaunched(id);
    window.setTimeout(() => setLaunched(current => (current === id ? null : current)), 900);
  };

  const tileProps = (app: RokuApp) => ({
    app,
    ip: ip as string,
    launched: launched === app.id,
    onLaunch: () => launch(app.id),
    onTogglePin: () => active && togglePin(active.id, app.id)
  });

  return (
    <div className="flex flex-col gap-4">
      {!active ? (
        <p className="text-center text-sm text-neutral-500">
          No device selected. Add or pick a Roku in Settings&nbsp;⚙.
        </p>
      ) : loading ? (
        <p className="text-center text-sm text-neutral-500">Loading shortcuts…</p>
      ) : error ? (
        <p className="text-center text-sm text-red-400">Couldn&apos;t reach {active.name}. Is it on and on the same network?</p>
      ) : (
        <>
          {pinned.length > 0 && (
            <section>
              <h2 className="mb-2 text-[11px] uppercase tracking-wide text-neutral-600">Pinned</h2>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {pinned.map(app => (
                  <ShortcutTile key={`pin-${app.id}`} pinned {...tileProps(app)} />
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-2 text-[11px] uppercase tracking-wide text-neutral-600">All apps &amp; inputs</h2>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {all.map(app => (
                <ShortcutTile key={app.id} pinned={pinnedIds.includes(app.id)} {...tileProps(app)} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};
