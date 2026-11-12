"use client";

import { useId, type ReactNode } from "react";
import { Card, CheckIcon, ProgressBar, VisuallyHidden, cn } from "@/components/ui";
import type { GoalRowView, LessonImpact, StreakRowView } from "./lesson-impact";

function Row({ children, celebrate }: { children: ReactNode; celebrate: boolean }) {
  return (
    <Card
      as="li"
      padding="sm"
      tone="raised"
      data-celebrate={celebrate ? "true" : "false"}
      className="col-span-full flex min-w-0 flex-col gap-1 py-2 text-left"
    >
      {children}
    </Card>
  );
}

function StreakRow({ row }: { row: StreakRowView }) {
  const celebrate = row.event !== null;
  return (
    <Row celebrate={celebrate}>
      <div className="flex items-center justify-between gap-2">
        <span className={cn("text-sm font-semibold", celebrate ? "text-fg" : "text-fg-muted")}>
          {row.label}
        </span>
        <span className="text-lg font-bold tabular-nums">
          <span aria-hidden="true">{row.value}</span>
          <VisuallyHidden>{row.srValue}</VisuallyHidden>
        </span>
      </div>
    </Row>
  );
}

function GoalRow({ row }: { row: GoalRowView }) {
  const labelId = useId();
  const showCheck = row.reached && !row.newlyReached;
  return (
    <Row celebrate={row.newlyReached}>
      <div className="flex items-center justify-between gap-2">
        <span
          id={labelId}
          className={cn("text-sm font-semibold", row.newlyReached ? "text-fg" : "text-fg-muted")}
        >
          {row.label}
        </span>
        <span className="inline-flex items-center gap-1 text-lg font-bold tabular-nums">
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
        size="sm"
        tone="xp"
      />
    </Row>
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
