import { useDeviceStore } from '@/stores/deviceStore';
import { NowPlaying } from '@/components/NowPlaying';
import { PinnedShortcuts } from '@/components/PinnedShortcuts';
import { Remote } from '@/components/Remote';
import { TextEntry } from '@/components/TextEntry';

export const RemoteTab = () => {
  const devices = useDeviceStore(s => s.devices);
  const activeId = useDeviceStore(s => s.activeId);
  const active = devices.find(d => d.id === activeId);

  return (
    <div className="flex flex-col gap-3">
      {active ? (
        <>
          <NowPlaying ip={active.ip} />
          <Remote ip={active.ip} />
          <TextEntry ip={active.ip} />
          <PinnedShortcuts ip={active.ip} pinnedIds={active.pinnedShortcuts ?? []} />
        </>
      ) : (
        <p className="text-center text-sm text-neutral-500">
          No device selected. Add or pick a Roku in Settings&nbsp;⚙.
        </p>
      )}
    </div>
  );
};
