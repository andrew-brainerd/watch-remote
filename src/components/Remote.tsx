import type { ReactNode } from 'react';

import { rokuKeypress } from '@/api/ipc';
import {
  BackIcon,
  DownIcon,
  ForwardIcon,
  HomeIcon,
  InfoIcon,
  LeftIcon,
  PlayPauseIcon,
  PowerIcon,
  ReplayIcon,
  RightIcon,
  RewindIcon,
  SearchIcon,
  SelectIcon,
  UpIcon,
  VolumeDownIcon,
  VolumeMuteIcon,
  VolumeUpIcon
} from '@/components/RemoteIcons';

interface RemoteProps {
  ip: string;
}

interface RemoteButtonProps {
  label: string;
  icon: ReactNode;
  onClick: () => void;
}

// Shared by the remote keys and the pinned-shortcut launchers so they're the same size/shape.
export const remoteButtonClass =
  'flex items-center justify-center rounded-lg border border-line py-2.5 text-neutral-200 transition-colors hover:border-neutral-500 active:bg-accent active:text-white';

export const remoteIconClass = 'h-6 w-6';

const RemoteButton = ({ label, icon, onClick }: RemoteButtonProps) => (
  <button type="button" onClick={onClick} aria-label={label} title={label} className={remoteButtonClass}>
    {icon}
  </button>
);

const iconClass = remoteIconClass;

export const Remote = ({ ip }: RemoteProps) => {
  const key = (k: string) => () => {
    rokuKeypress(ip, k).catch(() => {});
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-2">
        <RemoteButton label="Power" icon={<PowerIcon className={iconClass} />} onClick={key('PowerOff')} />
        <RemoteButton label="Home" icon={<HomeIcon className={iconClass} />} onClick={key('Home')} />
        <RemoteButton label="Back" icon={<BackIcon className={iconClass} />} onClick={key('Back')} />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <span />
        <RemoteButton label="Up" icon={<UpIcon className={iconClass} />} onClick={key('Up')} />
        <span />
        <RemoteButton label="Left" icon={<LeftIcon className={iconClass} />} onClick={key('Left')} />
        <RemoteButton label="OK" icon={<SelectIcon className={iconClass} />} onClick={key('Select')} />
        <RemoteButton label="Right" icon={<RightIcon className={iconClass} />} onClick={key('Right')} />
        <span />
        <RemoteButton label="Down" icon={<DownIcon className={iconClass} />} onClick={key('Down')} />
        <span />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <RemoteButton label="Rewind" icon={<RewindIcon className={iconClass} />} onClick={key('Rev')} />
        <RemoteButton label="Play / pause" icon={<PlayPauseIcon className={iconClass} />} onClick={key('Play')} />
        <RemoteButton label="Fast forward" icon={<ForwardIcon className={iconClass} />} onClick={key('Fwd')} />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <RemoteButton label="Instant replay" icon={<ReplayIcon className={iconClass} />} onClick={key('InstantReplay')} />
        <RemoteButton label="Info" icon={<InfoIcon className={iconClass} />} onClick={key('Info')} />
        <RemoteButton label="Search" icon={<SearchIcon className={iconClass} />} onClick={key('Search')} />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <RemoteButton label="Volume down" icon={<VolumeDownIcon className={iconClass} />} onClick={key('VolumeDown')} />
        <RemoteButton label="Mute" icon={<VolumeMuteIcon className={iconClass} />} onClick={key('VolumeMute')} />
        <RemoteButton label="Volume up" icon={<VolumeUpIcon className={iconClass} />} onClick={key('VolumeUp')} />
      </div>
    </div>
  );
};
