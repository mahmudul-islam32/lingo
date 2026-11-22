"use client";

import { useCallback, useMemo } from "react";
import type { DailyGoalXp } from "@/contracts";
import { useToast } from "@/components/ui";
import { useUpdateSettings } from "@/features/profile";

export const dailyGoalSetToast = (xp: number) => `Daily goal set to ${xp} XP.`;
export const DAILY_GOAL_CHANGE_ERROR = "We couldn't change your daily goal. Try again.";

export interface GoalPlanActions {
  /** "Use <n> XP a day" (PLT-027 AC 11): saves `dailyGoalXp`, toasts the result. */
  onUseSuggestedGoal: (xp: DailyGoalXp) => Promise<void>;
}

/**
 * Callback for GAM-013's `GoalPlanCard` on Learn (PLT-027 AC 11). Its edit links already
 * go to `/profile?edit=goal-date` (AC 10), so no navigation callback is needed. The daily goal is
 * saved through the same `useUpdateSettings` as Profile's "Daily goal" row (PD-069), which
 * writes `["settings"]`, so the ring, the weekly chart line and the card update without a
 * reload. On failure nothing is stored and an error toast is shown.
 */
export function useGoalPlanActions(): GoalPlanActions {
  const update = useUpdateSettings();
  const toast = useToast();
  const { mutateAsync } = update;

  const onUseSuggestedGoal = useCallback(
    async (xp: DailyGoalXp) => {
      try {
        await mutateAsync({ dailyGoalXp: xp });
      } catch {
        toast.show({ title: DAILY_GOAL_CHANGE_ERROR, tone: "error" });
        return;
      }
      toast.show({ title: dailyGoalSetToast(xp), tone: "success" });
    },
    [mutateAsync, toast],
  );
  return useMemo(() => ({ onUseSuggestedGoal }), [onUseSuggestedGoal]);
}
