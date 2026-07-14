import { useEffect, useRef, useState } from 'react';

import { rokuAppIcon, rokuKeypress, rokuMediaPlayer, type RokuMediaPlayer } from '@/api/ipc';
import { useCastTitleStore } from '@/stores/castTitleStore';
import { PauseIcon, PlayIcon } from '@/components/RemoteIcons';

const POLL_MS = 4000;

// The Roku doesn't report content titles, so a remembered cast title is only trustworthy for a while and
// only while the same app stays in the foreground.
const CAST_TITLE_MAX_AGE_MS = 12 * 60 * 60 * 1000;
// A "content changed on the device" signal: the position jumped from well into playback back to the start
// (same app), which means something started without us casting → drop the remembered title.
const RESET_PREV_MIN_MS = 60_000;
const RESET_NEAR_START_MS = 15_000;

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

  const cast = useCastTitleStore(s => s.titles[ip]);
  const clearCastTitle = useCastTitleStore(s => s.clearCastTitle);
  const prevRef = useRef<{ app: string | null; pos: number }>({ app: null, pos: 0 });

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

  // Drop the remembered cast title when the content changes on the device without a new cast — detected as
  // the position resetting to the start while the same app stays foreground.
  useEffect(() => {
    if (!media) return;
    const app = media.app_id ?? null;
    const pos = media.position_ms ?? 0;
    const prev = prevRef.current;
    if (app && prev.app === app && prev.pos > RESET_PREV_MIN_MS && pos < RESET_NEAR_START_MS) {
      clearCastTitle(ip);
    }
    if (app) prevRef.current = { app, pos };
  }, [media, ip, clearCastTitle]);

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

  // Show the title we cast — but only while the same app is foreground and it's recent.
  const castTitle =
    cast && cast.appId === media.app_id && Date.now() - cast.castAt < CAST_TITLE_MAX_AGE_MS ? cast.title : null;
  const appName = media.app_name ?? 'Unknown app';

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
        <p className="truncate text-sm font-medium text-neutral-100">{castTitle ?? appName}</p>
        {castTitle && <p className="truncate text-[11px] text-neutral-500">{appName}</p>}

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
