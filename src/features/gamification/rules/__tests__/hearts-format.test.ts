import { describe, expect, it } from "vitest";
import type { HeartsView } from "@/contracts";
import { formatHeartRefill, formatHeartsFull, formatRoundedDuration } from "../hearts-format";

const NOW = new Date("2026-11-08T10:00:00.000Z");
const S = 1000;
const MIN = 60 * S;
const H = 60 * MIN;
const at = (ms: number) => new Date(NOW.getTime() + ms).toISOString();

function view(nextInMs: number | null, fullInMs: number | null = nextInMs): HeartsView {
  return {
    current: nextInMs === null ? 5 : 3,
    max: 5,
    nextRefillAt: nextInMs === null ? null : at(nextInMs),
    fullAt: fullInMs === null ? null : at(fullInMs),
    canStartLesson: true,
  };
}

describe("formatRoundedDuration", () => {
  it.each([
    [0, "less than a minute"],
    [-5 * S, "less than a minute"],
    [59 * S, "less than a minute"],
    [59 * S + 999, "less than a minute"],
    [60 * S, "1 min"],
    [60 * S + 1, "2 min"],
    [12 * MIN + 30 * S, "13 min"],
    [59 * MIN, "59 min"],
    [59 * MIN + 1 * S, "1 h"],
    [H, "1 h"],
    [H + 1, "1 h 1 min"],
    [3 * H + 12 * MIN, "3 h 12 min"],
    [3 * H + 11 * MIN + 1 * S, "3 h 12 min"],
    [4 * H, "4 h"],
    [Number.NaN, "less than a minute"],
  ])("%d ms -> %s", (ms, text) => {
    expect(formatRoundedDuration(ms)).toBe(text);
  });
});

describe("formatHeartRefill (AC 9)", () => {
  it("is null when hearts are full", () => {
    expect(formatHeartRefill(view(null), NOW)).toBeNull();
  });

  it.each([
    [59 * S, "Next heart in less than a minute"],
    [60 * S, "Next heart in 1 min"],
    [59 * MIN + 1 * S, "Next heart in 1 h"],
    [H, "Next heart in 1 h"],
    [3 * H + 12 * MIN, "Next heart in 3 h 12 min"],
  ])("%d ms left -> %s", (ms, text) => {
    expect(formatHeartRefill(view(ms, 4 * H), NOW)).toBe(text);
  });
});

describe("formatHeartsFull (AC 10)", () => {
  it("is null when hearts are full", () => {
    expect(formatHeartsFull(view(null), NOW)).toBeNull();
  });

  it.each([
    [59 * S, "Full in less than a minute"],
    [60 * S, "Full in 1 min"],
    [59 * MIN + 1 * S, "Full in 1 h"],
    [H, "Full in 1 h"],
    [3 * H + 12 * MIN, "Full in 3 h 12 min"],
  ])("%d ms until full -> %s", (ms, text) => {
    expect(formatHeartsFull(view(30 * S, ms), NOW)).toBe(text);
  });
});
