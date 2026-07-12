import { rokuAppIcon } from '@/api/ipc';

// App/input icons rarely change, so cache the fetched data: URLs (and misses as null)
// for the session, keyed by device IP + app id. Avoids re-hitting the TV per render.
const cache = new Map<string, string | null>();

const key = (ip: string, id: string): string => `${ip}|${id}`;

export const getCachedIcon = (ip: string, id: string): string | null | undefined => cache.get(key(ip, id));

export const loadIcon = async (ip: string, id: string): Promise<string | null> => {
  const cacheKey = key(ip, id);
  const existing = cache.get(cacheKey);
  if (existing !== undefined) return existing;
  try {
    const url = await rokuAppIcon(ip, id);
    cache.set(cacheKey, url);
    return url;
  } catch {
    cache.set(cacheKey, null); // no icon (e.g. a TV input) — fall back to a text tile
    return null;
  }
};
