import { useEffect, useState } from 'react';

import { rokuAppIcon, rokuKeypress, rokuMediaPlayer, type RokuMediaPlayer } from '@/api/ipc';
import { PauseIcon, PlayIcon } from '@/components/RemoteIcons';

const POLL_MS = 4000;

// Poll the device's media-player state while mounted. Returns the latest snapshot (null on error / no
// device). Side-effect-only, so co-located here rather than in utils.
const useNowPlaying = (ip: string): RokuMediaPlayer | null => {
  const [media, setMedia] = useState<RokuMediaPlayer | null>(null);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      try {
        const snapshot = await rokuMediaPlayer(ip);
        if (active) setMedia(snapshot);
      } catch {
        if (active) setMedia(null);
      }
      if (active) timer = setTimeout(poll, POLL_MS);
    };

    poll();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [ip]);

  return media;
};

// ms → "m:ss" (or "h:mm:ss" past an hour).
const formatTime = (ms: number): string => {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = h > 0 ? String(m).padStart(2, '0') : String(m);
  return `${h > 0 ? `${h}:` : ''}${mm}:${String(s).padStart(2, '0')}`;
};

// States that mean media is actually loaded (vs "close"/"stop"/"none" = nothing playing).
const ACTIVE_STATES = ['play', 'pause', 'buffer', 'startup'];

interface NowPlayingProps {
  ip: string;
}

export const NowPlaying = ({ ip }: NowPlayingProps) => {
  const media = useNowPlaying(ip);
  const [icon, setIcon] = useState<string | null>(null);
  const appId = media?.app_id ?? null;

  // Fetch the foreground app's icon (from the TV) when it changes.
  useEffect(() => {
    let active = true;
    if (appId) {
      rokuAppIcon(ip, appId)
        .then(dataUrl => active && setIcon(dataUrl))
        .catch(() => active && setIcon(null));
    } else {
      setIcon(null);
    }
    return () => {
      active = false;
    };
  }, [ip, appId]);

  const isPlaying = media && ACTIVE_STATES.includes(media.state) && (media.app_name || media.app_id);

  if (!isPlaying) {
    return (
      <div className="rounded-xl border border-line bg-panel p-2.5 text-center text-sm text-neutral-500">
        Nothing playing
      </div>
    );
  }

  const paused = media.state === 'pause';
  const pos = media.position_ms ?? 0;
  const dur = media.duration_ms ?? 0;
  const pct = dur > 0 ? Math.min(100, (pos / dur) * 100) : 0;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-panel p-2.5">
      {icon ? (
        <img src={icon} alt="" className="h-9 w-9 shrink-0 rounded object-contain" />
      ) : (
        <div className="h-9 w-9 shrink-0 rounded bg-panel-2" />
      )}

      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-neutral-500">
          {paused ? 'Paused' : 'Now playing'}
          {media.is_live && <span className="rounded bg-red-500/20 px-1 py-0.5 text-red-300">Live</span>}
        </p>
        <p className="truncate text-sm font-medium text-neutral-100">{media.app_name ?? 'Unknown app'}</p>

        {dur > 0 && !media.is_live && (
          <div className="mt-1.5">
            <div className="h-1 overflow-hidden rounded bg-panel-2">
              <div className="h-full rounded bg-accent" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-1 flex justify-between text-[10px] tabular-nums text-neutral-500">
              <span>{formatTime(pos)}</span>
              <span>{formatTime(dur)}</span>
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => rokuKeypress(ip, 'Play').catch(() => {})}
        aria-label={paused ? 'Resume' : 'Pause'}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-white transition active:opacity-80"
      >
        <span className="h-4 w-4">{paused ? <PlayIcon /> : <PauseIcon />}</span>
      </button>
    </div>
  );
};
