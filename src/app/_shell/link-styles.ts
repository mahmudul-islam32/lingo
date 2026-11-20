/**
 * A `next/link` styled like the primary `lg` Button (design v2, ADR-014): indigo with the
 * solid 3D edge, pressed = 2 px down. `Button` renders a native `<button>`, and
 * navigation must be a real link, so the look is mirrored here.
 */
export const buttonClassNames =
  "inline-flex min-h-14 items-center justify-center gap-2 rounded-control bg-primary px-6 " +
  "text-[1.0625rem] font-bold text-on-primary shadow-3d-primary select-none hover:bg-primary-hover " +
  "active:translate-y-0.5 active:shadow-3d-primary-pressed focus-visible:focus-ring " +
  "motion-safe:transition-[color,background-color,box-shadow,transform] motion-safe:duration-100";
