import { describe, expect, it } from "vitest";
import { weekStartOf, weeklyXp } from "../weekly-xp";

const r = (localDate: string, xpEarned = 10) => ({ localDate, xpEarned });

describe("weekStartOf (GAM-012)", () => {
  it.each([
    ["2026-11-16", "2026-11-16"], // Monday
    ["2026-11-19", "2026-11-16"], // Thursday
    ["2026-11-22", "2026-11-16"], // Sunday
    ["2026-11-23", "2026-11-23"], // next Monday
    ["1970-01-01", "1969-12-29"], // day 0, a Thursday
    ["2027-01-01", "2026-12-28"], // across a year end
    ["2024-03-01", "2024-02-26"], // across a leap February
  ])("%s → %s", (date, monday) => {
    expect(weekStartOf(date)).toBe(monday);
  });

  it("DST weeks have seven calendar days too (Europe: 2026-03-29, 2026-10-25)", () => {
    expect(weekStartOf("2026-03-29")).toBe("2026-03-23");
    expect(weekStartOf("2026-10-25")).toBe("2026-10-19");
    expect(weekStartOf("2026-10-26")).toBe("2026-10-26");
  });
});

describe("weeklyXp (GAM-012)", () => {
  it("is 0 without results", () => {
    expect(weeklyXp([], "2026-11-19")).toBe(0);
  });

  it("sums Monday to today, replays included", () => {
    const results = [
      r("2026-11-16", 15),
      r("2026-11-18", 10),
      r("2026-11-19", 10),
      r("2026-11-19", 15),
    ];
    expect(weeklyXp(results, "2026-11-19")).toBe(50);
  });

  it("ignores last week (Sunday before midnight) and results after today", () => {
    const results = [r("2026-11-15", 99), r("2026-11-16", 10), r("2026-11-20", 99)];
    expect(weeklyXp(results, "2026-11-19")).toBe(10);
  });

  it("resets on Monday: Sunday's XP belongs to the old week", () => {
    const results = [r("2026-11-22", 20), r("2026-11-23", 10)];
    expect(weeklyXp(results, "2026-11-22")).toBe(20);
    expect(weeklyXp(results, "2026-11-23")).toBe(10);
  });

  it("uses the stored local date, never the instant: a timezone change moves nothing", () => {
    // Saved as Sunday 2026-11-22 (local date at completion). After flying west, "today"
    // is still Sunday: it counts; once the device's today is Monday, it doesn't.
    expect(weeklyXp([r("2026-11-22", 10)], "2026-11-22")).toBe(10);
    expect(weeklyXp([r("2026-11-22", 10)], "2026-11-23")).toBe(0);
  });
});
