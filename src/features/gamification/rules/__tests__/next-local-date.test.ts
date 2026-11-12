import { describe, expect, it } from "vitest";
import {
  MAX_LOCAL_DATE_TIMER_MS,
  msUntilNextLocalDate,
  nextLocalDateChange,
  toLocalDate,
} from "@/features/gamification";

const MIN = 60 * 1000;
const HOUR = 60 * MIN;

describe("nextLocalDateChange (GAM-003 useLocalToday)", () => {
  it.each([
    // [timezone, now (UTC), expected first instant of the next local date (UTC)]
    ["Europe/Berlin", "2026-11-07T22:59:30.000Z", "2026-11-07T23:00:00.000Z"], // CET +1
    ["Europe/Berlin", "2026-07-01T12:00:00.000Z", "2026-07-01T22:00:00.000Z"], // CEST +2
    ["America/Los_Angeles", "2026-11-08T07:59:00.000Z", "2026-11-08T08:00:00.000Z"], // PST -8
    ["Asia/Kolkata", "2026-11-07T12:00:00.000Z", "2026-11-07T18:30:00.000Z"], // +5:30
    ["Asia/Kathmandu", "2026-11-07T12:00:00.000Z", "2026-11-07T18:15:00.000Z"], // +5:45
    ["UTC", "2026-12-31T23:59:59.999Z", "2027-01-01T00:00:00.000Z"], // last ms of the year
  ])("%s at %s → %s", (tz, now, expected) => {
    expect(nextLocalDateChange(new Date(now), tz).toISOString()).toBe(expected);
  });

  it("exactly at midnight, the next change is a full day later", () => {
    const midnight = new Date("2026-11-07T23:00:00.000Z"); // 00:00 Nov 8 in Berlin
    expect(nextLocalDateChange(midnight, "Europe/Berlin").toISOString()).toBe(
      "2026-11-08T23:00:00.000Z",
    );
  });

  it.each([
    // DST days: 23 h and 25 h long.
    ["America/Los_Angeles", "2026-03-08T08:30:00.000Z", 22.5 * HOUR], // spring forward
    ["America/Los_Angeles", "2026-11-01T07:30:00.000Z", 24.5 * HOUR], // fall back
    ["Europe/Berlin", "2026-03-28T23:30:00.000Z", 22.5 * HOUR], // 29 Mar, 23 h
    ["Europe/Berlin", "2026-10-24T22:30:00.000Z", 24.5 * HOUR], // 25 Oct, 25 h
  ])("DST: %s from %s waits the real day length", (tz, now, delay) => {
    const start = new Date(now);
    expect(nextLocalDateChange(start, tz).getTime() - start.getTime()).toBe(delay);
  });

  it.each([
    "Europe/Berlin",
    "America/Los_Angeles",
    "America/Santiago",
    "Australia/Lord_Howe",
    "Pacific/Apia",
  ])("%s: the change is the first instant of a new date, all year", (tz) => {
    for (let day = 0; day < 365; day += 7) {
      const now = new Date(Date.UTC(2026, 0, 1) + day * 24 * HOUR + 13 * MIN);
      const change = nextLocalDateChange(now, tz);
      expect(toLocalDate(change, tz)).not.toBe(toLocalDate(now, tz));
      expect(toLocalDate(new Date(change.getTime() - 1), tz)).toBe(toLocalDate(now, tz));
    }
  });

  it("throws RangeError for an unknown timezone", () => {
    expect(() => nextLocalDateChange(new Date(), "Mars/Olympus")).toThrow(RangeError);
  });
});

describe("msUntilNextLocalDate", () => {
  it("is the delay to the next local date", () => {
    expect(msUntilNextLocalDate(new Date("2026-11-07T22:59:30.000Z"), "Europe/Berlin")).toBe(
      30_000,
    );
  });

  it("caps a 25 h day at 24 h (the caller re-checks)", () => {
    expect(msUntilNextLocalDate(new Date("2026-11-01T07:30:00.000Z"), "America/Los_Angeles")).toBe(
      MAX_LOCAL_DATE_TIMER_MS,
    );
  });

  it("is at least 1 ms", () => {
    expect(msUntilNextLocalDate(new Date("2026-11-07T22:59:59.999Z"), "Europe/Berlin")).toBe(1);
  });
});
