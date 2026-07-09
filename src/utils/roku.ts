import type { RokuDeepLink, StreamingServiceRef, WatchListItem } from '@/types/watch';

// Apps that show a "Who's watching?" profile picker on launch. After a deep-link cast we auto-press
// Select to pick the highlighted default profile so the deep link proceeds. Confirmed on-device.
export const PROFILE_GATE_APPS = new Set(['prime', 'disney', 'hbo']);

export interface CastOption {
  service: StreamingServiceRef;
  roku: RokuDeepLink;
  type: string;
  addon?: { id: string; name: string };
}

// Lower = more accessible. Prefer what's included in the base subscription over an add-on or purchase.
const ACCESS_RANK: Record<string, number> = { free: 0, subscription: 1, addon: 2, rent: 3, buy: 4 };
const accessRank = (type: string): number => ACCESS_RANK[type] ?? 5;

// Deep-linkable options, one per service — the best (most accessible) castable entry for each.
export const castableServices = (item: WatchListItem): CastOption[] => {
  const best = new Map<string, CastOption>();
  for (const option of item.media?.streamingOptions ?? []) {
    if (!option.roku) continue;
    const current = best.get(option.service.id);
    if (!current || accessRank(option.type) < accessRank(current.type)) {
      best.set(option.service.id, {
        service: option.service,
        roku: option.roku,
        type: option.type,
        addon: option.addon
      });
    }
  }
  return [...best.values()];
};

// A warning shown before casting when the title needs something beyond the base subscription; null when
// it's included. Add-ons name the required extra (e.g. "Requires the Crunchyroll add-on").
export const accessNote = (option: { type: string; addon?: { name: string } }): string | null => {
  if (option.type === 'addon') return `Requires the ${option.addon?.name ?? 'add-on'} add-on`;
  if (option.type === 'buy') return 'Purchase required';
  if (option.type === 'rent') return 'Rental required';
  return null;
};

// True when a title is only available to rent or buy — no free/subscription/add-on option anywhere.
// Unknown availability (no cached options) is not treated as rental, so we never hide un-hydrated titles.
export const requiresRental = (item: WatchListItem): boolean => {
  const options = item.media?.streamingOptions ?? [];
  return options.length > 0 && options.every(option => option.type === 'rent' || option.type === 'buy');
};

// Compact badge for the service picker (add-on name / Buy / Rent), or null when included.
export const accessLabel = (option: { type: string; addon?: { name: string } }): string | null => {
  if (option.type === 'addon') return option.addon?.name ?? 'Add-on';
  if (option.type === 'buy') return 'Buy';
  if (option.type === 'rent') return 'Rent';
  return null;
};

// True when the required add-on is a service the user already subscribes to directly. MOTN add-on ids
// are country-suffixed (e.g. "crunchyrollus") so they don't equal the standalone service id
// ("crunchyroll") — match on the add-on's name against the names of the user's subscribed services.
export const ownsAddon = (
  addon: { id: string; name: string } | undefined,
  subscribedIds: string[],
  catalog: StreamingServiceRef[]
): boolean => {
  if (!addon) return false;
  if (subscribedIds.includes(addon.id)) return true;
  const addonName = addon.name.trim().toLowerCase();
  return subscribedIds.some(id => catalog.find(s => s.id === id)?.name.trim().toLowerCase() === addonName);
};

// Pick the Roku deep link to cast: the user's saved preferred service wins, then a subscribed service,
// then any deep link.
export const pickRokuDeepLink = (
  item: WatchListItem,
  services: string[],
  preferredServiceId?: string
): RokuDeepLink | undefined => {
  const options = item.media?.streamingOptions ?? [];
  const preferred = preferredServiceId && options.find(option => option.roku && option.service.id === preferredServiceId);
  const mine = options.find(option => option.roku && services.includes(option.service.id));
  return (preferred || mine || options.find(option => option.roku))?.roku;
};
