import type { ReactNode, SVGProps } from 'react';

// Custom remote-control glyphs. All share a 24×24 viewBox and inherit `currentColor`, so a button's
// text color drives the icon. Stroked by default; filled for the "solid" glyphs (play, seek, select).

type IconProps = SVGProps<SVGSVGElement>;

const Stroke = ({ children, ...props }: IconProps & { children: ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {children}
  </svg>
);

const Fill = ({ children, ...props }: IconProps & { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    {children}
  </svg>
);

export const PowerIcon = (p: IconProps) => (
  <Stroke {...p}>
    <line x1="12" y1="3" x2="12" y2="11.5" />
    <path d="M6.8 6.8a8 8 0 1 0 10.4 0" />
  </Stroke>
);

export const HomeIcon = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V20h14V9.5" />
    <path d="M10 20v-5h4v5" />
  </Stroke>
);

export const BackIcon = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M9 14 4 9l5-5" />
    <path d="M4 9h11a5 5 0 0 1 0 10h-4" />
  </Stroke>
);

export const UpIcon = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M6 15l6-6 6 6" />
  </Stroke>
);

export const DownIcon = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M6 9l6 6 6-6" />
  </Stroke>
);

export const LeftIcon = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M15 6l-6 6 6 6" />
  </Stroke>
);

export const RightIcon = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M9 6l6 6-6 6" />
  </Stroke>
);

export const SelectIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" {...p}>
    <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="3.5" fill="currentColor" />
  </svg>
);

export const RewindIcon = (p: IconProps) => (
  <Fill {...p}>
    <path d="M11 6 5 12l6 6z" />
    <path d="M19 6l-6 6 6 6z" />
  </Fill>
);

export const ForwardIcon = (p: IconProps) => (
  <Fill {...p}>
    <path d="M13 6l6 6-6 6z" />
    <path d="M5 6l6 6-6 6z" />
  </Fill>
);

export const PlayIcon = (p: IconProps) => (
  <Fill {...p}>
    <path d="M7 5v14l11-7z" />
  </Fill>
);

export const PauseIcon = (p: IconProps) => (
  <Fill {...p}>
    <rect x="6.5" y="5" width="3.5" height="14" rx="1" />
    <rect x="14" y="5" width="3.5" height="14" rx="1" />
  </Fill>
);

export const PlayPauseIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" {...p}>
    <path d="M3 5v14l8-7z" fill="currentColor" />
    <rect x="14" y="5" width="3" height="14" rx="1" fill="currentColor" />
    <rect x="19" y="5" width="3" height="14" rx="1" fill="currentColor" />
  </svg>
);

export const ReplayIcon = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M4 12a8 8 0 1 0 2.5-5.8" />
    <path d="M3 4v4h4" />
  </Stroke>
);

export const InfoIcon = (p: IconProps) => (
  <Stroke {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5" />
    <path d="M12 7.5h.01" />
  </Stroke>
);

export const SearchIcon = (p: IconProps) => (
  <Stroke {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20.5 20.5-4-4" />
  </Stroke>
);

const SpeakerBody = (
  <path d="M4 9.5v5h3l4 3.5V6L7 9.5H4z" fill="currentColor" stroke="none" />
);

export const VolumeDownIcon = (p: IconProps) => (
  <Stroke {...p}>
    {SpeakerBody}
    <path d="M16 12h5" />
  </Stroke>
);

export const VolumeMuteIcon = (p: IconProps) => (
  <Stroke {...p}>
    {SpeakerBody}
    <path d="M16 9.5l5 5M21 9.5l-5 5" />
  </Stroke>
);

export const VolumeUpIcon = (p: IconProps) => (
  <Stroke {...p}>
    {SpeakerBody}
    <path d="M16 9a4.5 4.5 0 0 1 0 6" />
    <path d="M19 6.5a8 8 0 0 1 0 11" />
  </Stroke>
);
