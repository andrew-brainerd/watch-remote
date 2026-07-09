import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { useTrailerStore } from '@/stores/trailerStore';
import type { WatchListItem } from '@/types/watch';

interface CoverFlowProps {
  items: WatchListItem[];
  onCast: (item: WatchListItem) => void;
}

const POSTER_RATIO = 2 / 3; // width / height of a movie poster
const DRAG_STEP = 64; // px of horizontal drag per one cover
const TAP_THRESHOLD = 6;

// Classic Cover Flow placement, expressed relative to cover width `w` so it scales with the covers:
// the centered cover is flat and front; neighbours tilt away with perspective and recede.
const coverTransform = (offset: number, w: number): string => {
  const clamped = Math.max(-1, Math.min(1, offset));
  const rotate = -clamped * 55;
  const translateX = (offset * 0.36 + clamped * 0.53) * w;
  const translateZ = -Math.min(Math.abs(offset), 4) * 0.44 * w;
  const scale = 1 + Math.max(0, 1 - Math.abs(offset)) * 0.12;
  return `translate(-50%, -50%) translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotate}deg) scale(${scale})`;
};

const REFLECTION: CSSProperties = {
  WebkitBoxReflect: 'below 3px linear-gradient(transparent, transparent 52%, rgba(255, 255, 255, 0.22))'
};

export const CoverFlow = ({ items, onCast }: CoverFlowProps) => {
  const openTrailer = useTrailerStore(s => s.open);
  const [pos, setPos] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [stage, setStage] = useState({ w: 0, h: 0 });
  const stageRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startX: number; startPos: number; moved: number } | null>(null);
  const suppressClick = useRef(false);

  // Cover art is sized off the actual carousel area so it fills the screen (esp. landscape immersive mode)
  // instead of sitting as a small fixed block. Reflection eats into the area below, so cap ~72% of height.
  const coverH = Math.max(120, Math.min(stage.h * 0.72, stage.w * 0.42, 460));
  const coverW = coverH * POSTER_RATIO;

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    // Round to whole px and bail when unchanged (same object ref → React skips the re-render). Without
    // this, WKWebView's sub-pixel resize oscillation retriggers the observer forever → React #185.
    const measure = () => {
      const w = Math.round(el.clientWidth);
      const h = Math.round(el.clientHeight);
      setStage(prev => (prev.w === w && prev.h === h ? prev : { w, h }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const max = Math.max(0, items.length - 1);
  const clamp = (p: number) => Math.max(0, Math.min(max, p));
  const centerIndex = clamp(Math.round(pos));
  const centerItem = items[centerIndex];
  const centerTrailer = centerItem?.media?.trailer;

  useEffect(() => {
    setPos(p => Math.max(0, Math.min(items.length - 1, p)));
  }, [items.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setPos(p => clamp(Math.round(p) - 1));
      else if (e.key === 'ArrowRight') setPos(p => clamp(Math.round(p) + 1));
      else if (e.key === 'Enter' && centerItem) onCast(centerItem);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [centerItem, onCast, max]);

  const onPointerDown = (e: ReactPointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { startX: e.clientX, startPos: pos, moved: 0 };
    setDragging(true);
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    d.moved = Math.max(d.moved, Math.abs(dx));
    setPos(clamp(d.startPos - dx / DRAG_STEP));
  };

  const endDrag = () => {
    const d = drag.current;
    if (!d) return;
    suppressClick.current = d.moved > TAP_THRESHOLD;
    drag.current = null;
    setDragging(false);
    setPos(p => clamp(Math.round(p)));
  };

  const onCoverClick = (n: number, item: WatchListItem) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    if (n === centerIndex) {
      onCast(item);
    } else {
      setPos(n);
    }
  };

  return (
    <div className="flex h-full w-full select-none flex-col items-center justify-center gap-3">
      <div
        ref={stageRef}
        className="relative w-full min-h-0 flex-1 touch-none overflow-hidden"
        style={{ perspective: '1200px' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {items.map((item, n) => {
          const offset = n - pos;
          if (Math.abs(offset) > 4.5) return null;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onCoverClick(n, item)}
              className="absolute left-1/2 top-1/2 rounded"
              style={{
                width: coverW,
                height: coverH,
                transform: coverTransform(offset, coverW),
                zIndex: 1000 - Math.round(Math.abs(offset) * 10),
                transition: dragging ? 'none' : 'transform 0.35s ease-out',
                opacity: Math.abs(offset) > 3.6 ? 0 : 1
              }}
            >
              {item.media?.poster ? (
                <img
                  src={item.media.poster}
                  alt={item.media?.title ?? ''}
                  draggable={false}
                  className="h-full w-full rounded object-cover shadow-xl"
                  style={REFLECTION}
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center rounded bg-panel-2 p-2 text-center text-[11px] text-neutral-300">
                  {item.media?.title ?? item.id}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className="max-w-[80%] shrink-0 truncate text-center text-sm font-medium text-white">{centerItem?.media?.title}</p>
      {centerTrailer && (
        <button
          type="button"
          onClick={() => openTrailer(centerItem?.media?.title ?? '', centerTrailer.key)}
          className="shrink-0 text-xs text-neutral-400 underline transition-colors hover:text-white"
        >
          Watch trailer
        </button>
      )}
    </div>
  );
};
