import { useEffect, useState } from 'react';

export type Orientation = 'portrait' | 'landscape';

const current = (): Orientation =>
  window.matchMedia('(orientation: landscape)').matches ? 'landscape' : 'portrait';

// Tracks device/window orientation so the Watch view can swap the poster grid for Cover Flow.
export const useOrientation = (): Orientation => {
  const [orientation, setOrientation] = useState<Orientation>(current);

  useEffect(() => {
    const mq = window.matchMedia('(orientation: landscape)');
    const update = () => setOrientation(mq.matches ? 'landscape' : 'portrait');
    mq.addEventListener('change', update);
    window.addEventListener('resize', update);
    return () => {
      mq.removeEventListener('change', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return orientation;
};
