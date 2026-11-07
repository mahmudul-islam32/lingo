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
