import { describe, expect, it } from "vitest";
import type { DailyGoalXp } from "@/contracts";
import {
  goalAriaValueNow,
  goalHint,
  goalValueText,
  goalValueTextForScreenReaders,
  isGoalReached,
} from "@/features/gamification";

describe("daily goal text (GAM-006)", () => {
  it.each([
    // earned, goal, value, aria-valuetext, hint, aria-valuenow, reached
    [0, 20, "0 / 20 XP", "0 of 20 XP today", "20 XP to go", 0, false],
    [15, 20, "15 / 20 XP", "15 of 20 XP today", "5 XP to go", 15, false],
    [20, 20, "20 / 20 XP", "Daily goal reached: 20 XP today", "Goal reached!", 20, true],
    [25, 20, "25 / 20 XP", "Daily goal reached: 25 XP today", "Goal reached!", 20, true],
    [10, 50, "10 / 50 XP", "10 of 50 XP today", "40 XP to go", 10, false],
  ])("%i of %i", (earnedXp, goalXp, value, valueText, hint, now, reached) => {
    const goal = { earnedXp, goalXp: goalXp as DailyGoalXp };
    expect(goalValueText(goal)).toBe(value);
    expect(goalValueTextForScreenReaders(goal)).toBe(valueText);
    expect(goalHint(goal)).toBe(hint);
    expect(goalAriaValueNow(goal)).toBe(now);
    expect(isGoalReached(goal)).toBe(reached);
  });
});
