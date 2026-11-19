import { describe, expect, it } from "vitest";
import * as gamification from "@/features/gamification";

describe("@/features/gamification top bar + streak Lumi API (GAM-007, GAM-009)", () => {
  it.each([
    "GamificationTopBar",
    "HeartsDialog",
    "StreakFlameIcon",
    "StreakLumi",
    "lumiPoseForStreak",
    "streakMessage",
    "streakAccessibleName",
    "formatStreakAdjective",
    "heartsRuleText",
  ])("exports %s", (name) => {
    expect(typeof (gamification as Record<string, unknown>)[name]).toBe("function");
  });
});

describe("@/features/gamification tabs API (GAM-012)", () => {
  it.each(["LeaguesScreen", "useActiveCourseId", "weeklyXp", "weekStartOf", "courseChip"])(
    "exports %s",
    (name) => {
      expect(typeof (gamification as Record<string, unknown>)[name]).toBe("function");
    },
  );
});
