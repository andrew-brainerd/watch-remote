import { useEffect, useState } from 'react';
import { useDeviceStore } from '@/stores/deviceStore';
import { rokuDeviceInfo } from '@/api/ipc';

export const DeviceBar = () => {
  const { devices, activeId, addDevice, removeDevice, setActive } = useDeviceStore();
  const [name, setName] = useState('');
  const [ip, setIp] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const active = devices.find(d => d.id === activeId);
  const activeIp = active?.ip;

  useEffect(() => {
    if (!activeIp) {
      setStatus(null);
      return;
    }
    let cancelled = false;
    setStatus('checking…');
    rokuDeviceInfo(activeIp)
      .then(info => {
        if (!cancelled) setStatus(`${info.name} · ${info.model} · ${info.power_on ? 'on' : 'standby'}`);
      })
      .catch(() => {
        if (!cancelled) setStatus('unreachable');
      });
    return () => {
      cancelled = true;
    };
  }, [activeIp]);

  const onAdd = () => {
    const trimmedIp = ip.trim();
    if (!trimmedIp) return;
    addDevice(name.trim() || trimmedIp, trimmedIp);
    setName('');
    setIp('');
  };

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-line bg-panel p-3">
      <div className="flex items-center gap-2">
        <select
          value={activeId ?? ''}
          onChange={e => setActive(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-line bg-panel-2 px-2 py-2 text-sm text-neutral-200"
        >
          {devices.length === 0 && <option value="">No devices — add one below</option>}
          {devices.map(d => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.ip})
            </option>
          ))}
        </select>
        {active && (
          <button
            type="button"
            onClick={() => removeDevice(active.id)}
            className="rounded-lg border border-line px-2 py-2 text-sm text-neutral-400 hover:text-red-400"
            aria-label="Remove device"
          >
            ✕
          </button>
        )}
      </div>

      {active && <p className="px-1 text-xs text-neutral-500">{status ?? 'checking…'}</p>}

      <div className="flex items-center gap-2">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Name"
          className="w-24 rounded-lg border border-line bg-panel-2 px-2 py-2 text-sm text-neutral-200 placeholder:text-neutral-600"
        />
        <input
          value={ip}
          onChange={e => setIp(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onAdd()}
          placeholder="192.168.4.61"
          inputMode="decimal"
          className="min-w-0 flex-1 rounded-lg border border-line bg-panel-2 px-2 py-2 text-sm text-neutral-200 placeholder:text-neutral-600"
        />
        <button
          type="button"
          onClick={onAdd}
          className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          Add
        </button>
      </div>
    </div>
  );
};
