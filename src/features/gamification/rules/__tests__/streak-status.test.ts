import { describe, expect, it } from "vitest";
import { StreakStateSchema, type StreakState } from "@/contracts";
import {
  computeStreak,
  didExtendStreak,
  formatStreakDays,
  getStreakStatus,
  type StreakStatus,
} from "@/features/gamification";

function streak(s: Partial<StreakState>): StreakState {
  return StreakStateSchema.parse({
    current: 0,
    longest: 0,
    lastActiveDate: null,
    extendedToday: false,
    ...s,
  });
}

describe("getStreakStatus (GAM-004 AC1)", () => {
  it.each<[string, StreakState, StreakStatus]>([
    ["never completed a lesson", streak({}), "none"],
    [
      "finished a lesson today",
      streak({ current: 3, longest: 5, lastActiveDate: "2026-11-07", extendedToday: true }),
      "extended",
    ],
    [
      "first lesson ever, today",
      streak({ current: 1, longest: 1, lastActiveDate: "2026-11-07", extendedToday: true }),
      "extended",
    ],
    [
      "finished yesterday, not yet today",
      streak({ current: 3, longest: 3, lastActiveDate: "2026-11-06" }),
      "at_risk",
    ],
    [
      "missed a full day",
      streak({ current: 0, longest: 4, lastActiveDate: "2026-11-05" }),
      "broken",
    ],
  ])("%s → %s", (_, input, expected) => {
    expect(getStreakStatus(input)).toBe(expected);
  });

  it.each<[string[], StreakStatus]>([
    [[], "none"],
    [["2026-11-07"], "extended"],
    [["2026-11-06"], "at_risk"],
    [["2026-11-05"], "broken"],
  ])("from computeStreak(%j, today) → %s", (dates, expected) => {
    expect(getStreakStatus(computeStreak(dates, "2026-11-07"))).toBe(expected);
  });
});

describe("didExtendStreak (GAM-004 AC2)", () => {
  const TODAY = "2026-11-07";
  it.each<[string, string[], string[], boolean]>([
    ["first lesson today", ["2026-11-06"], ["2026-11-06", TODAY], true],
    ["second lesson today", [TODAY], [TODAY], false],
    ["first lesson ever", [], [TODAY], true],
    ["lesson after a broken streak", ["2026-11-04"], ["2026-11-04", TODAY], true],
  ])("%s → %s", (_, before, after, expected) => {
    expect(didExtendStreak(computeStreak(before, TODAY), computeStreak(after, TODAY))).toBe(
      expected,
    );
  });

  it("is false when nothing was extended", () => {
    expect(didExtendStreak({ extendedToday: false }, { extendedToday: false })).toBe(false);
  });
});

describe("formatStreakDays (GAM-004 AC3)", () => {
  it.each([
    [0, "0 days"],
    [1, "1 day"],
    [2, "2 days"],
    [365, "365 days"],
  ])("%i → %s", (n, text) => {
    expect(formatStreakDays(n)).toBe(text);
  });
});
