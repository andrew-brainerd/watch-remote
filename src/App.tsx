import { useAuthStore } from '@/stores/authStore';
import { useDeviceStore } from '@/stores/deviceStore';
import { Login } from '@/components/Login';
import { Library } from '@/components/Library';
import { DeviceBar } from '@/components/DeviceBar';
import { Remote } from '@/components/Remote';

export const App = () => {
  const { user, ready, signOut } = useAuthStore();
  const { devices, activeId } = useDeviceStore();
  const active = devices.find(d => d.id === activeId);

  if (!ready) {
    return <div className="flex min-h-full items-center justify-center text-sm text-neutral-500">Loading…</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col gap-4 p-4">
      <header className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-lg font-semibold text-neutral-100">Watch Remote</h1>
          <p className="text-xs text-neutral-500">{user.email}</p>
        </div>
        <button type="button" onClick={() => signOut()} className="text-xs text-neutral-500 hover:text-neutral-300">
          Sign out
        </button>
      </header>

      <DeviceBar />
      <Library />
      {active && <Remote ip={active.ip} />}
    </div>
  );
};
