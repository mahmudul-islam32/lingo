import { describe, expect, it } from "vitest";
import { addDays, dayNumberToLocalDate, localDateToDayNumber, toLocalDate } from "../local-date";

describe("localDateToDayNumber / dayNumberToLocalDate", () => {
  it.each([
    ["1970-01-01", 0],
    ["1970-01-02", 1],
    ["1969-12-31", -1],
    ["2026-11-07", 20_764],
  ])("%s <-> %i", (date, day) => {
    expect(localDateToDayNumber(date)).toBe(day);
    expect(dayNumberToLocalDate(day)).toBe(date);
  });

  it.each([
    "2026-02-30",
    "2026-13-01",
    "2026-00-10",
    "2025-02-29",
    "2026-1-01",
    "20261107",
    "",
    "2026-11-07T00:00",
  ])("rejects invalid date %j", (date) => {
    expect(() => localDateToDayNumber(date)).toThrow(RangeError);
  });

  it("accepts leap days", () => {
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(addDays("2028-02-29", 1)).toBe("2028-03-01");
    expect(addDays("2026-02-28", 1)).toBe("2026-03-01");
  });
});

describe("addDays", () => {
  it("crosses month and year boundaries", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2027-01-01", -1)).toBe("2026-12-31");
    expect(addDays("2026-11-07", 0)).toBe("2026-11-07");
    expect(addDays("2026-11-07", -365)).toBe("2025-11-07");
  });

  it("is unaffected by DST transition days", () => {
    // EU DST ends 2026-10-25, US DST ends 2026-11-01, EU starts 2026-03-29.
    expect(addDays("2026-10-24", 1)).toBe("2026-10-25");
    expect(addDays("2026-10-25", 1)).toBe("2026-10-26");
    expect(addDays("2026-11-01", -1)).toBe("2026-10-31");
    expect(addDays("2026-03-29", 1)).toBe("2026-03-30");
    expect(addDays("2026-03-30", -1)).toBe("2026-03-29");
  });
});

describe("toLocalDate (device-local day boundary)", () => {
  it("one instant falls on different dates in different timezones", () => {
    const instant = new Date("2026-11-07T23:30:00.000Z");
    expect(toLocalDate(instant, "UTC")).toBe("2026-11-07");
    expect(toLocalDate(instant, "Europe/Berlin")).toBe("2026-11-08");
    expect(toLocalDate(instant, "Asia/Tokyo")).toBe("2026-11-08");
    expect(toLocalDate(instant, "America/Los_Angeles")).toBe("2026-11-07");
    expect(toLocalDate(instant, "Pacific/Kiritimati")).toBe("2026-11-08"); // UTC+14
    expect(toLocalDate(new Date("2026-11-08T10:30:00.000Z"), "Pacific/Pago_Pago")).toBe(
      "2026-11-07",
    ); // UTC-11
  });

  it("handles half- and quarter-hour offsets", () => {
    expect(toLocalDate(new Date("2026-11-07T18:29:59.999Z"), "Asia/Kolkata")).toBe("2026-11-07");
    expect(toLocalDate(new Date("2026-11-07T18:30:00.000Z"), "Asia/Kolkata")).toBe("2026-11-08");
    expect(toLocalDate(new Date("2026-11-07T18:15:00.000Z"), "Asia/Kathmandu")).toBe("2026-11-08");
    expect(toLocalDate(new Date("2026-11-07T18:14:59.999Z"), "Asia/Kathmandu")).toBe("2026-11-07");
  });

  it("splits exactly at local midnight", () => {
    // Berlin is UTC+1 in November: local midnight = 23:00Z.
    expect(toLocalDate(new Date("2026-11-07T22:59:59.999Z"), "Europe/Berlin")).toBe("2026-11-07");
    expect(toLocalDate(new Date("2026-11-07T23:00:00.000Z"), "Europe/Berlin")).toBe("2026-11-08");
  });

  it("stays correct around DST transitions", () => {
    // New York falls back 2026-11-01 02:00 EDT -> 01:00 EST (06:00Z).
    expect(toLocalDate(new Date("2026-11-01T04:30:00.000Z"), "America/New_York")).toBe(
      "2026-11-01",
    ); // 00:30 EDT
    expect(toLocalDate(new Date("2026-11-01T03:59:59.999Z"), "America/New_York")).toBe(
      "2026-10-31",
    ); // 23:59 EDT
    expect(toLocalDate(new Date("2026-11-02T04:59:59.999Z"), "America/New_York")).toBe(
      "2026-11-01",
    ); // 23:59 EST
    expect(toLocalDate(new Date("2026-11-02T05:00:00.000Z"), "America/New_York")).toBe(
      "2026-11-02",
    ); // 00:00 EST
    // Berlin springs forward 2026-03-29 02:00 CET -> 03:00 CEST.
    expect(toLocalDate(new Date("2026-03-28T22:59:59.999Z"), "Europe/Berlin")).toBe("2026-03-28");
    expect(toLocalDate(new Date("2026-03-28T23:00:00.000Z"), "Europe/Berlin")).toBe("2026-03-29");
    expect(toLocalDate(new Date("2026-03-29T21:59:59.999Z"), "Europe/Berlin")).toBe("2026-03-29"); // 23:59 CEST
    expect(toLocalDate(new Date("2026-03-29T22:00:00.000Z"), "Europe/Berlin")).toBe("2026-03-30");
  });

  it("handles year boundaries", () => {
    expect(toLocalDate(new Date("2026-12-31T23:30:00.000Z"), "Asia/Tokyo")).toBe("2027-01-01");
    expect(toLocalDate(new Date("2027-01-01T03:00:00.000Z"), "America/Chicago")).toBe("2026-12-31");
  });

  it("does not depend on the process timezone", () => {
    const instant = new Date("2026-11-07T23:30:00.000Z");
    const before = process.env.TZ;
    process.env.TZ = "Pacific/Honolulu";
    try {
      expect(toLocalDate(instant, "Europe/Berlin")).toBe("2026-11-08");
    } finally {
      process.env.TZ = before;
    }
  });

  it("throws on an unknown timezone or an invalid instant", () => {
    expect(() => toLocalDate(new Date("2026-11-07T00:00:00.000Z"), "Mars/Olympus_Mons")).toThrow(
      RangeError,
    );
    expect(() => toLocalDate(new Date("not a date"), "UTC")).toThrow(RangeError);
  });
});
