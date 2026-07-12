import { useEffect, useMemo, useState } from 'react';

import { rokuApps, rokuLaunch, type RokuApp } from '@/api/ipc';
import { getCachedIcon, loadIcon } from '@/api/rokuIcons';
import { remoteButtonClass } from '@/components/Remote';
import { customShortcutIcon } from '@/components/ShortcutIcons';

interface PinnedButtonProps {
  app: RokuApp;
  ip: string;
  onLaunch: () => void;
}

// A pinned launcher styled to match the remote's control buttons: the app icon inside an outlined tile
// (falls back to the app name when the TV has no icon for it).
const PinnedButton = ({ app, ip, onLaunch }: PinnedButtonProps) => {
  // A custom brand glyph (Steam / Apple TV / Nintendo Switch) overrides the TV artwork when it matches.
  const CustomIcon = customShortcutIcon(app.name);
  const [icon, setIcon] = useState<string | null | undefined>(getCachedIcon(ip, app.id));

  useEffect(() => {
    if (CustomIcon || icon !== undefined) return;
    let cancelled = false;
    loadIcon(ip, app.id).then(url => !cancelled && setIcon(url));
    return () => {
      cancelled = true;
    };
  }, [ip, app.id, icon, CustomIcon]);

  return (
    <button
      type="button"
      onClick={onLaunch}
      aria-label={`Launch ${app.name}`}
      title={app.name}
      // Same size as the control keys, but filled (they're outline-only) so shortcuts read as distinct
      // and app logos have a background for contrast.
      className={`${remoteButtonClass} bg-panel-2`}
    >
      {CustomIcon ? (
        <CustomIcon className="h-7 w-7" />
      ) : icon ? (
        <img src={icon} alt="" className="h-6 w-full object-contain" />
      ) : (
        <span className="truncate px-1 text-[11px] font-medium text-neutral-300">{app.name}</span>
      )}
    </button>
  );
};

interface PinnedShortcutsProps {
  ip: string;
  pinnedIds: string[];
}

// The device's pinned launcher shortcuts, in the same 3-up grid as the remote keys at the bottom of the
// Remote tab. Renders nothing when there are no pins. Pin/unpin is managed in the Shortcuts tab.
export const PinnedShortcuts = ({ ip, pinnedIds }: PinnedShortcutsProps) => {
  const [apps, setApps] = useState<RokuApp[]>([]);

  useEffect(() => {
    let cancelled = false;
    rokuApps(ip)
      .then(list => !cancelled && setApps(list))
      .catch(() => !cancelled && setApps([]));
    return () => {
      cancelled = true;
    };
  }, [ip]);

  const byId = useMemo(() => new Map(apps.map(a => [a.id, a])), [apps]);
  const pinned = useMemo(
    () => pinnedIds.map(id => byId.get(id)).filter((a): a is RokuApp => !!a),
    [pinnedIds, byId]
  );

  if (pinned.length === 0) return null;

  const launch = (id: string) => {
    rokuLaunch(ip, id).catch(() => {});
  };

  return (
    <div className="grid grid-cols-3 gap-2 border-t border-line pt-3">
      {pinned.map(app => (
        <PinnedButton key={app.id} app={app} ip={ip} onLaunch={() => launch(app.id)} />
      ))}
    </div>
  );
};
