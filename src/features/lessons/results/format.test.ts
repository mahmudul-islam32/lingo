import { describe, expect, it } from "vitest";
import { accuracyPercent, formatAccuracy, formatDuration } from "./format";

describe("formatDuration", () => {
  it.each([
    [0, "0:00"],
    [999, "0:00"],
    [1_000, "0:01"],
    [9_000, "0:09"],
    [59_999, "0:59"],
    [60_000, "1:00"],
    [187_000, "3:07"],
    [187_900, "3:07"],
    [600_000, "10:00"],
    [3_900_000, "65:00"],
  ])("%d ms → %s", (ms, text) => {
    expect(formatDuration(ms)).toBe(text);
  });

  it.each([-5_000, Number.NaN, Number.POSITIVE_INFINITY])("%d → 0:00", (ms) => {
    expect(formatDuration(ms)).toBe("0:00");
  });
});

describe("accuracyPercent / formatAccuracy", () => {
  it.each([
    [1, 100],
    [0, 0],
    [0.8, 80],
    [2 / 3, 67],
    [1 / 3, 33],
    [0.005, 1],
    [0.004, 0],
    [0.995, 100],
  ])("%d → %d", (accuracy, percent) => {
    expect(accuracyPercent(accuracy)).toBe(percent);
  });

  it("clamps out-of-range and non-finite input", () => {
    expect(accuracyPercent(1.5)).toBe(100);
    expect(accuracyPercent(-0.2)).toBe(0);
    expect(accuracyPercent(Number.NaN)).toBe(0);
  });

  it('shows "N %"', () => {
    expect(formatAccuracy(1)).toBe("100 %");
    expect(formatAccuracy(0.8)).toBe("80 %");
  });
});
