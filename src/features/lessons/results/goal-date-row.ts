/**
 * LES-022 results-screen goal-date row copy (PD-071 §1, PD-035). Pure, so the wording is
 * unit-testable. The rule (lessons left, statuses) is GAM-013's `computeGoalPlan`; the
 * date format is GAM-013's `formatGoalDate` ("12 Mar 2027"). Only the short row wording
 * the ticket asks for lives here.
 */
import type { GoalPlanStatus } from "@/contracts";
import { formatGoalDate } from "@/features/gamification";

export type GoalDateRowView =
  { kind: "progress"; label: string; value: string } | { kind: "reached"; text: string };

/** "1 lesson left" / "130 lessons left" (criterion 2). */
export function lessonsLeftText(lessonsLeft: number): string {
  return `${lessonsLeft} ${lessonsLeft === 1 ? "lesson" : "lessons"} left`;
}

/**
 * Row view for a goal-plan status, or `null` for no row: no plan (`null` / `undefined`)
 * and `date-passed` (the Learn card handles that, GAM-013).
 */
export function goalDateRowView(status: GoalPlanStatus | null | undefined): GoalDateRowView | null {
  if (!status) return null;
  switch (status.status) {
    case "reached":
      return { kind: "reached", text: `Goal reached: you've finished ${status.targetLevel}!` };
    case "date-passed":
      return null;
    case "on-track":
    case "raise-goal":
    case "tight":
      return {
        kind: "progress",
        label: `Goal: ${status.targetLevel} by ${formatGoalDate(status.targetDate)}`,
        value: lessonsLeftText(status.lessonsLeft),
      };
  }
}
