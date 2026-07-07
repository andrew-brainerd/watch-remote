import { useDeviceStore } from '@/stores/deviceStore';
import { DeviceBar } from '@/components/DeviceBar';
import { Remote } from '@/components/Remote';

export const RemoteTab = () => {
  const { devices, activeId } = useDeviceStore();
  const active = devices.find(d => d.id === activeId);

  return (
    <div className="flex flex-col gap-4">
      <DeviceBar />
      {active ? (
        <Remote ip={active.ip} />
      ) : (
        <p className="text-center text-sm text-neutral-500">Add and select a Roku above to show the remote.</p>
      )}
    </div>
  );
};
