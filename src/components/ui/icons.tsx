import type { SVGProps } from "react";

export type IconProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
  /** Accessible name. Without it the icon is decorative (`aria-hidden`). */
  title?: string;
  /** Square size in px (default 20). */
  size?: number;
};

function Icon({ title, size = 20, children, ...rest }: IconProps & { children: React.ReactNode }) {
  const a11y = title
    ? ({ role: "img", "aria-label": title } as const)
    : ({ "aria-hidden": true } as const);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      {...a11y}
      {...rest}
    >
      {children}
    </svg>
  );
}

/** Check mark: correct answers, selected options, matched pairs, completed lessons. */
export function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </Icon>
  );
}

/** Cross: incorrect answers and mismatches. */
export function CrossIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Icon>
  );
}

/** Close (same glyph as CrossIcon, thinner): dialogs, toasts, quit lesson. */
export function CloseIcon(props: IconProps) {
  return (
    <Icon strokeWidth={2} {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Icon>
  );
}

/** Lightning bolt used by the XP badge. */
export function BoltIcon(props: IconProps) {
  return (
    <Icon fill="currentColor" stroke="none" {...props}>
      <path d="M13.5 2L4.5 13.5h6L9.5 22l9-11.5h-6L13.5 2z" />
    </Icon>
  );
}

/* Design system v2 (CTO-016): icons shared by the restyled screens. 24 px grid, `currentColor`. */

/** Streak flame (filled). */
export function FlameIcon(props: IconProps) {
  return (
    <Icon fill="currentColor" stroke="none" {...props}>
      <path d="M12 2.5c.6 3.2-1.2 4.9-2.9 6.6C7.5 10.7 6 12.3 6 15a6 6 0 0012 0c0-2.4-1.1-4.2-2.3-5.6-.3 1.4-1 2.4-2.1 2.9.6-3.6-.3-7-1.6-9.8z" />
    </Icon>
  );
}

/** Five-point star (filled): the current path node. */
export function StarIcon(props: IconProps) {
  return (
    <Icon fill="currentColor" stroke="none" {...props}>
      <path d="M12 2.8l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.4l6.2-.9L12 2.8z" />
    </Icon>
  );
}

/** Padlock: locked path nodes. */
export function LockIcon(props: IconProps) {
  return (
    <Icon strokeWidth={2.25} {...props}>
      <rect x={5} y={10.5} width={14} height={10} rx={2.5} />
      <path d="M8.5 10.5V8a3.5 3.5 0 017 0v2.5" />
    </Icon>
  );
}

/** Speaker: play audio. */
export function SpeakerIcon(props: IconProps) {
  return (
    <Icon strokeWidth={2.25} {...props}>
      <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4z" />
      <path d="M15.5 9a4 4 0 010 6M18 6.5a7.5 7.5 0 010 11" />
    </Icon>
  );
}

/** Bottom nav: Learn. */
export function HomeIcon(props: IconProps) {
  return (
    <Icon strokeWidth={2.25} {...props}>
      <path d="M4 10.5L12 4l8 6.5V20h-5v-5.5h-6V20H4v-9.5z" />
    </Icon>
  );
}

/** Bottom nav: Practice (target). */
export function TargetIcon(props: IconProps) {
  return (
    <Icon strokeWidth={2.25} {...props}>
      <circle cx={12} cy={12} r={8.5} />
      <circle cx={12} cy={12} r={4.5} />
      <circle cx={12} cy={12} r={1} fill="currentColor" />
    </Icon>
  );
}

/** Bottom nav: Leagues; lesson complete. */
export function TrophyIcon(props: IconProps) {
  return (
    <Icon strokeWidth={2.25} {...props}>
      <path d="M7.5 4h9v5a4.5 4.5 0 01-9 0V4z" />
      <path d="M7.5 6H4.5v1.5a3 3 0 003 3M16.5 6h3v1.5a3 3 0 01-3 3M12 13.5V17M8.5 20h7M10 17h4" />
    </Icon>
  );
}

/** Bottom nav: Profile. */
export function UserIcon(props: IconProps) {
  return (
    <Icon strokeWidth={2.25} {...props}>
      <circle cx={12} cy={8} r={4} />
      <path d="M4.5 20.5a7.5 7.5 0 0115 0" />
    </Icon>
  );
}

/** Settings gear. */
export function GearIcon(props: IconProps) {
  return (
    <Icon strokeWidth={2} {...props}>
      <circle cx={12} cy={12} r={3} />
      <path d="M12 2.8l1.6 2.3 2.7-.7.7 2.7 2.6 1-.9 2.6 1.7 2.2-2.2 1.7.3 2.8-2.8.2-1.3 2.5-2.4-1.3-2.4 1.3-1.3-2.5-2.8-.2.3-2.8-2.2-1.7 1.7-2.2-.9-2.6 2.6-1 .7-2.7 2.7.7L12 2.8z" />
    </Icon>
  );
}
