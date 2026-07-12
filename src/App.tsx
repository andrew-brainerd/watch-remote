import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useWatchStore } from '@/stores/watchStore';
import { useServicesStore } from '@/stores/servicesStore';
import { useDeviceStore } from '@/stores/deviceStore';
import { useOrientation } from '@/hooks/useOrientation';
import { isMobile } from '@/utils/platform';
import { Login } from '@/components/Login';
import { WatchView } from '@/components/WatchView';
import { FavoritesView } from '@/components/FavoritesView';
import { LibraryView } from '@/components/LibraryView';
import { ShortcutsView } from '@/components/ShortcutsView';
import { RemoteTab } from '@/components/RemoteTab';
import { DeviceSwitcher } from '@/components/DeviceSwitcher';
import { CastConfirmModal } from '@/components/CastConfirmModal';
import { TrailerModal } from '@/components/TrailerModal';
import { SettingsModal } from '@/components/SettingsModal';

const TABS = [
  { id: 'remote', label: 'Remote' },
  { id: 'watch', label: 'Watch' },
  { id: 'favorites', label: 'Favorites' },
  { id: 'library', label: 'Library' },
  { id: 'shortcuts', label: 'Shortcuts' }
] as const;
type TabId = (typeof TABS)[number]['id'];

export const App = () => {
  const { user, ready } = useAuthStore();
  const load = useWatchStore(s => s.load);
  const loadServices = useServicesStore(s => s.load);
  // Stable selector (returns the stored array ref or undefined) — deriving the count outside avoids the
  // new-array-every-render trap that loops useSyncExternalStore.
  const watchItems = useWatchStore(s => s.data?.items);
  const orientation = useOrientation();
  // Remote is the default view (quickest to reach); the watchlist loads in the background below.
  const [tab, setTab] = useState<TabId>('remote');
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (user) {
      load();
      loadServices();
      // Pull the account's saved devices so they appear on this client too.
      void useDeviceStore.getState().syncFromBackend();
    }
  }, [user, load, loadServices]);

  // Landscape Cover Flow is a focused, full-screen browse mode: hide the app chrome (rotate back to
  // portrait to switch tabs). Mobile only — on desktop the "landscape" is just a wide window and hiding
  // the nav would be surprising. Only when there are titles to show, else the nav would be trapped.
  const hasWatchCovers = !!watchItems?.some(i => i.status === 'watching' || i.status === 'watchlist');
  const hasFavorites = !!watchItems?.some(i => i.favorite);
  const coverTab = (tab === 'watch' && hasWatchCovers) || (tab === 'favorites' && hasFavorites);
  const immersive = isMobile && orientation === 'landscape' && coverTab;

  if (!ready) {
    return <div className="flex min-h-full items-center justify-center text-sm text-neutral-500">Loading…</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div
      className={`mx-auto flex h-full flex-col ${isMobile && orientation === 'portrait' ? 'max-w-md' : 'w-full'}`}
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)'
      }}
    >
      {!immersive && (
        <header className="flex items-center justify-between px-4 pb-2 pt-3">
          <DeviceSwitcher onManage={() => setSettingsOpen(true)} />
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Settings"
              onClick={() => setSettingsOpen(true)}
              className="text-neutral-500 transition-colors hover:text-neutral-300"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </div>
        </header>
      )}

      {!immersive && (
        <nav role="tablist" className="no-scrollbar flex shrink-0 gap-1 overflow-x-auto overflow-y-hidden border-b border-line px-4">
          {TABS.map(t => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`-mb-px shrink-0 whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                tab === t.id ? 'border-accent text-white' : 'border-transparent text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      )}

      <main className={`min-h-0 flex-1 overflow-y-auto overscroll-y-contain ${immersive ? 'p-2' : 'p-4'}`}>
        {tab === 'remote' ? (
          <RemoteTab />
        ) : tab === 'watch' ? (
          <WatchView />
        ) : tab === 'favorites' ? (
          <FavoritesView />
        ) : tab === 'library' ? (
          <LibraryView />
        ) : (
          <ShortcutsView />
        )}
      </main>

      <CastConfirmModal />
      <TrailerModal />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
};
