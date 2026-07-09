import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import type { WatchListItem } from '@/types/watch';

interface CoverFlowProps {
  items: WatchListItem[];
  onCast: (item: WatchListItem) => void;
  canCast: boolean;
}

const COVER_W = 118;
const COVER_H = 172;
const DRAG_STEP = 64; // px of horizontal drag per one cover
const TAP_THRESHOLD = 6;

// Classic Cover Flow placement: the centered cover is flat and front; neighbours tilt away with
// perspective and recede. Continuous in `offset` so it interpolates smoothly while dragging.
const coverTransform = (offset: number): string => {
  const clamped = Math.max(-1, Math.min(1, offset));
  const rotate = -clamped * 55;
  const translateX = offset * 42 + clamped * 62;
  const translateZ = -Math.min(Math.abs(offset), 4) * 52;
  const scale = 1 + Math.max(0, 1 - Math.abs(offset)) * 0.12;
  return `translate(-50%, -50%) translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotate}deg) scale(${scale})`;
};

const REFLECTION: CSSProperties = {
  WebkitBoxReflect: 'below 3px linear-gradient(transparent, transparent 52%, rgba(255, 255, 255, 0.22))'
};

export const CoverFlow = ({ items, onCast, canCast }: CoverFlowProps) => {
  const [pos, setPos] = useState(0);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ startX: number; startPos: number; moved: number } | null>(null);
  const suppressClick = useRef(false);

  const max = Math.max(0, items.length - 1);
  const clamp = (p: number) => Math.max(0, Math.min(max, p));
  const centerIndex = clamp(Math.round(pos));
  const centerItem = items[centerIndex];

  useEffect(() => {
    setPos(p => Math.max(0, Math.min(items.length - 1, p)));
  }, [items.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setPos(p => clamp(Math.round(p) - 1));
      else if (e.key === 'ArrowRight') setPos(p => clamp(Math.round(p) + 1));
      else if (e.key === 'Enter' && centerItem && canCast) onCast(centerItem);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [centerItem, canCast, onCast, max]);

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
      if (canCast) onCast(item);
    } else {
      setPos(n);
    }
  };

  return (
    <div className="flex select-none flex-col items-center gap-2">
      <div
        className="relative w-full touch-none overflow-hidden"
        style={{ height: COVER_H + 96, perspective: '900px' }}
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
                width: COVER_W,
                height: COVER_H,
                transform: coverTransform(offset),
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

      <p className="max-w-[80%] truncate text-center text-sm font-medium text-white">{centerItem?.media?.title}</p>
      <button
        type="button"
        onClick={() => centerItem && canCast && onCast(centerItem)}
        disabled={!canCast || !centerItem}
        className="rounded-full bg-accent px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-40"
      >
        {canCast ? '▶ Cast' : 'Select a device to cast'}
      </button>
    </div>
  );
};
