import { useBackgroundStore } from '@/stores/backgroundStore';

// Full-screen custom wallpaper behind the app: the chosen image with user-adjustable blur, plus a fixed
// scrim so the UI stays readable over any photo. Fixed so it doesn't scroll with content. Renders nothing
// when no image is set (the default canvas background shows through).
export const Background = () => {
  const image = useBackgroundStore(s => s.image);
  const blur = useBackgroundStore(s => s.blur);

  if (!image) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0 bg-cover bg-center"
        // Scale up slightly so the blur's soft edges don't reveal the canvas at the borders.
        style={{
          backgroundImage: `url(${image})`,
          filter: `blur(${blur}px)`,
          transform: 'scale(1.15)'
        }}
      />
      <div className="absolute inset-0 bg-black/40" />
    </div>
  );
};
