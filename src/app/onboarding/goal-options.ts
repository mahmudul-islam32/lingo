import { GAME_CONFIG, type DailyGoalXp } from "@/contracts";

export interface GoalCopy {
  label: string;
  hint: string;
}

/**
 * UI copy for each daily goal option (PLT-004 criterion 4). Typed as a full
 * `Record<DailyGoalXp, …>`: adding an option in `@/contracts` fails typecheck here until
 * it has a label and a hint.
 */
export const GOAL_COPY: Record<DailyGoalXp, GoalCopy> = {
  10: { label: "Casual", hint: "About 1 lesson a day" },
  20: { label: "Regular", hint: "About 2 lessons a day" },
  30: { label: "Serious", hint: "About 3 lessons a day" },
  50: { label: "Intense", hint: "About 5 lessons a day" },
};

export interface GoalOption extends GoalCopy {
  xp: DailyGoalXp;
}

/** The goal options in contract order (`GAME_CONFIG.dailyGoalOptions`). */
export const GOAL_OPTIONS: readonly GoalOption[] = GAME_CONFIG.dailyGoalOptions.map((xp) => ({
  xp,
  ...GOAL_COPY[xp],
}));
