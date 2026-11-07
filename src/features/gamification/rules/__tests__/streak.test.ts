import { describe, expect, it } from "vitest";
import { StreakStateSchema } from "@/contracts";
import { computeStreak } from "../streak";
import { toLocalDate } from "../local-date";

const TODAY = "2026-11-07";

function streak(dates: string[], today = TODAY) {
  const state = computeStreak(dates, today);
  expect(() => StreakStateSchema.parse(state)).not.toThrow();
  return state;
}

describe("computeStreak", () => {
  it("no activity -> empty streak", () => {
    expect(streak([])).toEqual({
      current: 0,
      longest: 0,
      lastActiveDate: null,
      extendedToday: false,
    });
  });

  it("first lesson today starts a streak of 1", () => {
    expect(streak([TODAY])).toEqual({
      current: 1,
      longest: 1,
      lastActiveDate: TODAY,
      extendedToday: true,
    });
  });

  it("several lessons on the same day count once", () => {
    expect(streak([TODAY, TODAY, TODAY])).toEqual({
      current: 1,
      longest: 1,
      lastActiveDate: TODAY,
      extendedToday: true,
    });
  });

  it("extends on the first lesson of a new day", () => {
    const before = streak(["2026-11-05", "2026-11-06"]);
    expect(before).toMatchObject({ current: 2, extendedToday: false });
    const after = streak(["2026-11-05", "2026-11-06", TODAY]);
    expect(after).toMatchObject({ current: 3, longest: 3, extendedToday: true });
    // A second lesson the same day does not extend it again.
    expect(streak(["2026-11-05", "2026-11-06", TODAY, TODAY])).toEqual(after);
  });

  it("activity yesterday but not yet today keeps the streak alive", () => {
    expect(streak(["2026-11-04", "2026-11-05", "2026-11-06"])).toEqual({
      current: 3,
      longest: 3,
      lastActiveDate: "2026-11-06",
      extendedToday: false,
    });
  });

  it("resets to 0 after one fully missed day", () => {
    expect(streak(["2026-11-04", "2026-11-05"])).toEqual({
      current: 0,
      longest: 2,
      lastActiveDate: "2026-11-05",
      extendedToday: false,
    });
  });

  it("restarts at 1 when a lesson is done after a missed day", () => {
    expect(streak(["2026-11-03", "2026-11-04", "2026-11-05", TODAY])).toEqual({
      current: 1,
      longest: 3,
      lastActiveDate: TODAY,
      extendedToday: true,
    });
  });

  it("many missed days", () => {
    expect(streak(["2026-01-01"])).toMatchObject({
      current: 0,
      longest: 1,
      lastActiveDate: "2026-01-01",
    });
  });

  it("longest is the best run ever, current is the latest run", () => {
    const dates = [
      "2026-10-01",
      "2026-10-02",
      "2026-10-03",
      "2026-10-04",
      "2026-10-05", // 5
      "2026-10-10",
      "2026-10-11", // 2
      "2026-11-05",
      "2026-11-06",
      TODAY, // 3
    ];
    expect(streak(dates)).toMatchObject({ current: 3, longest: 5 });
  });

  it("current can equal longest", () => {
    expect(streak(["2026-10-01", "2026-11-06", TODAY])).toMatchObject({ current: 2, longest: 2 });
  });

  it("is order-independent", () => {
    const dates = ["2026-11-06", "2026-11-04", TODAY, "2026-11-05", "2026-11-04"];
    expect(streak(dates)).toEqual(streak([...dates].reverse()));
    expect(streak(dates)).toMatchObject({ current: 4, longest: 4 });
  });

  it("does not mutate the input", () => {
    const dates = Object.freeze(["2026-11-06", "2026-11-05"]);
    computeStreak(dates, TODAY);
    expect(dates).toEqual(["2026-11-06", "2026-11-05"]);
  });

  describe("calendar boundaries", () => {
    it("across a month boundary", () => {
      expect(streak(["2026-10-30", "2026-10-31", "2026-11-01"], "2026-11-01")).toMatchObject({
        current: 3,
      });
    });

    it("across a year boundary", () => {
      expect(streak(["2026-12-30", "2026-12-31", "2027-01-01"], "2027-01-01")).toMatchObject({
        current: 3,
      });
      expect(streak(["2026-12-31"], "2027-01-01")).toMatchObject({
        current: 1,
        extendedToday: false,
      });
    });

    it("across Feb 28 -> Mar 1 (non-leap) and Feb 29 (leap)", () => {
      expect(streak(["2026-02-28", "2026-03-01"], "2026-03-01")).toMatchObject({ current: 2 });
      expect(streak(["2028-02-28", "2028-03-01"], "2028-03-01")).toMatchObject({
        current: 1,
        longest: 1,
      });
      expect(streak(["2028-02-28", "2028-02-29", "2028-03-01"], "2028-03-01")).toMatchObject({
        current: 3,
      });
    });

    it("across DST change days (23 h and 25 h local days)", () => {
      // US fall back 2026-11-01, EU fall back 2026-10-25, EU spring forward 2026-03-29.
      expect(streak(["2026-10-31", "2026-11-01", "2026-11-02"], "2026-11-02")).toMatchObject({
        current: 3,
      });
      expect(streak(["2026-10-24", "2026-10-25", "2026-10-26"], "2026-10-26")).toMatchObject({
        current: 3,
      });
      expect(streak(["2026-03-28", "2026-03-29", "2026-03-30"], "2026-03-30")).toMatchObject({
        current: 3,
      });
      expect(streak(["2026-03-28", "2026-03-29"], "2026-03-30")).toMatchObject({
        current: 2,
        extendedToday: false,
      });
    });
  });

  describe("midnight and timezones (dates come from toLocalDate on the device)", () => {
    it("a lesson at 23:59 and one at 00:01 local are two consecutive days", () => {
      const tz = "Europe/Berlin";
      const d1 = toLocalDate(new Date("2026-11-06T22:59:00.000Z"), tz); // 23:59 on the 6th
      const d2 = toLocalDate(new Date("2026-11-06T23:01:00.000Z"), tz); // 00:01 on the 7th
      expect([d1, d2]).toEqual(["2026-11-06", "2026-11-07"]);
      expect(streak([d1, d2], d2)).toMatchObject({ current: 2, extendedToday: true });
    });

    it("the same UTC day can be two local days (and vice versa)", () => {
      const tz = "America/Los_Angeles"; // UTC-8 in November
      const d1 = toLocalDate(new Date("2026-11-07T07:30:00.000Z"), tz); // 23:30 on the 6th
      const d2 = toLocalDate(new Date("2026-11-07T08:30:00.000Z"), tz); // 00:30 on the 7th
      expect(streak([d1, d2], "2026-11-07")).toMatchObject({ current: 2 });
    });

    it("streak is alive until local midnight ends today, then breaks", () => {
      const tz = "Asia/Tokyo";
      const dates = ["2026-11-05", "2026-11-06"];
      const lateToday = toLocalDate(new Date("2026-11-07T14:59:59.999Z"), tz); // 23:59:59.999 on the 7th
      const tomorrow = toLocalDate(new Date("2026-11-07T15:00:00.000Z"), tz); // 00:00 on the 8th
      expect(streak(dates, lateToday)).toMatchObject({ current: 2 });
      expect(streak(dates, tomorrow)).toMatchObject({ current: 0, longest: 2 });
    });

    it("travelling east (a day is skipped on the calendar) can break a streak", () => {
      // Lesson in Los Angeles on Nov 6 evening, fly to Tokyo, next lesson is Nov 8 local.
      expect(streak(["2026-11-06", "2026-11-08"], "2026-11-08")).toMatchObject({
        current: 1,
        longest: 1,
      });
    });

    it("travelling west repeats a date: still counts once", () => {
      expect(streak(["2026-11-06", "2026-11-07", "2026-11-07"], "2026-11-07")).toMatchObject({
        current: 2,
      });
    });

    it("ignores dates after today (timezone change westwards or clock moved back)", () => {
      // A lesson done in Tokyo on Nov 8, now back in Los Angeles where it is Nov 7.
      expect(streak(["2026-11-06", "2026-11-08"], "2026-11-07")).toEqual({
        current: 1,
        longest: 1,
        lastActiveDate: "2026-11-06",
        extendedToday: false,
      });
      expect(streak(["2026-11-08"], "2026-11-07")).toEqual({
        current: 0,
        longest: 0,
        lastActiveDate: null,
        extendedToday: false,
      });
      // Once the device date catches up, the date counts again.
      expect(streak(["2026-11-06", "2026-11-07", "2026-11-08"], "2026-11-08")).toMatchObject({
        current: 3,
      });
    });
  });

  it("throws on malformed dates", () => {
    expect(() => computeStreak(["2026-11-31"], TODAY)).toThrow(RangeError);
    expect(() => computeStreak([TODAY], "07/11/2026")).toThrow(RangeError);
  });
});
