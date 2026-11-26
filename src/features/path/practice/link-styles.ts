/** Links styled as the v2 primary / soft Button (Button itself renders a `<button>`). */
import { cn } from "@/components/ui";

const LINK_BASE =
  "inline-flex shrink-0 items-center justify-center rounded-control font-bold select-none " +
  "focus-visible:focus-ring motion-safe:transition-[background-color,box-shadow,transform] " +
  "motion-safe:duration-100 active:translate-y-0.5";

/** 56 px tall primary link. */
export const PRIMARY_LINK = cn(
  LINK_BASE,
  "min-h-14 px-6 bg-primary text-on-primary shadow-3d-primary hover:bg-primary-hover active:shadow-3d-primary-pressed",
);

/** 48 px tall soft link. */
export const SOFT_LINK = cn(
  LINK_BASE,
  "min-h-12 px-4 text-sm bg-primary-soft text-primary-fg shadow-3d-soft hover:bg-primary-ring active:shadow-3d-soft-pressed",
);
