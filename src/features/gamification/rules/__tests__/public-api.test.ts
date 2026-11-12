import { describe, expect, it } from "vitest";
import * as gamification from "@/features/gamification";

describe("@/features/gamification public API (GAM-002 AC8, GAM-003 AC1, GAM-004, GAM-006)", () => {
  it.each([
    "calculateXp",
    "computeLessonXp",
    "deriveXpEvents",
    "isPerfectLesson",
    "totalXp",
    "computeStreak",
    "createFullHearts",
    "refillHearts",
    "loseHearts",
    "viewHearts",
    "computeDailyGoalProgress",
    "dailyGoalFraction",
    "toLocalDate",
    "addDays",
    "localDateToDayNumber",
    "dayNumberToLocalDate",
    "computeUserProgress",
    "nextLocalDateChange",
    "msUntilNextLocalDate",
    "getStreakStatus",
    "didExtendStreak",
    "formatStreakDays",
    "goalValueText",
    "goalValueTextForScreenReaders",
    "goalHint",
    "progressQuery",
    "heartsQuery",
    "settingsQuery",
    "useLocalToday",
    "useProgressInputs",
    "useUserProgress",
    "useStreak",
    "DailyGoalRing",
  ])("exports %s", (name) => {
    expect(typeof (gamification as Record<string, unknown>)[name]).toBe("function");
  });
});
