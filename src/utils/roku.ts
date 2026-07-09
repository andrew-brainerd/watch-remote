import type { RokuDeepLink, WatchListItem } from '@/types/watch';

// Prefer a deep-linkable option on a service the user subscribes to; fall back to any deep link.
export const pickRokuDeepLink = (item: WatchListItem, services: string[]): RokuDeepLink | undefined => {
  const options = item.media?.streamingOptions ?? [];
  const mine = options.find(option => option.roku && services.includes(option.service.id));
  return (mine ?? options.find(option => option.roku))?.roku;
};
