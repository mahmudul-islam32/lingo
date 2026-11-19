import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/** Custom theme values from tokens.css, so `cn()` resolves conflicts between them (v2). */
const SHADOWS = [
  "3d-card",
  "3d-card-pressed",
  "3d-neutral",
  "3d-neutral-pressed",
  "3d-primary",
  "3d-primary-pressed",
  "3d-soft",
  "3d-soft-pressed",
  "3d-success",
  "3d-success-pressed",
  "3d-danger",
  "3d-danger-pressed",
  "3d-node",
  "3d-node-locked",
  "3d-node-current",
  "ring-selected",
];
const RADII = ["card", "control", "chip", "tile", "banner"];

const twMerge = extendTailwindMerge<"focus-ring" | "eyebrow">({
  extend: {
    classGroups: {
      "focus-ring": ["focus-ring"],
      eyebrow: ["eyebrow"],
    },
    theme: {
      shadow: SHADOWS,
      radius: RADII,
      font: ["display", "body"],
    },
  },
});

/**
 * Joins class names (clsx syntax: strings, arrays, `{ cls: condition }`) and resolves
 * Tailwind conflicts so the last class wins: `cn("px-2", isWide && "px-6")`.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
