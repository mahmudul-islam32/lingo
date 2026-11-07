import { cn } from "./cn";
import { LumiArtwork, type LumiPose } from "./lumi-poses";

export type LumiSize = "sm" | "md" | "lg";

/** Rendered size in px per `size` (GAM-001 AC1). */
export const LUMI_SIZE_PX: Record<LumiSize, number> = { sm: 48, md: 96, lg: 160 };

export interface LumiProps {
  pose: LumiPose;
  /** sm = 48 px (top bar, cards), md = 96 px (default), lg = 160 px (hero). */
  size?: LumiSize;
  /** Accessible name. Without it Lumi is decorative (`aria-hidden`). */
  label?: string;
  className?: string;
}

/**
 * Lumi, Polyglow's original paper-lantern mascot (PD-001), in one of four static poses.
 * Static by design in MVP: no animation, so `prefers-reduced-motion` needs no handling.
 * `width`/`height` attributes are always set so the SVG never causes layout shift.
 */
export function Lumi({ pose, size = "md", label, className }: LumiProps) {
  const px = LUMI_SIZE_PX[size];
  const a11y = label
    ? ({ role: "img", "aria-label": label } as const)
    : ({ "aria-hidden": true } as const);
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 100 100"
      focusable="false"
      data-pose={pose}
      className={cn("shrink-0", className)}
      {...a11y}
    >
      <LumiArtwork pose={pose} />
    </svg>
  );
}
