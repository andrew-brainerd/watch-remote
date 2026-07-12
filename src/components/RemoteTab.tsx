import { useDeviceStore } from '@/stores/deviceStore';
import { NowPlaying } from '@/components/NowPlaying';
import { Remote } from '@/components/Remote';

export const RemoteTab = () => {
  const devices = useDeviceStore(s => s.devices);
  const activeId = useDeviceStore(s => s.activeId);
  const active = devices.find(d => d.id === activeId);

  return (
    <div className="flex flex-col gap-4">
      {active ? (
        <>
          <NowPlaying ip={active.ip} />
          <Remote ip={active.ip} />
        </>
      ) : (
        <p className="text-center text-sm text-neutral-500">
          No device selected. Add or pick a Roku in Settings&nbsp;⚙.
        </p>
      )}
    </div>
  );
};
