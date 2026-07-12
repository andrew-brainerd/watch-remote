import type { ReactElement, SVGProps } from 'react';

// Custom brand glyphs for specific TV inputs/apps, used in place of the Roku-provided artwork on pinned
// shortcuts. Monochrome (inherit `currentColor`) so they match the remote's styling.

type IconProps = SVGProps<SVGSVGElement>;
type IconComponent = (props: IconProps) => ReactElement;

export const SteamIcon: IconComponent = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658a3.4 3.4 0 0 1 1.912-.59c.063 0 .125.004.188.006l2.861-4.142V8.91a4.524 4.524 0 0 1 4.524-4.524 4.524 4.524 0 0 1 4.524 4.527 4.524 4.524 0 0 1-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159a3.394 3.394 0 0 1-3.39 3.396 3.4 3.4 0 0 1-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375a2.55 2.55 0 0 0 .005-1.949 2.55 2.55 0 0 0-1.377-1.383 2.54 2.54 0 0 0-1.878-.03l1.523.63a1.878 1.878 0 0 1 1.009 2.455 1.878 1.878 0 0 1-2.454 1.012zm11.415-9.303a3.015 3.015 0 0 0-3.015-3.015 3.016 3.016 0 0 0-3.015 3.015 3.016 3.016 0 0 0 3.015 3.015 3.015 3.015 0 0 0 3.015-3.015zm-5.273-.005a2.266 2.266 0 0 1 2.265-2.266 2.265 2.265 0 0 1 2.266 2.266 2.265 2.265 0 0 1-2.266 2.265 2.266 2.266 0 0 1-2.265-2.265z" />
  </svg>
);

export const AppleIcon: IconComponent = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
  </svg>
);

// A pair of detached Joy-Cons (stands in for the Nintendo Switch input).
export const JoyConIcon: IconComponent = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} {...p}>
    <rect x="3" y="4" width="7" height="16" rx="3.4" />
    <rect x="14" y="4" width="7" height="16" rx="3.4" />
    <circle cx="6.5" cy="8.5" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="17.5" cy="15.5" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="17.5" cy="7.6" r="0.7" fill="currentColor" stroke="none" />
    <circle cx="6.5" cy="16.4" r="0.7" fill="currentColor" stroke="none" />
  </svg>
);

// Map a Roku input/app name to a custom brand icon, overriding the TV-provided artwork. Returns null to
// fall back to the default (TV icon / name).
export const customShortcutIcon = (name: string): IconComponent | null => {
  const n = name.toLowerCase();
  if (n.includes('steam')) return SteamIcon;
  if (n.includes('apple')) return AppleIcon; // "Apple TV"
  if (n.includes('switch') || n.includes('nintendo') || n.includes('joy')) return JoyConIcon;
  return null;
};
