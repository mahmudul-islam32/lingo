import { describe, expect, it } from "vitest";
import * as gamification from "@/features/gamification";

describe("@/features/gamification public API (AC8)", () => {
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
  ])("exports %s", (name) => {
    expect(typeof (gamification as Record<string, unknown>)[name]).toBe("function");
  });
});
