import { create } from 'zustand';
import { getWatchServices } from '@/api/watchApi';
import type { StreamingServiceRef } from '@/types/watch';

// The country's full streaming-service catalog (id + name + logo). Loaded once and shared by the
// services picker and the cast modal (which needs id→name to match a required add-on to a subscription).
interface ServicesStore {
  catalog: StreamingServiceRef[];
  load: () => Promise<void>;
}

export const useServicesStore = create<ServicesStore>((set, get) => ({
  catalog: [],
  load: async () => {
    if (get().catalog.length > 0) return;
    try {
      set({ catalog: await getWatchServices() });
    } catch {
      // Best-effort — a missing catalog just means we can't hide owned-add-on options.
    }
  }
}));
