import { describe, expect, it } from "vitest";
import type { LessonResult } from "@/contracts";
import {
  chartMax,
  dayXpLabel,
  weekdayIndex,
  weeklyXpByDay,
  weekStart,
} from "../weekly-xp/weekly-xp";

const result = (localDate: string, xpEarned: number): LessonResult =>
  ({ localDate, xpEarned }) as LessonResult;

describe("weekly XP (PLT-026 AC 12)", () => {
  it("knows the weekday, Monday first", () => {
    expect(weekdayIndex("2026-11-16")).toBe(0); // Monday
    expect(weekdayIndex("2026-11-19")).toBe(3); // Thursday
    expect(weekdayIndex("2026-11-22")).toBe(6); // Sunday
    expect(weekdayIndex("1969-12-29")).toBe(0); // before the epoch
    expect(weekStart("2026-11-22")).toBe("2026-11-16");
    expect(weekStart("2026-11-16")).toBe("2026-11-16");
  });

  it("sums xpEarned per local date for Mon–Sun of the current week only", () => {
    const days = weeklyXpByDay(
      [
        result("2026-11-16", 10),
        result("2026-11-18", 15),
        result("2026-11-18", 25),
        result("2026-11-19", 12),
        result("2026-11-15", 99), // last week's Sunday
        result("2026-11-23", 99), // next week
      ],
      "2026-11-19",
    );
    expect(days.map((d) => d.name)).toEqual([
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ]);
    expect(days.map((d) => d.initial).join("")).toBe("MTWTFSS");
    expect(days.map((d) => d.xp)).toEqual([10, 0, 40, 12, 0, 0, 0]);
    expect(days.map((d) => d.isToday)).toEqual([false, false, false, true, false, false, false]);
    expect(days.filter((d) => d.isFuture).map((d) => d.date)).toEqual([
      "2026-11-20",
      "2026-11-21",
      "2026-11-22",
    ]);
    expect(dayXpLabel(days[2]!)).toBe("Wednesday, 40 XP");
  });

  it("gives 7 empty days without results, and the scale is never 0", () => {
    const days = weeklyXpByDay([], "2026-11-22");
    expect(days).toHaveLength(7);
    expect(days.every((d) => d.xp === 0)).toBe(true);
    expect(days[6]!.isToday).toBe(true);
    expect(chartMax(days, 20)).toBe(20);
    expect(chartMax(weeklyXpByDay([result("2026-11-17", 45)], "2026-11-19"), 20)).toBe(45);
  });
});
