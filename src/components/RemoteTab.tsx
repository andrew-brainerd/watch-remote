import { useState } from 'react';
import { useDeviceStore } from '@/stores/deviceStore';
import { useConfigStore } from '@/stores/configStore';
import { DeviceBar } from '@/components/DeviceBar';
import { Remote } from '@/components/Remote';

export const RemoteTab = () => {
  const { devices, activeId } = useDeviceStore();
  const active = devices.find(d => d.id === activeId);

  const { apiBase, setApiBase } = useConfigStore();
  const [serverDraft, setServerDraft] = useState(apiBase);

  return (
    <div className="flex flex-col gap-4">
      <DeviceBar />
      {active ? (
        <Remote ip={active.ip} />
      ) : (
        <p className="text-center text-sm text-neutral-500">Add and select a Roku above to show the remote.</p>
      )}

      <div className="mt-2 border-t border-line pt-3">
        <label className="text-[11px] uppercase tracking-wide text-neutral-600">Watch server</label>
        <div className="mt-1 flex gap-2">
          <input
            value={serverDraft}
            onChange={e => setServerDraft(e.target.value)}
            spellCheck={false}
            autoCapitalize="off"
            className="min-w-0 flex-1 rounded border border-line bg-panel-2 px-2 py-1 text-xs text-neutral-300"
          />
          <button
            type="button"
            onClick={() => setApiBase(serverDraft)}
            disabled={serverDraft.trim() === apiBase}
            className="rounded border border-line bg-panel-2 px-2 py-1 text-xs text-neutral-300 disabled:opacity-40"
          >
            Save
          </button>
        </div>
        <p className="mt-1 text-[10px] text-neutral-600">On a phone, set this to your Mac&apos;s LAN IP or the production API.</p>
      </div>
    </div>
  );
};
