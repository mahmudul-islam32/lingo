import { VisuallyHidden } from "@/components/ui";

/** Accessible text of the badge (LES-020 AC 12). */
export const PRACTICE_BADGE_LABEL = "Practice: wrong answers cost no hearts";

/** Small indigo-tint "Practice" chip left of the lesson hearts meter (LES-020 AC 12, v2). */
export function PracticeBadge() {
  return (
    <span
      data-testid="practice-badge"
      className="inline-flex h-7 shrink-0 items-center rounded-lg bg-primary-soft px-2 text-xs font-extrabold tracking-wide whitespace-nowrap text-primary-fg uppercase"
    >
      <span aria-hidden="true">Practice</span>
      <VisuallyHidden>{PRACTICE_BADGE_LABEL}</VisuallyHidden>
    </span>
  );
}
