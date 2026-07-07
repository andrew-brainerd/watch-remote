import { invoke } from '@tauri-apps/api/core';
import { firebaseAuth } from '@/firebase';
import type { WatchListResponse } from '@/types/watch';

// Every call carries a fresh Firebase ID token; the Rust `watch_api` command adds the auth +
// X-Client headers and does the HTTP so we never hit CORS.
const idToken = async (): Promise<string> => {
  const user = firebaseAuth.currentUser;
  if (!user) throw new Error('Not signed in');
  return user.getIdToken();
};

const call = async <T>(method: string, path: string, body?: unknown): Promise<T> => {
  const token = await idToken();
  return invoke<T>('watch_api', { method, path, token, body: body ?? null });
};

export const getWatchList = (): Promise<WatchListResponse> => call('GET', '/watch/list?client=roku');
