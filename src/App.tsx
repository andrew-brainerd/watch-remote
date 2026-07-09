import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useDeviceStore } from '@/stores/deviceStore';
import { Login } from '@/components/Login';
import { WatchTracker } from '@/components/WatchTracker';
import { RemoteTab } from '@/components/RemoteTab';

const TABS = [
  { id: 'watch', label: 'Watch' },
  { id: 'remote', label: 'Remote' }
] as const;
type TabId = (typeof TABS)[number]['id'];

export const App = () => {
  const { user, ready, signOut } = useAuthStore();
  const { devices, activeId } = useDeviceStore();
  const active = devices.find(d => d.id === activeId);
  const [tab, setTab] = useState<TabId>('watch');

  if (!ready) {
    return <div className="flex min-h-full items-center justify-center text-sm text-neutral-500">Loading…</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div
      className="mx-auto flex h-full max-w-md flex-col"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <header className="flex items-center justify-between px-4 pb-2 pt-3">
        <div>
          <h1 className="text-base font-semibold text-neutral-100">Watch Remote</h1>
          <p className="text-[11px] text-neutral-500">{user.email}</p>
        </div>
        <button
          type="button"
          onClick={() => signOut()}
          className="text-xs text-neutral-500 transition-colors hover:text-neutral-300"
        >
          Sign out
        </button>
      </header>

      <nav role="tablist" className="flex gap-1 border-b border-line px-4">
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id ? 'border-accent text-white' : 'border-transparent text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-4">
        {tab === 'watch' ? (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-neutral-500">
              {active ? `Casting to ${active.name}` : 'No device selected — add one in the Remote tab'}
            </p>
            <WatchTracker />
          </div>
        ) : (
          <RemoteTab />
        )}
      </main>
    </div>
  );
};
