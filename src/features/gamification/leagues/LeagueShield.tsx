import { StarIcon, cn } from "@/components/ui";

/**
 * Polyglow's league shields (GAM-012, screen 7 style): three plain shields, the middle one
 * raised with a star. Decorative only: no tier names or colours that suggest a rank the
 * learner doesn't have (PD-066 §6).
 */
export function LeagueShield({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      data-testid="league-shield"
      className={cn("flex items-end gap-2.5", className)}
    >
      <span className="h-11.5 w-10 rounded-t-chip rounded-b-[1.25rem] bg-primary-soft" />
      <span className="flex h-17 w-15 items-center justify-center rounded-t-card rounded-b-[1.875rem] bg-primary text-on-primary shadow-[0_0_0_4px_var(--color-surface),0_0_0_6px_var(--color-primary-ring)]">
        <StarIcon size={28} />
      </span>
      <span className="h-11.5 w-10 rounded-t-chip rounded-b-[1.25rem] bg-disabled" />
    </div>
  );
}
