"use client";

import Link from "next/link";
import { useId, type KeyboardEvent, type MouseEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { GAME_CONFIG, type DailyGoalXp, type GoalPlanStatus } from "@/contracts";
import { Button, Card, TargetIcon, cn } from "@/components/ui";
import { settingsQuery } from "../data/queries";
import {
  GOAL_PLAN_EDIT_HREF,
  GOAL_PLAN_EMPTY_LINK,
  GOAL_PLAN_EMPTY_PROMPT,
  GOAL_PLAN_SECTION_LABEL,
  goalPlanCopy,
} from "../rules/goal-plan-copy";

export interface GoalPlanCardProps {
  /**
   * From `useGoalPlan()`. `undefined` = still loading (renders nothing), `null` = no goal
   * date (renders only the "Set a goal date" link).
   */
  status: GoalPlanStatus | null | undefined;
  /**
   * The learner's daily goal, shown in the `on-track` line. Default: `Settings.dailyGoalXp`
   * from `["settings"]` (or `GAME_CONFIG.defaultDailyGoalXp`).
   */
  dailyGoalXp?: DailyGoalXp;
  /**
   * "Use <n> XP a day" (called once per tap with `n`). The card never changes settings
   * itself; the caller saves, e.g. `updateSettings({ dailyGoalXp: n })`. Without it the
   * button is not shown.
   */
  onUseSuggestedGoal?: (xp: DailyGoalXp) => void;
  /**
   * "Set a goal date", "Change date", "Set a new goal date". When given, the link's
   * navigation is replaced by this call; without it the link goes to `editHref`.
   */
  onEditGoalDate?: () => void;
  /** Target of the edit links. Default `/profile?edit=goal-date`. */
  editHref?: string;
  className?: string;
}

/** Text link with a 48 px touch target (AC16). */
const LINK =
  "inline-flex min-h-12 items-center rounded-control font-bold text-primary underline " +
  "underline-offset-4 hover:text-primary-hover focus-visible:focus-ring";

function EditLink({
  href,
  onEdit,
  children,
}: {
  href: string;
  onEdit?: () => void;
  children: string;
}) {
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!onEdit) return;
    event.preventDefault();
    onEdit();
  };
  // Links activate on Enter natively; Space is added so they work like the buttons (AC15).
  const onKeyDown = (event: KeyboardEvent<HTMLAnchorElement>) => {
    if (event.key !== " ") return;
    event.preventDefault();
    event.currentTarget.click();
  };
  return (
    <Link href={href} className={LINK} onClick={onClick} onKeyDown={onKeyDown}>
      {children}
    </Link>
  );
}

/**
 * Learn goal-date card (GAM-013 AC9–AC17, PD-071 §1). Presentational: renders `status`
 * with the copy from `goalPlanCopy`, suggests a daily goal but never saves one.
 *
 * - A `section` named "Goal date"; the status line is a polite live region, so the change
 *   after "Use <n> XP a day" (e.g. to the `on-track` text) is announced.
 * - No plan: one quiet text link, no card chrome. Loading: nothing.
 */
export function GoalPlanCard({
  status,
  dailyGoalXp: dailyGoalXpProp,
  onUseSuggestedGoal,
  onEditGoalDate,
  editHref = GOAL_PLAN_EDIT_HREF,
  className,
}: GoalPlanCardProps) {
  const labelId = useId();
  const settings = useQuery({ ...settingsQuery(), enabled: dailyGoalXpProp === undefined });
  const dailyGoalXp =
    dailyGoalXpProp ?? settings.data?.dailyGoalXp ?? GAME_CONFIG.defaultDailyGoalXp;

  if (status === undefined) return null;

  if (status === null) {
    return (
      <p className={cn("text-base text-fg-muted", className)} data-testid="goal-plan-empty">
        {GOAL_PLAN_EMPTY_PROMPT}{" "}
        <EditLink href={editHref} onEdit={onEditGoalDate}>
          {GOAL_PLAN_EMPTY_LINK}
        </EditLink>
      </p>
    );
  }

  const copy = goalPlanCopy(status, dailyGoalXp);
  const suggestion = onUseSuggestedGoal ? copy.suggestion : null;

  return (
    <Card
      as="section"
      aria-labelledby={labelId}
      tone="default"
      className={cn("flex min-w-0 flex-col gap-2", className)}
      data-testid="goal-plan-card"
      data-status={status.status}
    >
      <p id={labelId} className="eyebrow flex items-center gap-1.5">
        <TargetIcon size={16} className="shrink-0" />
        {GOAL_PLAN_SECTION_LABEL}
      </p>
      <h2 className="font-display text-lg font-bold text-fg text-balance break-words">
        {copy.title}
      </h2>
      {copy.counts && <p className="text-sm font-medium text-fg-muted">{copy.counts}</p>}
      <div aria-live="polite" aria-atomic="true">
        <p className="text-base text-fg break-words" data-testid="goal-plan-message">
          {copy.message}
        </p>
      </div>
      {(suggestion || copy.editLink) && (
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2">
          {suggestion && (
            <Button
              variant={suggestion.variant}
              onClick={() => onUseSuggestedGoal?.(suggestion.xp)}
              className="max-w-full"
            >
              {suggestion.label}
            </Button>
          )}
          {copy.editLink && (
            <EditLink href={editHref} onEdit={onEditGoalDate}>
              {copy.editLink}
            </EditLink>
          )}
        </div>
      )}
    </Card>
  );
}
