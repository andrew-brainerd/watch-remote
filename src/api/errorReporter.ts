import { invoke } from '@tauri-apps/api/core';
import { firebaseAuth } from '@/firebase';
import { useConfigStore } from '@/stores/configStore';
import { isMobile } from '@/utils/platform';

const APP = 'rimokon-miru';
const DEDUPE_MS = 30_000;

const seen = new Map<string, number>();

// A crash loop or a repeatedly-tapped dead button would otherwise flood the collection.
export const shouldReport = (key: string, now: number = Date.now()): boolean => {
  const last = seen.get(key);
  if (last !== undefined && now - last < DEDUPE_MS) return false;
  seen.set(key, now);
  return true;
};

export const resetReportedErrors = () => seen.clear();

// Reporting goes out over the same Rust proxy as everything else, so a failure inside it would
// recurse. This latch is what stops that.
let reporting = false;

export const reportAppError = async (
  context: string,
  message: string,
  detail?: Record<string, string>
): Promise<void> => {
  if (reporting) return;
  if (!shouldReport(`${context}|${message}`)) return;

  const user = firebaseAuth.currentUser;
  if (!user) return;

  reporting = true;
  try {
    const token = await user.getIdToken();
    await invoke('watch_api', {
      method: 'POST',
      path: '/app/errors',
      token,
      base: useConfigStore.getState().apiBase,
      body: {
        context,
        message: message.slice(0, 2000),
        app: APP,
        version: __APP_VERSION__,
        platform: isMobile ? 'mobile' : 'desktop',
        detail: { userAgent: navigator.userAgent, ...detail }
      }
    });
  } catch {
    // Nothing useful to do — surfacing this would be the loop we just guarded against.
  } finally {
    reporting = false;
  }
};
