import { VisuallyHidden } from "@/components/ui";

/** Accessible text of the badge (LES-020 AC 12). */
export const PRACTICE_BADGE_LABEL = "Practice: wrong answers cost no hearts";

/** Small outlined "Practice" badge left of the lesson hearts meter (LES-020 AC 12). */
export function PracticeBadge() {
  return (
    <span
      data-testid="practice-badge"
      className="inline-flex h-7 shrink-0 items-center rounded-full border-2 border-border-strong px-2 text-sm font-semibold whitespace-nowrap text-fg"
    >
      <span aria-hidden="true">Practice</span>
      <VisuallyHidden>{PRACTICE_BADGE_LABEL}</VisuallyHidden>
    </span>
  );
}
