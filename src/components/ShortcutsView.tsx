import { useEffect, useMemo, useState } from 'react';
import { useDeviceStore } from '@/stores/deviceStore';
import { rokuApps, rokuLaunch, type RokuApp } from '@/api/ipc';
import { ShortcutTile } from '@/components/ShortcutTile';

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
        <section>
          <h2 className="mb-2 text-[11px] uppercase tracking-wide text-neutral-600">All apps &amp; inputs</h2>
          <p className="mb-3 text-xs text-neutral-500">Tap the star to pin — pinned shortcuts show on the Remote tab.</p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {all.map(app => (
              <ShortcutTile key={app.id} pinned={pinnedIds.includes(app.id)} {...tileProps(app)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
