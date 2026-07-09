import { invoke } from '@tauri-apps/api/core';
import { firebaseAuth } from '@/firebase';
import { useConfigStore } from '@/stores/configStore';
import type {
  ShowType,
  StreamingServiceRef,
  WatchListResponse,
  WatchSearchResult,
  WatchStatus
} from '@/types/watch';

// Every call carries a fresh Firebase ID token; the Rust `watch_api` command adds the auth +
// X-Client headers and does the HTTP so we never hit CORS.
const idToken = async (): Promise<string> => {
  const user = firebaseAuth.currentUser;
  if (!user) throw new Error('Not signed in');
  return user.getIdToken();
};

const call = async <T>(method: string, path: string, body?: unknown): Promise<T> => {
  const token = await idToken();
  const base = useConfigStore.getState().apiBase;
  return invoke<T>('watch_api', { method, path, token, body: body ?? null, base });
};

export const getWatchList = (): Promise<WatchListResponse> => call('GET', '/watch/list?client=roku');

export const searchWatch = (q: string): Promise<WatchSearchResult[]> =>
  call('GET', `/watch/search?q=${encodeURIComponent(q)}`);

export const addToWatch = (id: string, showType: ShowType, status?: WatchStatus): Promise<unknown> =>
  call('POST', '/watch/list', { id, showType, status });

export const updateWatchItem = (
  id: string,
  patch: { status?: WatchStatus; preferredService?: string }
): Promise<unknown> => call('PATCH', `/watch/list/${id}`, patch);

export const removeFromWatch = (id: string): Promise<unknown> => call('DELETE', `/watch/list/${id}`);

export const getWatchServices = (): Promise<StreamingServiceRef[]> => call('GET', '/watch/services');

export const updateWatchSettings = (services: string[]): Promise<unknown> =>
  call('PUT', '/watch/settings', { services });
