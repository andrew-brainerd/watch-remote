import { useDeviceStore } from '@/stores/deviceStore';

interface DeviceSwitcherProps {
  // Opens Settings — used for the empty state (add/remove devices lives there).
  onManage: () => void;
}

// Header pill: shows the active Roku's name and switches between saved devices on tap.
// Adding/removing devices stays in Settings.
export const DeviceSwitcher = ({ onManage }: DeviceSwitcherProps) => {
  const devices = useDeviceStore(s => s.devices);
  const activeId = useDeviceStore(s => s.activeId);
  const setActive = useDeviceStore(s => s.setActive);

  if (devices.length === 0) {
    return (
      <button
        type="button"
        onClick={onManage}
        className="rounded-full border border-line bg-panel-2 px-3 py-1 text-sm text-neutral-400 transition-colors hover:text-neutral-200"
      >
        Add a Roku
      </button>
    );
  }

  return (
    <div className="relative inline-flex items-center">
      <select
        value={activeId ?? ''}
        onChange={e => setActive(e.target.value)}
        aria-label="Active device"
        className="max-w-[60vw] appearance-none truncate rounded-full border border-line bg-panel-2 py-1 pl-3.5 pr-8 text-sm font-semibold text-neutral-100 focus:outline-none focus-visible:outline-none"
      >
        {!activeId && (
          <option value="" disabled>
            Select device
          </option>
        )}
        {devices.map(d => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-neutral-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
};
