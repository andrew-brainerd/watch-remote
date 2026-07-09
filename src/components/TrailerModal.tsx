import { useTrailerStore } from '@/stores/trailerStore';

// In-app YouTube embed for a title's trailer. CSP is disabled in tauri.conf, so the iframe loads.
export const TrailerModal = () => {
  const { trailer, close } = useTrailerStore();
  if (!trailer) return null;

  const src = `https://www.youtube.com/embed/${trailer.key}?autoplay=1&playsinline=1&rel=0`;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/90 p-4" onClick={close}>
      <div className="w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="truncate text-sm font-medium text-white">{trailer.title} — Trailer</p>
          <button type="button" onClick={close} aria-label="Close" className="text-lg leading-none text-neutral-400 hover:text-white">
            ✕
          </button>
        </div>
        <div className="relative w-full overflow-hidden rounded-lg bg-black" style={{ aspectRatio: '16 / 9' }}>
          <iframe
            src={src}
            title={`${trailer.title} trailer`}
            className="absolute inset-0 h-full w-full"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};
