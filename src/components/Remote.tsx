import { rokuKeypress } from '@/api/ipc';

interface RemoteProps {
  ip: string;
}

interface RemoteButtonProps {
  label: string;
  onClick: () => void;
}

const RemoteButton = ({ label, onClick }: RemoteButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className="rounded-lg border border-line bg-panel-2 py-3 text-sm font-medium text-neutral-200 transition-colors active:bg-accent active:text-white"
  >
    {label}
  </button>
);

export const Remote = ({ ip }: RemoteProps) => {
  const key = (k: string) => () => {
    rokuKeypress(ip, k).catch(() => {});
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2">
        <RemoteButton label="⏻ Power" onClick={key('PowerOff')} />
        <RemoteButton label="⌂ Home" onClick={key('Home')} />
        <RemoteButton label="↩ Back" onClick={key('Back')} />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <span />
        <RemoteButton label="▲" onClick={key('Up')} />
        <span />
        <RemoteButton label="◀" onClick={key('Left')} />
        <RemoteButton label="OK" onClick={key('Select')} />
        <RemoteButton label="▶" onClick={key('Right')} />
        <span />
        <RemoteButton label="▼" onClick={key('Down')} />
        <span />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <RemoteButton label="⏪" onClick={key('Rev')} />
        <RemoteButton label="⏯" onClick={key('Play')} />
        <RemoteButton label="⏩" onClick={key('Fwd')} />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <RemoteButton label="↺ Replay" onClick={key('InstantReplay')} />
        <RemoteButton label="ⓘ Info" onClick={key('Info')} />
        <RemoteButton label="🔎 Search" onClick={key('Search')} />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <RemoteButton label="🔉 Vol −" onClick={key('VolumeDown')} />
        <RemoteButton label="🔇 Mute" onClick={key('VolumeMute')} />
        <RemoteButton label="🔊 Vol +" onClick={key('VolumeUp')} />
      </div>
    </div>
  );
};
