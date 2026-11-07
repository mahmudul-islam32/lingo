/**
 * Lumi's four static poses (GAM-001, PD-001) as small inner SVG fragments drawn on a
 * 100 x 100 viewBox. Lumi is an original, round paper lantern: a hanging loop and top cap,
 * a ribbed paper body that holds the light, a bottom cap and a tassel, stubby paper-fold
 * arms and a simple face. No animal or bird features.
 *
 * Colours are design tokens only (Tailwind `fill-*` / `stroke-*` utilities generated from
 * `tokens.css`), never literals:
 * - Outline: `stroke-fg`, the semantic ink. It is light on the dark canvas and indigo
 *   (`night-900`) on the light canvas, so it keeps >= 3:1 against both canvases.
 * - Face and seams on the lit paper: `night-900` (dark ink on amber, >= 9:1). On the dim
 *   ember body (`glow-800`) the face flips to light `glow-100` ink (6.2:1).
 * - Glow: `glow-300` / `glow-400` body, `glow-100` highlights; ember uses `glow-700/800`.
 */
import type { ReactNode } from "react";

export const LUMI_POSES = ["idle", "happy", "ember", "celebrating"] as const;
export type LumiPose = (typeof LUMI_POSES)[number];

interface PoseStyle {
  /** Opacity of the outer and inner halo rings (0 = no halo). */
  halo: readonly [outer: number, inner: number];
  /** Body (lit paper) fill class. */
  body: string;
  /** Inner light / highlight fill class. */
  light: string;
  /** Face ink as full Tailwind classes (literal so the Tailwind scanner sees them). */
  ink: { line: string; solid: string };
  /** Arms raised (celebrating) or resting at the sides. */
  armsUp: boolean;
}

const STYLES: Record<LumiPose, PoseStyle> = {
  idle: {
    halo: [0.18, 0.3],
    body: "fill-glow-400",
    light: "fill-glow-200",
    ink: { line: "fill-none stroke-night-900", solid: "fill-night-900" },
    armsUp: false,
  },
  happy: {
    halo: [0.3, 0.45],
    body: "fill-glow-300",
    light: "fill-glow-100",
    ink: { line: "fill-none stroke-night-900", solid: "fill-night-900" },
    armsUp: false,
  },
  ember: {
    halo: [0, 0.12],
    body: "fill-glow-800",
    light: "fill-glow-700",
    ink: { line: "fill-none stroke-glow-100", solid: "fill-glow-100" },
    armsUp: false,
  },
  celebrating: {
    halo: [0.42, 0.6],
    body: "fill-glow-300",
    light: "fill-glow-50",
    ink: { line: "fill-none stroke-night-900", solid: "fill-night-900" },
    armsUp: true,
  },
};

/** Face features per pose, drawn in the pose's ink colour. */
function Face({ pose, ink }: { pose: LumiPose; ink: PoseStyle["ink"] }): ReactNode {
  const { line, solid } = ink;
  switch (pose) {
    case "idle":
      return (
        <g strokeWidth={2.5} strokeLinecap="round">
          <circle cx={41} cy={53} r={3} className={solid} />
          <circle cx={59} cy={53} r={3} className={solid} />
          <path d="M45 63q5 3.5 10 0" className={line} />
        </g>
      );
    case "happy":
      return (
        <g strokeWidth={2.5} strokeLinecap="round">
          <path d="M37 54q4-5 8 0M55 54q4-5 8 0" className={line} />
          <path d="M42 61q8 7 16 0" className={line} />
          <circle cx={33} cy={61} r={3.5} className="fill-glow-500" opacity={0.6} />
          <circle cx={67} cy={61} r={3.5} className="fill-glow-500" opacity={0.6} />
        </g>
      );
    case "ember":
      return (
        <g strokeWidth={2.5} strokeLinecap="round">
          <path d="M37 53q4 3 8 0M55 53q4 3 8 0" className={line} />
          <path d="M46 64h8" className={line} />
        </g>
      );
    case "celebrating":
      return (
        <g strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M37 52q4-5 8 0M55 52q4-5 8 0" className={line} />
          <path d="M40 59h20q-2 10-10 10t-10-10z" className={solid} />
          <circle cx={32} cy={60} r={3.5} className="fill-glow-500" opacity={0.6} />
          <circle cx={68} cy={60} r={3.5} className="fill-glow-500" opacity={0.6} />
        </g>
      );
  }
}

/** Four-point sparkle centred on (x, y) with radius r. */
function Sparkle({ x, y, r }: { x: number; y: number; r: number }) {
  const q = r * 0.25;
  return (
    <path
      data-part="sparkle"
      d={`M${x} ${y - r}Q${x + q} ${y - q} ${x + r} ${y}Q${x + q} ${y + q} ${x} ${y + r}Q${x - q} ${y + q} ${x - r} ${y}Q${x - q} ${y - q} ${x} ${y - r}z`}
      className="fill-glow-100 stroke-fg"
      strokeWidth={1}
    />
  );
}

/** Inner SVG content for a pose (everything inside the root `<svg>`). */
export function LumiArtwork({ pose }: { pose: LumiPose }) {
  const s = STYLES[pose];
  const outline = "stroke-fg";
  const arms = s.armsUp ? "M20 50q-8-6-7-16M80 50q8-6 7-16" : "M19 58q-7 4-6 12M81 58q7 4 6 12";
  return (
    <>
      {s.halo[0] > 0 && (
        <circle cx={50} cy={52} r={46} className="fill-glow-300" opacity={s.halo[0]} />
      )}
      <circle cx={50} cy={54} r={40} className="fill-glow-400" opacity={s.halo[1]} />
      <g strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        <path d="M44 16q6-11 12 0" className={`fill-none ${outline}`} />
        <path d={arms} className={`fill-none ${outline}`} />
        <path d="M50 88v6" className={outline} />
        <path d="M46 94h8l-1 4h-6z" className={`${s.light} ${outline}`} strokeWidth={2} />
        <ellipse cx={50} cy={54} rx={31} ry={30} className={`${s.body} ${outline}`} />
        <ellipse cx={50} cy={58} rx={17} ry={18} className={s.light} opacity={0.55} stroke="none" />
        <path
          d="M50 24v60M35 27q-9 27 0 54M65 27q9 27 0 54"
          className={s.ink.line}
          strokeWidth={1.5}
          opacity={0.25}
        />
        <rect
          x={38}
          y={16}
          width={24}
          height={9}
          rx={2.5}
          className={`fill-night-700 ${outline}`}
        />
        <rect
          x={40}
          y={82}
          width={20}
          height={7}
          rx={2.5}
          className={`fill-night-700 ${outline}`}
        />
      </g>
      <Face pose={pose} ink={s.ink} />
      {pose === "celebrating" && (
        <>
          <Sparkle x={12} y={20} r={6} />
          <Sparkle x={88} y={18} r={7} />
          <Sparkle x={90} y={84} r={4.5} />
          <Sparkle x={10} y={86} r={4} />
        </>
      )}
    </>
  );
}
