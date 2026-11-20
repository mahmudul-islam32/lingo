"use client";

import { useId } from "react";
import { CheckIcon, FlameIcon, ProgressBar, VisuallyHidden, cn } from "@/components/ui";
import type { GoalRowView, LessonImpact, StreakRowView } from "./lesson-impact";

/** Visible banner title, "4-day streak!" (design v2 screen 6). Screen readers get the row text. */
export function streakTitle(days: number): string {
  return `${days}-day streak!`;
}

/**
 * Coral-tint streak banner (design v2): flame, "<n>-day streak!" and the existing row
 * line ("Streak extended!" / "Streak started!"). Screen readers read the same text as
 * before ("Streak extended! 2 days"): the big title is a visual restatement.
 */
function StreakRow({ row }: { row: StreakRowView }) {
  const celebrate = row.event !== null;
  const unavailable = row.days === null;
  return (
    <li
      data-celebrate={celebrate ? "true" : "false"}
      data-testid="streak-row"
      className="col-span-full flex min-w-0 items-center gap-3.5 rounded-tile bg-accent-tint px-4 py-2.5 text-left"
    >
      <FlameIcon
        size={32}
        className={cn("shrink-0", unavailable ? "text-fg-subtle" : "text-accent")}
      />
      <div className="flex min-w-0 flex-col gap-0.5">
        {row.days !== null && (
          <span aria-hidden="true" className="text-[1.0625rem] font-extrabold text-accent-fg">
            {streakTitle(row.days)}
          </span>
        )}
        <span
          className={cn(
            "text-sm",
            unavailable ? "font-bold text-accent-fg" : "text-accent-fg",
            // "Streak" alone repeats the title, so it is only read, not shown.
            !celebrate && !unavailable && "sr-only",
          )}
        >
          {row.label}
        </span>
        {unavailable && (
          <span aria-hidden="true" className="text-sm font-bold text-accent-fg">
            {row.value}
          </span>
        )}
        <VisuallyHidden>{row.srValue}</VisuallyHidden>
      </div>
    </li>
  );
}

/**
 * Daily-goal bar look (FIX-010, design v2): the XP gold fill (`xp-gold`, #F5B400) instead
 * of the shared `xp` tone (dark gold). Gold on the `track` is only ~1.5:1 and the darker
 * `xp-edge` ~1.9:1, both under the 3:1 non-text minimum, so the fill gets a 2px inset
 * edge in `xp` (#8A6200, ~4.4:1 on the track and ~5.6:1 on the white card); see
 * `goal-bar.test.ts`. Styled from here through child selectors so the shared
 * `ProgressBar` stays unchanged.
 */
export const GOAL_BAR_FILL_CLASS =
  "[&>div]:bg-xp-gold [&>div]:shadow-[inset_0_0_0_2px_var(--color-xp)]";

function GoalRow({ row }: { row: GoalRowView }) {
  const labelId = useId();
  const showCheck = row.reached && !row.newlyReached;
  return (
    <li
      data-celebrate={row.newlyReached ? "true" : "false"}
      className="col-span-full flex min-w-0 flex-col gap-2 rounded-tile border-2 border-border bg-surface px-4 py-2 text-left shadow-3d-card"
    >
      <div className="flex items-center justify-between gap-2">
        <span
          id={labelId}
          className={cn("text-sm font-bold", row.newlyReached ? "text-fg" : "text-fg-muted")}
        >
          {row.label}
        </span>
        <span className="inline-flex items-center gap-1 font-display text-lg font-bold text-xp tabular-nums">
          {showCheck && (
            <span className="text-success" data-testid="goal-check">
              <CheckIcon size={18} />
            </span>
          )}
          <span aria-hidden="true">{row.value}</span>
          <VisuallyHidden>
            {row.srValue}
            {showCheck ? ", reached" : ""}
          </VisuallyHidden>
        </span>
      </div>
      <ProgressBar
        value={row.goal.earnedXp}
        max={row.goal.goalXp}
        labelledBy={labelId}
        valueText={row.srValue}
        size="md"
        tone="xp"
        className={GOAL_BAR_FILL_CLASS}
      />
    </li>
  );
}

/**
 * The Streak and Daily goal rows (LES-010). Two `<li>`s rendered inside the results
 * screen's "Lesson stats" list, so they are read with the other stats (AC 9).
 */
export function ResultsGamificationRows({ impact }: { impact: LessonImpact }) {
  return (
    <>
      <StreakRow row={impact.streak} />
      <GoalRow row={impact.goal} />
    </>
  );
}
